import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateAnswer } from "../evaluation.service";
import { callGemini } from "../gemini.service";

vi.mock("../gemini.service", () => ({
  callGemini: vi.fn(),
}));

describe("evaluateAnswer AI Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pass constructed prompt to callGemini and return LLM JSON output", async () => {
    const mockAiResponse = {
      overallScore: 8,
      technicalAccuracy: 8,
      reasoning: 7,
      communication: 9,
      feedback: "Great structured response explaining the URL hash generator and caching layer.",
      weakTopics: [],
    };

    vi.mocked(callGemini).mockResolvedValue(mockAiResponse);

    const result = await evaluateAnswer({
      question: "How would you design a URL shortener?",
      answer: "I would use a base62 hash function, a key generation service, and Redis cache for hot URLs.",
      role: "Senior System Architect",
      type: "system_design",
      difficulty: "medium",
    });

    expect(callGemini).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockAiResponse);
    expect(result.overallScore).toBe(8);
  });
});
