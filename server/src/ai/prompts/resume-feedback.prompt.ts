import type { ResumeExtraction } from "./resume-extraction.prompt";

/**
 * Feedback prompt: writes the human-readable parts of the report.
 * Fed the already-extracted facts (matched/missing skills) so the
 * feedback stays consistent with the ATS score instead of re-guessing.
 */
export function buildFeedbackPrompt(
  extraction: ResumeExtraction,
  matchedSkills: string[],
  missingSkills: string[],
): string {
  return `You are a technical recruiter giving feedback on a resume vs a job description.

Candidate's inferred role: ${extraction.inferredRole} (${extraction.seniorityLevel} level)
Skills the candidate has that the job needs: ${matchedSkills.join(", ") || "none"}
Skills the job needs that are missing from the resume: ${missingSkills.join(", ") || "none"}

Base your answer only on the facts above.

Respond ONLY with JSON:
{
  "summary": "<2-3 sentence overall assessment>",
  "suggestions": ["<specific actionable resume improvement>"],
  "talkingPoints": ["<experience from the resume worth highlighting in interviews>"],
  "possibleQuestions": ["<5 likely interview questions for this role, focused on the matched and missing skills>"]
}`;
}
