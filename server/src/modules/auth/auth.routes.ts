import { Router } from "express";
import { getCurrentUser, login, logout, register } from "./auth.controller";
import { validate } from "../../shared/middleware/validate";
import { registerSchema, loginSchema } from "./auth.validation";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authRateLimit } from "../../shared/middleware/rate-limit.middleware";
import { env } from "../../config/env";
import { authService } from "./auth.service";
import { buildGoogleAuthUrl, exchangeCodeForTokens, getGoogleUserInfo } from "./google-oauth";

const authRouter = Router();

authRouter.post("/register", authRateLimit, validate(registerSchema), register);

authRouter.post("/login", authRateLimit, validate(loginSchema), login);

authRouter.get("/me", authenticate, getCurrentUser);

authRouter.post("/logout", authenticate, logout);

authRouter.get("/google", (_req, res) => {
  const url = buildGoogleAuthUrl();
  res.redirect(url);
});

authRouter.get("/google/callback", async (req, res) => {
  const { code, error } = req.query as { code?: string; error?: string };
  const clientUrl = env.CLIENT_URL;

  if (error || !code) {
    return res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await getGoogleUserInfo(tokens.access_token);

    const user = await authService.findOrCreateOAuthUser({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });

    const { generateToken } = await import("../../shared/utils/jwt");
    const token = generateToken({
      userId: (user as any).id ?? (user as any)._id.toString(),
      email: user.email,
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .redirect(`${clientUrl}/dashboard`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
});

export { authRouter };
