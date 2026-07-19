import { Request, Response } from "express";
import { authService } from "./auth.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { env } from "../../config/env";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await authService.register(req.body);

  res.cookie("token", token, cookieOptions);
  res.status(201).json({
    success: true,
    message: "User Registered Successfully",
    data: { id: user.id, name: user.name, email: user.email },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await authService.login(req.body);

  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    message: "User Logged in Successfully",
    data: { id: user.id, name: user.name, email: user.email },
  });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.userId);

  return res.status(200).json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({ success: true, message: "Logged out successfully." });
});
