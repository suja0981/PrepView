import { Router } from "express";

import {
  createInterview,
  getInterview,
  getInterviewDetails,
  getInterviewReport,
  getUserInterviews,
  submitAnswer,
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

export { interviewRouter };
