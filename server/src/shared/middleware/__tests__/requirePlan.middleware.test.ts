import { describe, it, expect, vi, beforeEach } from "vitest";
import { requirePlan } from "../requirePlan.middleware";
import { User } from "../../../modules/user/user.model";
import type { Request, Response, NextFunction } from "express";

vi.mock("../../../modules/user/user.model", () => ({
  User: {
    findById: vi.fn(),
  },
}));

describe("requirePlan Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      user: { userId: "user_999", email: "free@example.com" },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it("should return 403 with upgradeRequired flag if user has free plan", async () => {
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ id: "user_999", plan: "free" }),
    } as any);

    const middleware = requirePlan("premium");
    await middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      upgradeRequired: true,
      message: "This feature requires a Premium plan. Upgrade to continue.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if user has premium plan", async () => {
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ id: "user_999", plan: "premium" }),
    } as any);

    const middleware = requirePlan("premium");
    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
