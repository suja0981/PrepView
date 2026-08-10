import { env } from "../../config/env";
import { User } from "../user/user.model";
import { PaymentLog } from "./payment.model";
import { AppError } from "../../shared/errors/app-error";
import crypto from "crypto";

export const paymentService = {
  /**
   * Prepares a Razorpay Subscription / Order for Premium plan upgrade.
   */
  async createCheckoutSession(userId: string, userEmail: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.plan === "premium") throw new AppError("You are already on the Premium plan", 400);

    return {
      keyId: env.RAZORPAY_KEY_ID,
      planId: env.RAZORPAY_PLAN_ID,
      userEmail,
      userName: user.name,
      currency: "INR",
      amount: 79900, // ₹799 in paise (or $9 equivalent)
    };
  },

  /**
   * Handles user self-service billing / portal operations.
   */
  async createPortalSession(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (!user.razorpayCustomerId && !user.razorpaySubscriptionId) {
      throw new AppError("No active billing account found. Subscribe first.", 400);
    }

    return `${env.CLIENT_URL}/dashboard`;
  },

  /**
   * Handles incoming Razorpay webhook events after signature verification.
   */
  async handleWebhook(event: any, signature: string, rawBody: Buffer): Promise<void> {
    // Verify Razorpay Webhook Signature
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new AppError("Invalid Razorpay webhook signature", 400);
    }

    const eventType = event.event;
    const payload = event.payload;

    switch (eventType) {
      case "subscription.charged":
      case "payment.captured": {
        const paymentEntity = payload?.payment?.entity || payload?.subscription?.entity;
        const notes = paymentEntity?.notes || {};
        const userId = notes.userId;

        if (userId) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          await User.findByIdAndUpdate(userId, {
            plan: "premium",
            razorpaySubscriptionId: paymentEntity?.id || null,
            planExpiresAt: expiresAt,
          });

          await PaymentLog.create({
            userId,
            eventId: event.created_at ? `${eventType}_${event.created_at}` : `rzp_${Date.now()}`,
            type: eventType,
            status: "success",
            meta: { paymentId: paymentEntity?.id },
          });
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.halted": {
        const subEntity = payload?.subscription?.entity;
        const userId = subEntity?.notes?.userId;

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            plan: "free",
            razorpaySubscriptionId: null,
            planExpiresAt: null,
          });

          await PaymentLog.create({
            userId,
            eventId: event.created_at ? `${eventType}_${event.created_at}` : `rzp_${Date.now()}`,
            type: eventType,
            status: "success",
          });
        }
        break;
      }

      default:
        break;
    }
  },
};
