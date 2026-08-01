/** Structured facts pulled from a resume + job description. No scoring or opinions here. */
export interface ResumeExtraction {
  candidateSkills: string[];
  jdRequiredSkills: string[];
  jdPreferredSkills: string[];
  inferredRole: string;
  seniorityLevel: "entry" | "mid" | "senior";
  yearsOfExperience: number | null;
}

/**
 * Extraction prompt: pulls facts out of the resume + JD, nothing else.
 * Strict rules enforce atomic, canonical 1-3 word skill names (e.g. "React", "Node.js", "Docker")
 * instead of full phrases or sentences.
 */
export function buildExtractionPrompt(resumeText: string, jobDescription: string): string {
  return `You are an expert ATS parser analyzing a resume against a job description. Extract facts ONLY — do not judge, score, or give opinions.

CRITICAL RULES FOR SKILL EXTRACTION:
1. Extract ATOMIC 1-3 word technical nouns/skills ONLY (e.g., "React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "REST API", "System Design", "AWS").
2. NEVER extract full sentences, experience descriptions, or verb phrases (e.g., convert "5 years experience in building REST APIs using Node" to ["REST API", "Node.js"]).
3. Normalize synonyms to standard names (e.g., "ReactJS" -> "React", "NodeJS" -> "Node.js", "Postgres" -> "PostgreSQL", "Amazon Web Services" -> "AWS").
4. Keep skills separated and clean. Do NOT combine multiple technologies into one string like "React/Redux/Node". Split them into separate items: ["React", "Redux", "Node.js"].

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with JSON:
{
  "candidateSkills": ["<atomic canonical 1-3 word skills found in resume>"],
  "jdRequiredSkills": ["<atomic canonical 1-3 word must-have skills stated in JD>"],
  "jdPreferredSkills": ["<atomic canonical 1-3 word nice-to-have skills stated in JD>"],
  "inferredRole": "<best-fit job title for this candidate, e.g. 'Full Stack Engineer'>",
  "seniorityLevel": "entry" | "mid" | "senior",
  "yearsOfExperience": <number, or null if not stated>
}`;
}
