import { NextFunction, Request, Response } from "express";

import { verifyToken } from "../utils/jwt";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payload = verifyToken(token);

    req.user = payload;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}
