import { callGemini } from "./gemini.service";
import { buildEvaluationPrompt } from "../prompts/interview.prompt";

export interface EvaluateAnswerInput {
  question: string;
  answer: string;
  role: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
}

export async function evaluateAnswer(data: EvaluateAnswerInput) {
  const prompt = buildEvaluationPrompt(data);
  return callGemini(prompt);
}
