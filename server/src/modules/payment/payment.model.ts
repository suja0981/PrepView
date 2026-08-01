import { Schema, model, Types } from "mongoose";

// Audit log of every Stripe event we process.
// Lets you debug billing issues without touching the User model directly.
const paymentLogSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stripeEventId: {
      type: String,
      required: true,
      unique: true, // prevent double-processing the same webhook
    },
    type: {
      type: String,
      required: true, // e.g. "checkout.session.completed"
    },
    status: {
      type: String,
      enum: ["success", "failed", "ignored"],
      default: "success",
    },
    meta: {
      type: Schema.Types.Mixed, // store any extra fields for debugging
      default: {},
    },
  },
  { timestamps: true },
);

export const PaymentLog = model("PaymentLog", paymentLogSchema);
