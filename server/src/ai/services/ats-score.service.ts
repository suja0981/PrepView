import type { ResumeExtraction } from "../prompts/resume-extraction.prompt";
import { isSkillMatch } from "./skill-taxonomy";

export interface AtsScoreResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

// Required skills carry most of the weight; preferred skills are a smaller bonus.
const REQUIRED_WEIGHT = 80;
const PREFERRED_WEIGHT = 20;

/**
 * Deterministic ATS score - plain skill-overlap math with synonym/taxonomy fuzzy matching.
 * Same input always produces the same score, and skill variants (e.g. "ReactJS" vs "React")
 * are correctly matched.
 */
export function calculateAtsScore(extraction: ResumeExtraction): AtsScoreResult {
  const candidateSkills = extraction.candidateSkills;

  const matchedSkills = extraction.jdRequiredSkills.filter((jdSkill) =>
    candidateSkills.some((cSkill) => isSkillMatch(cSkill, jdSkill)),
  );

  const missingSkills = extraction.jdRequiredSkills.filter(
    (jdSkill) => !candidateSkills.some((cSkill) => isSkillMatch(cSkill, jdSkill)),
  );

  // No required skills listed in the JD -> don't penalise, give full marks for this part.
  const requiredScore = extraction.jdRequiredSkills.length
    ? (matchedSkills.length / extraction.jdRequiredSkills.length) * REQUIRED_WEIGHT
    : REQUIRED_WEIGHT;

  const preferredMatched = extraction.jdPreferredSkills.filter((jdSkill) =>
    candidateSkills.some((cSkill) => isSkillMatch(cSkill, jdSkill)),
  );

  const preferredScore = extraction.jdPreferredSkills.length
    ? (preferredMatched.length / extraction.jdPreferredSkills.length) * PREFERRED_WEIGHT
    : 0;

  return {
    score: Math.round(requiredScore + preferredScore),
    matchedSkills,
    missingSkills,
  };
}
