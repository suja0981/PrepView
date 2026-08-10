import { Request, Response, NextFunction } from "express";
import { paymentService } from "./payment.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { AppError } from "../../shared/errors/app-error";

/** POST /api/v1/payments/checkout — returns Razorpay order details */
export const createCheckout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userEmail = req.user!.email;
  const data = await paymentService.createCheckoutSession(userId, userEmail);
  res.json({ success: true, data });
});

/** POST /api/v1/payments/verify — verifies signature and upgrades user to premium */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { orderId, paymentId, signature } = req.body;

  if (!orderId || !paymentId || !signature) {
    throw new AppError("Order ID, Payment ID, and Signature are required", 400);
  }

  const result = await paymentService.verifyPayment(userId, { orderId, paymentId, signature });
  res.json({ success: true, data: result });
});

/** POST /api/v1/payments/portal — returns billing portal redirect */
export const createPortal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const url = await paymentService.createPortalSession(userId);
  res.json({ success: true, data: { url } });
});

/**
 * POST /api/v1/payments/webhook
 * Called by Razorpay. Uses raw body buffer for HMAC signature verification.
 */
export async function razorpayWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const signature = req.headers["x-razorpay-signature"] as string;

  try {
    const rawBody = req.body as Buffer;
    const event = typeof req.body === "object" && !Buffer.isBuffer(req.body)
      ? req.body
      : JSON.parse(rawBody.toString());

    await paymentService.handleWebhook(event, signature, rawBody);
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}
