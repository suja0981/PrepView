import { api } from "./axios";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";

export const login = async (data: LoginRequest) => {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
};

export const register = async (data: RegisterRequest) => {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get<AuthResponse>("/auth/me");
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};
