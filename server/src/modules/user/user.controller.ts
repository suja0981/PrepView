import type { Request, Response } from "express";
import { userService } from "./user.service";
import { asyncHandler } from "../../shared/utils/async-handler";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!.userId);
  res.json({ success: true, data: { user } });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, avatar } = req.body;
  const user = await userService.updateProfile(req.user!.userId, { name, avatar });
  res.json({ success: true, data: { user } });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user!.userId, currentPassword, newPassword);
  res.json({ success: true, data: { message: "Password changed successfully" } });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteAccount(req.user!.userId);
  res
    .clearCookie("token")
    .json({ success: true, data: { message: "Account deleted" } });
});
