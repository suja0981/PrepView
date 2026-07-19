import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().min(1).default("/api/v1"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string(),
  GEMINI_API_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment configuration",
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment configuration");
}

export const env = parsedEnv.data;
