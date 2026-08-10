import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { createCheckout, createPortal, razorpayWebhook } from "./payment.controller";

export const paymentRouter = Router();

// ── Webhook (raw body mounted in app.ts, no auth middleware) ──────────────────
paymentRouter.post("/webhook", razorpayWebhook);

// ── Protected routes (require login) ─────────────────────────────────────────
paymentRouter.use(authenticate);
paymentRouter.post("/checkout", createCheckout);
paymentRouter.post("/portal", createPortal);
