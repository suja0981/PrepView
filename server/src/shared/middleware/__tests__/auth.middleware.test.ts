import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticate } from "../auth.middleware";
import { verifyToken } from "../../utils/jwt";
import type { Request, Response, NextFunction } from "express";

vi.mock("../../utils/jwt", () => ({
  verifyToken: vi.fn(),
}));

describe("authenticate Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      cookies: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it("should return 401 if token cookie is missing", async () => {
    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should attach payload to req.user and call next() on valid token", async () => {
    req.cookies = { token: "valid_jwt_token" };
    const payload = { userId: "user_77", email: "alex@example.com" };
    vi.mocked(verifyToken).mockReturnValue(payload as any);

    await authenticate(req as Request, res as Response, next);

    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 401 if verifyToken throws an error (invalid token)", async () => {
    req.cookies = { token: "expired_or_corrupted_token" };
    vi.mocked(verifyToken).mockImplementation(() => {
      throw new Error("Token expired");
    });

    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token.",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
