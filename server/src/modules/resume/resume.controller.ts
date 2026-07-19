import { Request, Response, NextFunction } from "express";
import multer from "multer";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
import { analyzeResume } from "../../ai/services/resume.service";
import { AppError } from "../../shared/errors/app-error";

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
