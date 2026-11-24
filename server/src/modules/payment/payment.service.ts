import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../../config/env";
import { User } from "../user/user.model";
import { PaymentLog } from "./payment.model";
import { AppError } from "../../shared/errors/app-error";

const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const paymentService = {
  /**
   * Creates a Razorpay Subscription (if plan ID is configured) or Order for ₹799 ($9 equivalent) Premium plan.
   */
  async createCheckoutSession(userId: string, userEmail: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.plan === "premium") throw new AppError("You are already on the Premium plan", 400);

    // If a valid RAZORPAY_PLAN_ID is provided, attempt to create a Razorpay subscription
    if (env.RAZORPAY_PLAN_ID && env.RAZORPAY_PLAN_ID !== "plan_placeholder") {
      try {
        const subscription = await (razorpayInstance.subscriptions as any).create({
          plan_id: env.RAZORPAY_PLAN_ID,
          customer_notify: 1,
          total_count: 12,
          notes: {
            userId,
            userEmail,
          },
        });

        return {
          subscriptionId: subscription.id,
          keyId: env.RAZORPAY_KEY_ID,
          amount: 79900,
          currency: "INR",
          userName: user.name,
          userEmail,
        };
      } catch (err) {
        console.warn("Failed to create Razorpay subscription, falling back to one-time order:", err);
      }
    }

    const orderOptions = {
      amount: 79900, // ₹799 in paise
      currency: "INR",
      receipt: `rcpt_${userId.slice(-6)}_${Date.now().toString().slice(-6)}`,
      notes: {
        userId,
        userEmail,
      },
    };

    const order = await razorpayInstance.orders.create(orderOptions);

    return {
      orderId: order.id,
      keyId: env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      userName: user.name,
      userEmail,
    };
  },

  /**
   * Verifies Razorpay payment HMAC signature from client checkout modal.
   */
  async verifyPayment(
    userId: string,
    paymentData: { orderId: string; paymentId: string; signature: string },
  ) {
    const { orderId, paymentId, signature } = paymentData;

    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new AppError("Invalid payment signature verification", 400);
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await User.findByIdAndUpdate(userId, {
      plan: "premium",
      razorpaySubscriptionId: paymentId,
      planExpiresAt: expiresAt,
    });

    await PaymentLog.create({
      userId,
      eventId: `pay_${paymentId}`,
      type: "payment.captured",
      status: "success",
      meta: { orderId, paymentId },
    });

    return { success: true };
  },

  /**
   * Handles user self-service billing / portal operations (cancellation).
   */
  async createPortalSession(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.plan === "premium") {
      // Cancel active subscription via Razorpay API if subscription ID exists
      if (user.razorpaySubscriptionId) {
        try {
          await (razorpayInstance.subscriptions as any).cancel(user.razorpaySubscriptionId);
        } catch (err) {
          console.warn("Could not cancel Razorpay subscription remotely:", err);
        }
      }

      await User.findByIdAndUpdate(userId, {
        plan: "free",
        razorpaySubscriptionId: null,
        planExpiresAt: null,
      });

      await PaymentLog.create({
        userId,
        eventId: `cancel_${Date.now()}`,
        type: "subscription.cancelled",
        status: "success",
      });

      return `${env.CLIENT_URL}/pricing?status=cancelled`;
    }

    return `${env.CLIENT_URL}/pricing`;
  },

  /**
   * Handles incoming Razorpay webhook events after signature verification.
   */
  async handleWebhook(event: any, signature: string, rawBody: Buffer): Promise<void> {
    if (env.RAZORPAY_WEBHOOK_SECRET && env.RAZORPAY_WEBHOOK_SECRET !== "whsec_placeholder") {
      const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        throw new AppError("Invalid Razorpay webhook signature", 400);
      }
    }

    const eventType = event.event;
    const payload = event.payload;

    if (eventType === "subscription.activated") {
      const subscription = payload?.subscription?.entity;
      const userId = subscription?.notes?.userId;
      if (userId) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await User.findByIdAndUpdate(userId, {
          plan: "premium",
          razorpaySubscriptionId: subscription.id,
          planExpiresAt: expiresAt,
        });

        await PaymentLog.create({
          userId,
          eventId: event.created_at ? `${eventType}_${event.created_at}` : `sub_${Date.now()}`,
          type: eventType,
          status: "success",
          meta: { subscriptionId: subscription.id },
        });
      }
    } else if (eventType === "subscription.charged") {
      const subscription = payload?.subscription?.entity;
      const userId = subscription?.notes?.userId;
      if (userId) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await User.findByIdAndUpdate(userId, {
          plan: "premium",
          planExpiresAt: expiresAt,
        });

        await PaymentLog.create({
          userId,
          eventId: event.created_at ? `${eventType}_${event.created_at}` : `sub_charge_${Date.now()}`,
          type: eventType,
          status: "success",
        });
      }
    } else if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.completed" ||
      eventType === "subscription.halted"
    ) {
      const subscription = payload?.subscription?.entity;
      const userId = subscription?.notes?.userId;
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          plan: "free",
          razorpaySubscriptionId: null,
          planExpiresAt: null,
        });

        await PaymentLog.create({
          userId,
          eventId: event.created_at ? `${eventType}_${event.created_at}` : `sub_cancel_${Date.now()}`,
          type: eventType,
          status: "success",
        });
      }
    } else if (eventType === "payment.captured" || eventType === "order.paid") {
      const entity = payload?.payment?.entity || payload?.order?.entity;
      const userId = entity?.notes?.userId;

      if (userId) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await User.findByIdAndUpdate(userId, {
          plan: "premium",
          planExpiresAt: expiresAt,
        });

        await PaymentLog.create({
          userId,
          eventId: event.created_at ? `${eventType}_${event.created_at}` : `rzp_${Date.now()}`,
          type: eventType,
          status: "success",
        });
      }
    }
  },
};
