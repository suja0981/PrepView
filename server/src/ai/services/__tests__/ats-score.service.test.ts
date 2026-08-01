import { describe, it, expect } from "vitest";
import { calculateAtsScore } from "../ats-score.service";
import type { ResumeExtraction } from "../../prompts/resume-extraction.prompt";

// Helper to build a minimal ResumeExtraction fixture
function makeExtraction(overrides: Partial<ResumeExtraction> = {}): ResumeExtraction {
  return {
    candidateSkills: ["React", "TypeScript", "Node.js"],
    jdRequiredSkills: ["React", "TypeScript"],
    jdPreferredSkills: ["GraphQL"],
    inferredRole: "Frontend Engineer",
    seniorityLevel: "mid",
    yearsOfExperience: 3,
    ...overrides,
  };
}

describe("calculateAtsScore", () => {
  it("returns 100 when candidate has all required + preferred skills", () => {
    const result = calculateAtsScore(
      makeExtraction({ candidateSkills: ["React", "TypeScript", "GraphQL"] }),
    );
    expect(result.score).toBe(100);
    expect(result.matchedSkills).toEqual(["React", "TypeScript"]);
    expect(result.missingSkills).toEqual([]);
  });

  it("returns 80 when candidate has all required but no preferred skills", () => {
    const result = calculateAtsScore(
      makeExtraction({ candidateSkills: ["React", "TypeScript"] }),
    );
    // 80 for required, 0 for preferred
    expect(result.score).toBe(80);
  });

  it("returns 0 when candidate has none of the required skills", () => {
    const result = calculateAtsScore(
      makeExtraction({ candidateSkills: ["Python", "Django"] }),
    );
    expect(result.score).toBe(0);
    expect(result.missingSkills).toEqual(["React", "TypeScript"]);
  });

  it("is case-insensitive for skill matching", () => {
    const result = calculateAtsScore(
      makeExtraction({ candidateSkills: ["react", "typescript"] }),
    );
    expect(result.matchedSkills).toHaveLength(2);
    expect(result.missingSkills).toHaveLength(0);
  });

  it("matches skill synonyms using taxonomy dictionary (e.g. ReactJS -> React, NodeJS -> Node.js)", () => {
    const result = calculateAtsScore(
      makeExtraction({
        candidateSkills: ["ReactJS", "TS", "NodeJS"],
        jdRequiredSkills: ["React", "TypeScript", "Node.js"],
      }),
    );
    expect(result.matchedSkills).toEqual(["React", "TypeScript", "Node.js"]);
    expect(result.missingSkills).toEqual([]);
    expect(result.score).toBe(80);
  });

  it("matches skill variations using token containment (e.g. RESTful APIs -> REST API)", () => {
    const result = calculateAtsScore(
      makeExtraction({
        candidateSkills: ["Building RESTful APIs", "PostgreSQL Database"],
        jdRequiredSkills: ["REST API", "PostgreSQL"],
      }),
    );
    expect(result.matchedSkills).toEqual(["REST API", "PostgreSQL"]);
    expect(result.missingSkills).toEqual([]);
  });

  it("returns full required score when JD has no required skills listed", () => {
    const result = calculateAtsScore(
      makeExtraction({ jdRequiredSkills: [], jdPreferredSkills: [], candidateSkills: [] }),
    );
    // No required skills → full REQUIRED_WEIGHT (80), no preferred → 0
    expect(result.score).toBe(80);
  });

  it("returns 0 preferred bonus when JD lists no preferred skills", () => {
    const result = calculateAtsScore(
      makeExtraction({ jdPreferredSkills: [], candidateSkills: ["React", "TypeScript"] }),
    );
    // All required matched (80) + 0 preferred bonus
    expect(result.score).toBe(80);
  });

  it("gives partial score for partial skill match", () => {
    const result = calculateAtsScore(
      makeExtraction({ candidateSkills: ["React"] }), // TypeScript missing
    );
    // required: 1/2 * 80 = 40, preferred: 0/1 * 20 = 0
    expect(result.score).toBe(40);
    expect(result.matchedSkills).toEqual(["React"]);
    expect(result.missingSkills).toEqual(["TypeScript"]);
  });
});
