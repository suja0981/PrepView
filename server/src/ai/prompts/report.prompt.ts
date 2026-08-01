/**
 * Builds the prompt for the narrative-only part of the final report.
 * Numeric scores (overall, technical, communication, reasoning) are
 * already computed by averaging stored EvaluationModel rows — they
 * are passed in here so the AI's narrative stays consistent with them.
 *
 * The AI's job: write the summary, list strengths, list improvements.
 * Nothing else.
 */
export function buildReportNarrativePrompt(data: {
  role: string;
  difficulty: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  reasoningScore: number;
  evaluations: {
    question: string;
    answer: string;
    feedback: string;
    overallScore: number;
  }[];
}): string {
  const evaluationsText = data.evaluations
    .map(
      (item, i) => `
Q${i + 1}: ${item.question}
Answer: ${item.answer}
Feedback: ${item.feedback}
Score: ${item.overallScore}/10`,
    )
    .join("\n---\n");

  return `You are an experienced technical interviewer writing a final report.

Role: ${data.role}
Difficulty: ${data.difficulty}

Pre-computed scores (do NOT change these, just use them to inform your writing):
  Overall:       ${data.overallScore}/10
  Technical:     ${data.technicalScore}/10
  Communication: ${data.communicationScore}/10
  Reasoning:     ${data.reasoningScore}/10

Full interview Q&A:
${evaluationsText}

Write only the narrative parts. Return ONLY valid JSON:
{
  "summary": "<3-4 sentence overall assessment consistent with the scores above>",
  "strengths": ["<specific strength observed>", "..."],
  "improvements": ["<specific area to improve>", "..."]
}`;
}
