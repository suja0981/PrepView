import { Router } from "express";
import express from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { createCheckout, createPortal, stripeWebhook } from "./payment.controller";

export const paymentRouter = Router();

// ── Webhook (raw body mounted in app.ts, no auth middleware) ──────────────────
paymentRouter.post("/webhook", stripeWebhook);

// ── Protected routes (require login) ─────────────────────────────────────────
paymentRouter.use(authenticate);
paymentRouter.post("/checkout", createCheckout);
paymentRouter.post("/portal", createPortal);
