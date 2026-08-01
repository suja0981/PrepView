import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  withCredentials: true,
});

// Also export as apiClient for consistency across the codebase
export const apiClient = api;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const isAuthCheck = error.config?.url?.includes("/auth/me");

    // 401 — not logged in (skip on the /auth/me check endpoint)
    if (status === 401 && !isAuthCheck) {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 403 + upgradeRequired — plan gate hit, redirect to pricing page
    if (status === 403 && data?.upgradeRequired) {
      toast.error(data?.error?.message ?? "This feature requires Premium.", {
        action: {
          label: "Upgrade",
          onClick: () => { window.location.href = "/pricing"; },
        },
        duration: 5000,
      });
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

