import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Only redirect to login on 401 if it's NOT the /auth/me endpoint.
// The /auth/me request is used by the app to check if the user is authenticated,
// and it will normally return 401 for unauthenticated users — which is expected.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url?.includes("/auth/me");
    if (error.response?.status === 401 && !isAuthCheck) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
