import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateInterviewReport } from "../report.service";
import { callGemini } from "../gemini.service";

vi.mock("../gemini.service", () => ({
  callGemini: vi.fn(),
}));

describe("generateInterviewReport AI Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate exact mathematical averages from evaluations and merge with LLM narrative", async () => {
    const mockNarrative = {
      summary: "Candidate demonstrated solid domain understanding and clear communication.",
      strengths: ["Clear system partitioning", "Good API contract design"],
      improvements: ["Elaborate more on failure recovery and replication"],
    };

    vi.mocked(callGemini).mockResolvedValue(mockNarrative);

    const inputData = {
      role: "Backend Engineer",
      difficulty: "medium",
      evaluations: [
        {
          question: "Q1",
          answer: "A1",
          feedback: "F1",
          overallScore: 8,
          technicalAccuracy: 8,
          reasoning: 6,
          communication: 10,
        },
        {
          question: "Q2",
          answer: "A2",
          feedback: "F2",
          overallScore: 6,
          technicalAccuracy: 6,
          reasoning: 8,
          communication: 8,
        },
      ],
    };

    const report = await generateInterviewReport(inputData);

    // Mathematical averages:
    // overallScore: (8 + 6) / 2 = 7
    // technicalScore: (8 + 6) / 2 = 7
    // reasoningScore: (6 + 8) / 2 = 7
    // communicationScore: (10 + 8) / 2 = 9
    expect(report.overallScore).toBe(7);
    expect(report.technicalScore).toBe(7);
    expect(report.reasoningScore).toBe(7);
    expect(report.communicationScore).toBe(9);
    expect(report.strengths).toEqual(mockNarrative.strengths);
    expect(report.improvements).toEqual(mockNarrative.improvements);
    expect(report.summary).toBe(mockNarrative.summary);
  });
});
