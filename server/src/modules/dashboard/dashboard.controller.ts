import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { dashboardRepository } from "./dashboard.repository";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const [stats, weakTopics, scoreByType] = await Promise.all([
      dashboardRepository.getStats(userId),
      dashboardRepository.getWeakTopics(userId),
      dashboardRepository.getScoreByType(userId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        weakTopics,
        scoreByType,
      },
    });
  },
);
