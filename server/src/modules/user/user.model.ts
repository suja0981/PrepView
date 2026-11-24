import { InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
    select: false,
  },
  googleId: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["ADMIN", "USER"],
    default: "USER",
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
  },

  // ── Subscription ──────────────────────────────────────────────────────────
  // plan is the source of truth for feature access in the app
  plan: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
  },
  // Razorpay IDs for subscription management
  razorpayCustomerId: {
    type: String,
    default: null,
  },
  razorpaySubscriptionId: {
    type: String,
    default: null,
  },
  // When the current billing period ends (used to show "renews on X")
  planExpiresAt: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export type User = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
