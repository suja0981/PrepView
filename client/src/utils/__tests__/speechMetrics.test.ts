import { describe, it, expect } from "vitest";
import { calculateSpeechMetrics } from "../speechMetrics";

describe("calculateSpeechMetrics Utility", () => {
  it("should return zero metrics for empty transcript or zero duration", () => {
    const res = calculateSpeechMetrics("", 0);
    expect(res.wordCount).toBe(0);
    expect(res.wpm).toBe(0);
    expect(res.fillerCount).toBe(0);
  });

  it("should calculate WPM and optimal status correctly", () => {
    // 30 words in 15 seconds = 120 WPM (optimal range 110-165)
    const text = "I would design a URL shortening service using base62 encoding Redis caching for fast lookup and MongoDB for long term key storage with horizontal sharding for database scalability.";
    const res = calculateSpeechMetrics(text, 15);

    expect(res.wordCount).toBe(28);
    expect(res.wpm).toBe(112);
    expect(res.wpmStatus).toBe("optimal");
  });

  it("should flag fast pace when WPM > 165", () => {
    // 50 words in 10 seconds = 300 WPM
    const words = Array(50).fill("word").join(" ");
    const res = calculateSpeechMetrics(words, 10);

    expect(res.wpm).toBe(300);
    expect(res.wpmStatus).toBe("fast");
  });

  it("should detect filler words and calculate filler density", () => {
    const text = "Um basically I like think that you know we should use React and um Redux";
    // Total words = 14. Fillers: um (2), basically (1), like (1), you know (1) = 5 fillers
    const res = calculateSpeechMetrics(text, 10);

    expect(res.fillerCount).toBe(5);
    expect(res.fillersFound).toEqual([
      { word: "um", count: 2 },
      { word: "like", count: 1 },
      { word: "you know", count: 1 },
      { word: "basically", count: 1 },
    ]);
  });
});
