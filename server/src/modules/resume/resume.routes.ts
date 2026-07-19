import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { resumeUpload, analyzeResumeHandler } from "./resume.controller";
import { aiRateLimit } from "../../shared/middleware/rate-limit.middleware";

const resumeRouter = Router();

resumeRouter.use(authenticate);

resumeRouter.post("/analyze", aiRateLimit, resumeUpload, analyzeResumeHandler);

export { resumeRouter };
