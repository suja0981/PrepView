import {z} from "zod";

export const registerSchema = z.object({
    name: z
    .string()
    .trim()
    .min(3,"Name must be at least 3 characters long")
    .max(25),

    email: z
    .email()
    .transform((email)=>email.toLowerCase()),

    password: z
    .string()
    .min(8,"Password must be at least 8 characters long")
    .max(100),
});

export const loginSchema = z.object({
    email: z
    .email()
    .transform((email)=>email.toLowerCase()),

    password: z
    .string()
    .min(8,"Password must be at least 8 characters long")
    .max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;