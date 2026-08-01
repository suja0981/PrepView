interface QuestionPromptInput {
  role: string;
  type: string;
  difficulty: string;
  company?: string;
  techStacks?: string;
  previousQuestion?: string;
  previousAnswer?: string;
  evaluationFeedback?: string;
  // Topics already asked — AI should avoid repeating them
  coveredTopics?: string[];
  // When true, the AI digs deeper on the same weak topic instead of moving on
  isFollowUp?: boolean;
}

// Returns topic-specific guidance based on interview type
function getTypeGuidance(type: string, techStacks?: string): string {
  switch (type) {
    case "behavioral":
      return "Ask a behavioral question (STAR format expected). Focus on situations, actions, and outcomes.";
    case "dsa":
      return "Ask a Data Structures & Algorithms question. Focus on array/string manipulation, trees, graphs, dynamic programming, or sorting. Expect the candidate to walk through the approach AND explain time/space complexity.";
    case "system_design":
      return "Ask a system design question. Focus on scalability, trade-offs, database choices, API design, or distributed systems. Expect the candidate to discuss architecture options and trade-offs.";
    case "mixed":
      return "Alternate between technical, behavioral, and system design questions. Keep each question clearly in one domain.";
    default:
      // technical
      return `Ask a technical question. Focus on concepts, code, architecture, or problem-solving.${
        techStacks ? ` The questions MUST heavily focus on these technologies: ${techStacks}` : ""
      }`;
  }
}

export function buildQuestionPrompt(data: QuestionPromptInput): string {
  const isFirst = !data.previousQuestion;
  const typeGuidance = getTypeGuidance(data.type, data.techStacks);

  // Follow-up mode: dig deeper on the same weak topic
  const followUpPrefix = data.isFollowUp
    ? `The candidate gave a WEAK answer to the previous question. Do NOT move on to a new topic.
Instead, ask a targeted follow-up question that probes the same concept more deeply.
Help uncover whether the gap is conceptual or just lack of articulation.`
    : "";

  // Topic tracking: prevent AI from repeating already-asked topics
  const topicAvoidance =
    data.coveredTopics && data.coveredTopics.length > 0
      ? `Topics already covered in this session (DO NOT ask about these again): ${data.coveredTopics.join(", ")}.
Choose a fresh, distinct topic for the next question.`
      : "";

  const contextBlock = isFirst
    ? ""
    : `
Previous question: ${data.previousQuestion}
Candidate answer: ${data.previousAnswer}
${data.evaluationFeedback ? `Feedback on that answer: ${data.evaluationFeedback}` : ""}
${data.isFollowUp ? "" : "Generate the next logical question on a new topic."}`;

  return `You are a senior ${data.role} interviewer at ${data.company ?? "a top tech company"}.

Interview type: ${data.type}
Difficulty: ${data.difficulty}
${typeGuidance}
${topicAvoidance}
${followUpPrefix}
${contextBlock}

Respond ONLY with JSON:
{"question":"...","topic":"..."}`;
}

// ── Evaluation prompt ─────────────────────────────────────────────────────────

interface EvaluationPromptInput {
  question: string;
  answer: string;
  role: string;
  type: string;
  difficulty: string;
}

function getEvalTypeNote(type: string): string {
  switch (type) {
    case "behavioral":
      return "Check for STAR format (Situation, Task, Action, Result). Penalise vague, story-less answers. Reward specific examples with measurable outcomes.";
    case "dsa":
      return "Check: (1) Correct algorithm choice, (2) Accurate time and space complexity explanation, (3) Handling of edge cases. Penalise answers that only describe the approach without mentioning Big-O.";
    case "system_design":
      return "Check: (1) Did they identify scale requirements? (2) Did they discuss trade-offs between options? (3) Did they choose appropriate data stores and APIs? Penalise answers that jump to solutions without discussing trade-offs.";
    default:
      return "Check technical accuracy, depth, and clarity of explanation.";
  }
}

export function buildEvaluationPrompt(data: EvaluationPromptInput): string {
  const scale =
    data.difficulty === "hard"
      ? "Evaluate at a senior/staff engineer standard. Be strict."
      : data.difficulty === "easy"
      ? "Evaluate at a junior level. Be fair and encouraging."
      : "Evaluate at a mid-level engineer standard.";

  const typeNote = getEvalTypeNote(data.type);

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
