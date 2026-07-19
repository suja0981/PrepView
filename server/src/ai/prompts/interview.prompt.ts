interface QuestionPromptInput {
  role: string;
  type: string;
  difficulty: string;
  company?: string;
  techStacks?: string;
  previousQuestion?: string;
  previousAnswer?: string;
  evaluationFeedback?: string;
}

export function buildQuestionPrompt(data: QuestionPromptInput): string {
  const isFirst = !data.previousQuestion;

  const typeGuidance =
    data.type === "behavioral"
      ? "Ask a behavioral question (STAR format expected). Focus on situations, actions, outcomes."
      : `Ask a technical question. Focus on concepts, code, architecture, or problem-solving. ${data.techStacks ? `The questions MUST heavily focus on these specific technologies: ${data.techStacks}` : ""}`;

  const contextBlock = isFirst
    ? ""
    : `
Previous question: ${data.previousQuestion}
Candidate answer: ${data.previousAnswer}
${data.evaluationFeedback ? `Feedback on that answer: ${data.evaluationFeedback}` : ""}
Generate the next logical follow-up or a new topic question.`;

  return `You are a senior ${data.role} interviewer at ${data.company ?? "a top tech company"}.

Interview type: ${data.type}
Difficulty: ${data.difficulty}
${typeGuidance}
${contextBlock}

Respond ONLY with JSON:
{"question":"...","topic":"..."}`;
}

interface EvaluationPromptInput {
  question: string;
  answer: string;
  role: string;
  type: string;
  difficulty: string;
}

export function buildEvaluationPrompt(data: EvaluationPromptInput): string {
  const scale =
    data.difficulty === "hard"
      ? "Evaluate at a senior/staff engineer standard. Be strict."
      : data.difficulty === "easy"
      ? "Evaluate at a junior level. Be fair and encouraging."
      : "Evaluate at a mid-level engineer standard.";

  const typeNote =
    data.type === "behavioral"
      ? "Check for STAR format (Situation, Task, Action, Result). Penalise vague answers."
      : "Check technical accuracy, depth, and clarity of explanation.";

  return `You are evaluating a ${data.role} candidate.
${scale}
${typeNote}

Question: ${data.question}
Answer: ${data.answer}

Respond ONLY with JSON:
{
  "technicalAccuracy": <0-10>,
  "reasoning": <0-10>,
  "communication": <0-10>,
  "overallScore": <0-10>,
  "feedback": "<2-3 sentence specific feedback>",
  "weakTopics": ["<topic>"]
}`;
}
