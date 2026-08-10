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
  const rawExtraction = await callGemini(
    buildExtractionPrompt(data.resumeText, data.jobDescription),
  );

  const extraction: ResumeExtraction = {
    candidateSkills: Array.isArray(rawExtraction?.candidateSkills) ? rawExtraction.candidateSkills : [],
    jdRequiredSkills: Array.isArray(rawExtraction?.jdRequiredSkills) ? rawExtraction.jdRequiredSkills : [],
    jdPreferredSkills: Array.isArray(rawExtraction?.jdPreferredSkills) ? rawExtraction.jdPreferredSkills : [],
    inferredRole: rawExtraction?.inferredRole || "Software Engineer",
    seniorityLevel: rawExtraction?.seniorityLevel || "mid",
    yearsOfExperience: typeof rawExtraction?.yearsOfExperience === "number" ? rawExtraction.yearsOfExperience : null,
  };

  // 2. Score deterministically - plain code, not an AI guess.
  const { score, matchedSkills, missingSkills } = calculateAtsScore(extraction);

  // 3. Generate the human-readable feedback, grounded in the facts above.
  const feedback = await callGemini(
    buildFeedbackPrompt(extraction, matchedSkills, missingSkills),
  );

  return {
    atsScore: typeof score === "number" ? score : 50,
    matchedSkills: Array.isArray(matchedSkills) ? matchedSkills : [],
    missingSkills: Array.isArray(missingSkills) ? missingSkills : [],
    summary: feedback?.summary || "Resume analyzed against job description requirements.",
    suggestions: Array.isArray(feedback?.suggestions) ? feedback.suggestions : [],
    talkingPoints: Array.isArray(feedback?.talkingPoints) ? feedback.talkingPoints : [],
    possibleQuestions: Array.isArray(feedback?.possibleQuestions) ? feedback.possibleQuestions : [],
  };
}
