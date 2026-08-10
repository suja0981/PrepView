import { Router } from "express";

import {
  createInterview,
  getInterview,
  getInterviewDetails,
  getInterviewReport,
  getUserInterviews,
  submitAnswer,
  transcribeAudio,
} from "./interview.controller";

import { authenticate } from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validate";
import { aiRateLimit, answerRateLimit } from "../../shared/middleware/rate-limit.middleware";

import {
  CreateInterviewSchema,
  SubmitAnswerSchema,
} from "./interview.validation";

const interviewRouter = Router();

interviewRouter.use(authenticate);

interviewRouter.post("/", aiRateLimit, validate(CreateInterviewSchema), createInterview);

interviewRouter.get("/", getUserInterviews);

interviewRouter.get("/:id", getInterview);

interviewRouter.post("/:id/answer", answerRateLimit, validate(SubmitAnswerSchema), submitAnswer);

interviewRouter.get("/:id/report", getInterviewReport);

interviewRouter.get("/:id/details", getInterviewDetails);

import multer from "multer";
import os from "os";

const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 10 * 1024 * 1024 } });

interviewRouter.post("/transcribe", upload.single("audio"), transcribeAudio);

export { interviewRouter };
