import { callGemini } from "./gemini.service";
import { buildExtractionPrompt, ResumeExtraction } from "../prompts/resume-extraction.prompt";
import { buildFeedbackPrompt } from "../prompts/resume-feedback.prompt";
import { calculateAtsScore } from "./ats-score.service";

export interface ResumeAnalysisInput {
  resumeText: string;
  jobDescription: string;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  suggestions: string[];
  talkingPoints: string[];
  possibleQuestions: string[];
}

export async function analyzeResume(data: ResumeAnalysisInput): Promise<ResumeAnalysisResult> {
  // 1. Pull structured facts out of the resume + JD.
  const extraction: ResumeExtraction = await callGemini(
    buildExtractionPrompt(data.resumeText, data.jobDescription),
  );

  // 2. Score deterministically - plain code, not an AI guess.
  const { score, matchedSkills, missingSkills } = calculateAtsScore(extraction);

  // 3. Generate the human-readable feedback, grounded in the facts above.
  const feedback = await callGemini(
    buildFeedbackPrompt(extraction, matchedSkills, missingSkills),
  );

  return {
    atsScore: score,
    matchedSkills,
    missingSkills,
    summary: feedback.summary,
    suggestions: feedback.suggestions,
    talkingPoints: feedback.talkingPoints,
    possibleQuestions: feedback.possibleQuestions,
  };
}
