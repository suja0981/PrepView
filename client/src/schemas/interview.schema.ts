import { z } from "zod";

export const createInterviewSchema = z.object({
  role: z.string().min(2, "Role is required"),
  company: z.string().optional(),
  techStacks: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.enum(["technical", "behavioral"]),
  mode: z.enum(["voice", "text"]).default("voice"),
});

export type CreateInterviewSchema = z.infer<typeof createInterviewSchema>;
