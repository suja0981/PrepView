import { z } from "zod";

// Threshold: scores below this trigger a follow-up question (scale 0-10)
export const WEAK_ANSWER_THRESHOLD = 6;

export const CreateInterviewSchema = z.object({
  role: z.string().trim().min(2),

  company: z.string().trim().optional(),

  techStacks: z.string().trim().optional(),

  difficulty: z.enum(["easy", "medium", "hard"]),

  // Extended to include DSA, system design, and mixed modes
  type: z.enum(["technical", "behavioral", "dsa", "system_design", "mixed"]),

  mode: z.enum(["voice", "text"]).default("voice"),
});

export const SubmitAnswerSchema = z.object({
  questionId: z.string(),

  answer: z.string().trim().min(5),

  responseTime: z.number().positive(),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
