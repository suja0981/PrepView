import { apiClient } from "./axios";

/** Fetches Razorpay checkout parameters or session URL */
export const createCheckoutSession = () =>
  apiClient.post<{ success: boolean; data: any }>("/payments/checkout");

/** Manages subscription or billing account */
export const createPortalSession = () =>
  apiClient.post<{ success: boolean; data: { url: string } }>("/payments/portal");
