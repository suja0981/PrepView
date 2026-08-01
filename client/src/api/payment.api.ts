import { apiClient } from "./axios";

/** Redirects to Stripe Checkout — returns the checkout URL */
export const createCheckoutSession = () =>
  apiClient.post<{ success: boolean; data: { url: string } }>("/payments/checkout");

/** Redirects to Stripe Customer Portal (manage/cancel subscription) */
export const createPortalSession = () =>
  apiClient.post<{ success: boolean; data: { url: string } }>("/payments/portal");
