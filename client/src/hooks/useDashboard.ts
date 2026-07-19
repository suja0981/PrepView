import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/api/dashboard.api";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardStats,
  });
};
