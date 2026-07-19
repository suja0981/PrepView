import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { dashboardRepository } from "./dashboard.repository";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await dashboardRepository.getStats(req.user!.userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  },
);
