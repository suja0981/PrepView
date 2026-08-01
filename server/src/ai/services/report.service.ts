import { callGemini } from "./gemini.service";
import { buildReportNarrativePrompt } from "../prompts/report.prompt";

export interface InterviewReportInput {
  role: string;
  difficulty: string;
  evaluations: {
    question: string;
    answer: string;
    feedback: string;
    // All four numeric scores come from EvaluationModel — already computed by AI per-answer
    overallScore: number;
    technicalAccuracy: number;
    reasoning: number;
    communication: number;
  }[];
}

// Simple average helper — ignores zero-score entries that have no answer
function avg(values: number[]): number {
  const nonZero = values.filter((v) => v > 0);
  if (nonZero.length === 0) return 0;
  const sum = nonZero.reduce((a, b) => a + b, 0);
  return Math.round((sum / nonZero.length) * 10) / 10; // 1 decimal place
}

export async function generateInterviewReport(data: InterviewReportInput) {
  // ── Step 1: Compute aggregate scores from already-stored evaluation numbers ──
  // This is pure math — no AI involved. Same input = same output every time.
  const scores = {
    overallScore:      avg(data.evaluations.map((e) => e.overallScore)),
    technicalScore:    avg(data.evaluations.map((e) => e.technicalAccuracy)),
    communicationScore: avg(data.evaluations.map((e) => e.communication)),
    reasoningScore:    avg(data.evaluations.map((e) => e.reasoning)),
  };

  // ── Step 2: Ask Gemini for the narrative only (summary, strengths, improvements) ──
  // We pass the pre-computed scores in so the AI's narrative stays consistent with the numbers.
  const narrative = await callGemini(
    buildReportNarrativePrompt({ ...data, ...scores }),
  );

  // ── Step 3: Merge computed scores + AI narrative into the final report shape ──
  return {
    ...scores,
    strengths:    narrative.strengths    ?? [],
    improvements: narrative.improvements ?? [],
    summary:      narrative.summary      ?? "",
  };
}
