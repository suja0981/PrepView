import { z } from "zod";

export const createInterviewSchema = z.object({
  role: z.string().min(2, "Role is required"),
  // company removed — use role presets instead
  techStacks: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  // dsa removed until code editor is available
  type: z.enum(["technical", "behavioral", "system_design", "mixed"]),
  mode: z.enum(["voice", "text"]),
});

export type CreateInterviewSchema = z.infer<typeof createInterviewSchema>;
