import { Router } from "express";
import { getCurrentUser, login, logout, register } from "./auth.controller";
import { validate } from "../../shared/middleware/validate";
import { registerSchema, loginSchema } from "./auth.validation";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authRateLimit } from "../../shared/middleware/rate-limit.middleware";

const authRouter = Router();

authRouter.post("/register", authRateLimit, validate(registerSchema), register);

authRouter.post("/login", authRateLimit, validate(loginSchema), login);

authRouter.get("/me", authenticate, getCurrentUser);

authRouter.post("/logout", authenticate, logout);

export { authRouter };
