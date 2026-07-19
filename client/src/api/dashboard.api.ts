import { api } from "./axios";
import type { DashboardData } from "@/types/dashboard";

export const getDashboardStats = async () => {
  const res = await api.get<DashboardData>("/dashboard");

  return res.data;
};
