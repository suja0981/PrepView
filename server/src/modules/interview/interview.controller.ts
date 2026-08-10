import type { Request, Response } from "express";

import { AppError } from "../../shared/errors/app-error";
import { asyncHandler } from "../../shared/utils/async-handler";
import { interviewService } from "./interview.service";

export const createInterview = asyncHandler(
  async (req: Request, res: Response) => {
    const interview = await interviewService.createInterview(
      req.user!.userId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Interview created successfully.",
      data: interview,
    });
  },
);

export const getInterview = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new AppError("Invalid interview ID", 400);
    }

    const data = await interviewService.getInterview(id);

    res.status(200).json({
      success: true,
      data,
    });
  },
);

export const getUserInterviews = asyncHandler(
  async (req: Request, res: Response) => {
    const interviews = await interviewService.getUserInterviews(
      req.user!.userId,
    );

    res.status(200).json({
      success: true,
      data: interviews,
    });
  },
);

export const submitAnswer = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      throw new AppError("Invalid interview ID", 400);
    }

    const answer = await interviewService.submitAnswer(id, req.body);

    res.status(201).json({
      success: true,
      data: answer,
    });
  },
);

export const getInterviewReport = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    throw new AppError("Invalid interview ID", 400);
  }

  const report = await interviewService.getInterviewReport(id);

  res.status(200).json({
    success: true,
    data: report,
  });
});

export const getInterviewDetails = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    throw new AppError("Invalid interview ID", 400);
  }

  const interview = await interviewService.getInterviewDetails(id);

  res.status(200).json({
    success: true,
    data: interview,
  });
});

export const transcribeAudio = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No audio file provided", 400);
  }

  const { transcribeAudioFile } = await import("../../ai/services/whisper.service");
  const fs = await import("fs");

  try {
    const transcript = await transcribeAudioFile(req.file.path);
    fs.unlink(req.file.path, () => {});

    res.status(200).json({
      success: true,
      data: { transcript },
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    throw err;
  }
});

