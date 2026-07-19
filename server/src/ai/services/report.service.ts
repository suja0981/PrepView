import { callGemini } from "./gemini.service";
import { buildReportPrompt } from "../prompts/report.prompt";

export interface InterviewReportInput {
  role: string;
  difficulty: string;
  evaluations: {
    question: string;
    answer: string;
    feedback: string;
    overallScore: number;
  }[];
}

export async function generateInterviewReport(data: InterviewReportInput) {
  const prompt = buildReportPrompt(data);
  return callGemini(prompt);
}
