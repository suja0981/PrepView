import { apiClient } from "./axios";

/** Fetches Razorpay checkout order parameters */
export const createCheckoutSession = () =>
  apiClient.post<{
    success: boolean;
    data: {
      orderId: string;
      keyId: string;
      amount: number;
      currency: string;
      userName: string;
      userEmail: string;
    };
  }>("/payments/checkout");

/** Verifies Razorpay payment signature after modal completion */
export const verifyPayment = (data: { orderId: string; paymentId: string; signature: string }) =>
  apiClient.post<{ success: boolean; data: { success: boolean } }>("/payments/verify", data);

/** Manages subscription or billing account */
export const createPortalSession = () =>
  apiClient.post<{ success: boolean; data: { url: string } }>("/payments/portal");
