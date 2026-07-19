export function buildResumeAnalysisPrompt(resumeText: string, jobDescription: string): string {
  return `You are an expert technical recruiter and career coach.

Compare this resume against the job description and return a structured analysis.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with JSON:
{
  "matchScore": <0-100 integer>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<what the candidate has that the JD needs>"],
  "gaps": ["<what the JD needs that is missing or weak in the resume>"],
  "suggestions": ["<specific actionable improvement for the resume>"],
  "talkingPoints": ["<experience from the resume to highlight in interviews>"]
}`;
}
