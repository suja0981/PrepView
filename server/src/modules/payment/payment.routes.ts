import { Router } from "express";
import express from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { createCheckout, createPortal, stripeWebhook } from "./payment.controller";

export const paymentRouter = Router();

// ── Webhook (must be raw body, registered FIRST, no auth middleware) ──────────
// Stripe sends raw binary — JSON parsing breaks the signature check.
paymentRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// ── Protected routes (require login) ─────────────────────────────────────────
paymentRouter.use(authenticate);
paymentRouter.post("/checkout", createCheckout);
paymentRouter.post("/portal", createPortal);
