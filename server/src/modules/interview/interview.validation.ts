import { z } from "zod";

export const WEAK_ANSWER_THRESHOLD = 6;

export const CreateInterviewSchema = z.object({
  role: z.string().trim().min(2),

  // company removed — replaced by role presets on the frontend

  techStacks: z.string().trim().optional(),

  difficulty: z.enum(["easy", "medium", "hard"]),

  // dsa removed from selectable — re-enabled when code editor is added
  type: z.enum(["technical", "behavioral", "system_design", "mixed"]),

  mode: z.enum(["voice", "text"]).default("voice"),
});

export const SubmitAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.string().trim().min(5),
  responseTime: z.number().positive(),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
