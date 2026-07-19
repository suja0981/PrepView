import { z } from "zod";

export const CreateInterviewSchema = z.object({
  role: z.string().trim().min(2),

  company: z.string().trim().optional(),
  
  techStacks: z.string().trim().optional(),

  difficulty: z.enum(["easy", "medium", "hard"]),

  type: z.enum(["technical", "behavioral"]),

  mode: z.enum(["voice", "text"]).default("voice"),
});

export const SubmitAnswerSchema = z.object({
  questionId: z.string(),

  answer: z.string().trim().min(5),

  responseTime: z.number().positive(),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;

export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
