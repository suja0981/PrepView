export function buildReportPrompt(data: {
  role: string;
  difficulty: string;
  evaluations: {
    question: string;
    answer: string;
    feedback: string;
    overallScore: number;
  }[];
}) {
  const evaluationsText = data.evaluations
    .map(
      (item, index) => `
Question ${index + 1}: ${item.question}
Candidate's Answer: ${item.answer}
Feedback: ${item.feedback}
Score: ${item.overallScore}/10
`
    )
    .join("\n---\n");

  return `
You are an experienced technical interviewer.

Based on the complete interview, generate a final report.

Role: ${data.role}
Difficulty: ${data.difficulty}

Interview Q&A and Feedback:
${evaluationsText}

Return ONLY valid JSON matching this schema:
{
  "overallScore": 8,
  "technicalScore": 8,
  "communicationScore": 7,
  "reasoningScore": 9,
  "strengths": [
    "strength description 1",
    "strength description 2"
  ],
  "improvements": [
    "improvement description 1",
    "improvement description 2"
  ],
  "summary": "overall summary of candidate performance"
}
`;
}
