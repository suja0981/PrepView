import type { Request, Response } from "express";
import { reportService } from "./report.service";
import { asyncHandler } from "../../shared/utils/async-handler";

export const getSharedReport = asyncHandler(async (req: Request, res: Response) => {
  const shareToken = req.params.shareToken as string;
  const data = await reportService.getSharedReport(shareToken);
  res.json({
    success: true,
    data,
  });
});
