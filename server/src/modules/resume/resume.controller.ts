import { Request, Response, NextFunction } from "express";
import multer from "multer";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
import { analyzeResume } from "../../ai/services/resume.service";
import { AppError } from "../../shared/errors/app-error";
import { User } from "../user/user.model";
import { PaymentLog } from "../payment/payment.model";

const FREE_DAILY_RESUME_LIMIT = 10;


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["text/plain", "application/pdf"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF and TXT files are supported"));
  },
});

export const resumeUpload = upload.single("resume");

export async function analyzeResumeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const jobDescription = req.body.jobDescription as string | undefined;
    const file = req.file;

    if (!file) throw new AppError("Resume file is required", 400);
    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new AppError("Job description must be at least 50 characters", 400);
    }

    // ── Resume analysis daily limit (free users only) ──────────────────────
    const userId = (req as any).user?.userId;
    if (userId) {
      const dbUser = await User.findById(userId).select("plan");
      const isPremium = dbUser?.plan === "premium";

      if (!isPremium) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // We track resume analyses via PaymentLog entries with type "resume_analysis"
        const todayCount = await PaymentLog.countDocuments({
          userId,
          type: "resume_analysis",
          createdAt: { $gte: startOfDay },
        });

        if (todayCount >= FREE_DAILY_RESUME_LIMIT) {
          throw new AppError(
            `Free plan allows ${FREE_DAILY_RESUME_LIMIT} resume analyses per day. Upgrade for unlimited access.`,
            403,
          );
        }

        // Log this analysis
        await PaymentLog.create({
          userId,
          stripeEventId: `resume_${userId}_${Date.now()}`,
          type: "resume_analysis",
          status: "success",
        });
      }
    }
    // ── End limit check ────────────────────────────────────────────────────


    let resumeText: string;

    if (file.mimetype === "application/pdf") {
      const parsed = await pdfParse(file.buffer);
      resumeText = parsed.text.trim();
      if (resumeText.length < 100) {
        throw new AppError(
          "Could not read your PDF. Please use a text-based PDF (not a scanned image) or upload a .txt file.",
          422,
        );
      }
    } else {
      resumeText = file.buffer.toString("utf-8").trim();
    }

    const result = await analyzeResume({ resumeText, jobDescription });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
