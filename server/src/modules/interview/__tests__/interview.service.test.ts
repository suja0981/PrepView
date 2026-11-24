import { describe, it, expect, vi, beforeEach } from "vitest";
import { interviewService } from "../interview.service";
import { User } from "../../user/user.model";
import { interviewRepository } from "../interview.repository";
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

vi.mock("../interview.repository", () => ({
  interviewRepository: {
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("../../../ai/services/llm.service", () => ({
  callGroqFast: vi.fn().mockResolvedValue({
    question: "Explain Closures in JS",
    topic: "Javascript",
  }),
}));

vi.mock("../../../ai/services/question-retrieval.service", () => ({
  retrieveQuestions: vi.fn().mockResolvedValue([]),
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

  it("should block free user from selecting System Design type", async () => {
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

  it("should not create an orphan interview record if AI question generation fails", async () => {
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ id: "pro_user", plan: "premium" }),
    } as any);
    const { callGroqFast } = await import("../../../ai/services/llm.service");
    vi.mocked(callGroqFast).mockRejectedValueOnce(new Error("Groq timeout"));

    await expect(
      interviewService.createInterview("pro_user", {
        role: "Backend Engineer",
        difficulty: "medium",
        type: "technical",
        mode: "text",
      }),
    ).rejects.toThrowError("Groq timeout");

    expect(interviewRepository.create).not.toHaveBeenCalled();
  });

  it("should enforce ownership check on getInterview", async () => {
    vi.mocked(interviewRepository.findById).mockResolvedValue({
      id: "int_1",
      userId: "owner_user",
    } as any);

    await expect(
      interviewService.getInterview("int_1", "attacker_user"),
    ).rejects.toThrowError(new AppError("Access denied.", 403));
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
