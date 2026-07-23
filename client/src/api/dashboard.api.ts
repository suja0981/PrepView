import { api } from "./axios";
import type { DashboardData } from "@/types/dashboard";

export const getDashboardStats = async () => {
  const res = await api.get<{ success: boolean; message?: string; data: DashboardData }>("/dashboard");

  return res.data.data;
};
