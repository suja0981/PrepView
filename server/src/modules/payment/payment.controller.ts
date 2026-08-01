import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { env } from "../../config/env";
import { paymentService } from "./payment.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { AppError } from "../../shared/errors/app-error";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
});

/** POST /api/v1/payments/checkout — returns Stripe Checkout URL */
export const createCheckout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userEmail = req.user!.email;
  const url = await paymentService.createCheckoutSession(userId, userEmail);
  res.json({ success: true, data: { url } });
});

/** POST /api/v1/payments/portal — returns Stripe Customer Portal URL */
export const createPortal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const url = await paymentService.createPortalSession(userId);
  res.json({ success: true, data: { url } });
});

/**
 * POST /api/v1/payments/webhook
 * Called by Stripe. Must use raw body (NOT JSON parsed) for signature verification.
 * This route is registered BEFORE express.json() in app.ts.
 */
export async function stripeWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer, // raw buffer — NOT parsed JSON
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    return next(new AppError(`Webhook signature verification failed: ${err.message}`, 400));
  }

  try {
    await paymentService.handleWebhook(event);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}
