import crypto from "crypto";
import { ReportModel } from "./report.model";

type CreateReportInput = {
  interviewId: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  reasoningScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
  shareToken?: string;
};

class ReportRepository {
  async create(data: CreateReportInput) {
    const shareToken = data.shareToken || crypto.randomBytes(16).toString("hex");
    return ReportModel.create({ ...data, shareToken });
  }

  async findByInterview(interviewId: string) {
    const report = await ReportModel.findOne({ interviewId });
    if (report && !report.shareToken) {
      report.shareToken = crypto.randomBytes(16).toString("hex");
      await report.save();
    }
    return report;
  }

  async findByShareToken(shareToken: string) {
    return ReportModel.findOne({ shareToken });
  }
}

export const reportRepository = new ReportRepository();
