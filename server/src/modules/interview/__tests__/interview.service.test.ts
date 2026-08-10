import { describe, it, expect, vi, beforeEach } from "vitest";
import { interviewService } from "../interview.service";
import { User } from "../../user/user.model";
import { AppError } from "../../../shared/errors/app-error";

vi.mock("../../user/user.model", () => ({
  User: {
    findById: vi.fn(),
  },
}));

vi.mock("../interview.model", () => ({
  InterviewModel: {
    countDocuments: vi.fn(),
  },
}));

vi.mock("../../../ai/services/gemini.service", () => ({
  callGemini: vi.fn().mockResolvedValue({
    questions: [
      { question: "Explain Closures in JS", topic: "Javascript" },
    ],
  }),
}));

describe("InterviewService Plan Gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should block free user from creating voice interview", async () => {
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ id: "free_user", plan: "free" }),
    } as any);

    await expect(
      interviewService.createInterview("free_user", {
        role: "Frontend Engineer",
        difficulty: "medium",
        type: "technical",
        mode: "voice",
      }),
    ).rejects.toThrowError(
      new AppError("Voice interviews are a Premium feature. Upgrade to continue.", 403, true),
    );
  });

  it("should block free user from selecting DSA type", async () => {
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ id: "free_user", plan: "free" }),
    } as any);

    await expect(
      interviewService.createInterview("free_user", {
        role: "Software Engineer",
        difficulty: "medium",
        type: "system_design",
        mode: "text",
      }),
    ).rejects.toThrowError(
      new AppError("DSA and System Design interviews are Premium features. Upgrade to continue.", 403, true),
    );
  });

  it("should block free user from selecting Hard difficulty", async () => {
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ id: "free_user", plan: "free" }),
    } as any);

    await expect(
      interviewService.createInterview("free_user", {
        role: "Software Engineer",
        difficulty: "hard",
        type: "technical",
        mode: "text",
      }),
    ).rejects.toThrowError(
      new AppError("Hard difficulty is a Premium feature. Upgrade to continue.", 403, true),
    );
  });
});
