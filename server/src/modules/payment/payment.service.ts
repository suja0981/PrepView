import Stripe from "stripe";
import { env } from "../../config/env";
import { User } from "../user/user.model";
import { PaymentLog } from "./payment.model";
import { AppError } from "../../shared/errors/app-error";

// Single Stripe client instance shared across all payment operations
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
});

export const paymentService = {
  /**
   * Creates a Stripe Checkout Session for the $9/mo Premium plan.
   * Returns a URL to redirect the user to Stripe's hosted checkout page.
   */
  async createCheckoutSession(userId: string, userEmail: string): Promise<string> {
    // Get or create Stripe Customer so the user can manage their subscription later
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.plan === "premium") throw new AppError("You are already on the Premium plan", 400);

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/payment/cancel`,
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
      },
    });

    return session.url!;
  },

  /**
   * Creates a Stripe Customer Portal session so the user can manage
   * or cancel their subscription without contacting support.
   */
  async createPortalSession(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (!user.stripeCustomerId) {
      throw new AppError("No billing account found. Subscribe first.", 400);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.CLIENT_URL}/dashboard`,
    });

    return session.url;
  },

  /**
   * Handles all incoming Stripe webhook events.
   * Called by the webhook controller after signature verification.
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    // Extract userId from the event metadata
    const getUserId = (obj: any): string | undefined =>
      obj?.metadata?.userId;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = getUserId(session);
        if (!userId) return;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        await User.findByIdAndUpdate(userId, {
          plan: "premium",
          stripeSubscriptionId: subscription.id,
          planExpiresAt: new Date((subscription as any).current_period_end * 1000),
        });

        await PaymentLog.create({
          userId,
          stripeEventId: event.id,
          type: event.type,
          status: "success",
          meta: { subscriptionId: subscription.id },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        // Renewal — refresh the planExpiresAt date
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | null;
        const sub = subscriptionId
          ? await stripe.subscriptions.retrieve(subscriptionId)
          : null;

        if (!sub) return;
        const userId = getUserId(sub);
        if (!userId) return;

        await User.findByIdAndUpdate(userId, {
          plan: "premium",
          planExpiresAt: new Date((sub as any).current_period_end * 1000),
        });

        await PaymentLog.create({
          userId,
          stripeEventId: event.id,
          type: event.type,
          status: "success",
        });
        break;
      }

      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        // Subscription cancelled or payment failed — revoke premium
        const obj = event.data.object as any;
        const sub =
          event.type === "customer.subscription.deleted"
            ? obj
            : obj.subscription
            ? await stripe.subscriptions.retrieve(obj.subscription as string)
            : null;

        if (!sub) return;
        const userId = getUserId(sub);
        if (!userId) return;

        await User.findByIdAndUpdate(userId, {
          plan: "free",
          stripeSubscriptionId: null,
          planExpiresAt: null,
        });

        await PaymentLog.create({
          userId,
          stripeEventId: event.id,
          type: event.type,
          status: "success",
        });
        break;
      }

      default:
        // Ignore unhandled events silently
        break;
    }
  },
};
