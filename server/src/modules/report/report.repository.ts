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
};

class ReportRepository {
  async create(data: CreateReportInput) {
    return ReportModel.create(data);
  }

  async findByInterview(interviewId: string) {
    return ReportModel.findOne({ interviewId });
  }
}

export const reportRepository = new ReportRepository();
