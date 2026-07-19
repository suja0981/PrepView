import { callGemini } from "./gemini.service";
import { buildResumeAnalysisPrompt } from "../prompts/resume.prompt";

export interface ResumeAnalysisInput {
  resumeText: string;
  jobDescription: string;
}

export interface ResumeAnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  talkingPoints: string[];
}

export async function analyzeResume(data: ResumeAnalysisInput): Promise<ResumeAnalysisResult> {
  const prompt = buildResumeAnalysisPrompt(data.resumeText, data.jobDescription);
  return callGemini(prompt);
}
