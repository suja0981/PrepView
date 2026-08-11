// ── Domain-specific prompt builders for PrepView interview engine ──────────────
// Each interview type gets its own question strategy and evaluation rubric.
// Company field removed — replaced by role presets and tech stacks.

interface QuestionPromptInput {
  role: string;
  type: string;
  difficulty: string;
  techStacks?: string;
  mode?: "voice" | "text";
  previousQuestion?: string;
  previousAnswer?: string;
  evaluationFeedback?: string;
  weakestDimension?: string; // "technicalAccuracy" | "reasoning" | "communication"
  coveredTopics?: string[];
  isFollowUp?: boolean;
}

// ── Difficulty calibration by experience level ────────────────────────────────
function getDifficultyContext(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "Target: entry-level (0–1 years experience). Ask foundational questions. Avoid advanced system internals.";
    case "hard":
      return "Target: senior engineer (4+ years). Expect deep trade-off discussions, edge cases, and architectural decisions.";
    default:
      return "Target: mid-level engineer (1–3 years experience). Expect solid fundamentals and some real-world experience.";
  }
}

// ── No live-coding constraint — applies to ALL question types ────────────────
// PrepView has no code editor. Every question MUST be answerable in spoken words
// or typed prose. Never ask the candidate to write, implement, or code anything.
const NO_CODE_CONSTRAINT = `CRITICAL CONSTRAINT — NO CODING QUESTIONS:
- NEVER ask the candidate to write code, implement a function, or produce any code output.
- NEVER use phrases like: "write a function", "implement", "code this", "write a program", "give me the code for", "return the output of", "what does this code print".
- Instead, ask candidates to EXPLAIN concepts, DESCRIBE approaches, REASON through trade-offs, DISCUSS architecture decisions, or WALK THROUGH their debugging process verbally.
- Example GOOD: "How does React's reconciliation algorithm work and why is it important?"
- Example BAD: "Write a useEffect hook that fetches user data on mount."`;

// ── Type-specific question strategy ──────────────────────────────────────────
function getQuestionStrategy(type: string, role: string, techStacks?: string): string {
  const stack = techStacks ? ` Focus heavily on: ${techStacks}.` : "";

  switch (type) {
    case "behavioral":
      return `Ask a behavioral question in STAR format (Situation, Task, Action, Result).
Topics: teamwork, conflict resolution, deadlines, failure/learning, ownership, communication.
Push for specific real examples — reject vague hypotheticals.${stack}
${NO_CODE_CONSTRAINT}`;

    case "system_design":
      return `Ask a system design question appropriate for a ${role}.
Follow this structure: scale requirements → high-level components → data model → API design → trade-offs → failure modes.
Avoid questions that need a whiteboard — ask ones a candidate can reason through verbally.${stack}
${NO_CODE_CONSTRAINT}`;

    case "mixed":
      return `Alternate between technical concept, behavioral, and light system design questions.
Keep each question clearly in one domain. Do not mix domains within a single question.${stack}
${NO_CODE_CONSTRAINT}`;

    default:
      // technical — the broadest type, covers all non-SDE domains too
      return `Ask a technical question that tests real on-the-job knowledge for a ${role}.${stack}
Focus on: how something works under the hood, when to choose one approach over another, how to debug a class of problem, or real production trade-offs.
Do NOT ask the candidate to write code, implement anything, or produce code output — they must answer verbally or in prose.
${NO_CODE_CONSTRAINT}`;
  }
}

// ── Domain-specific depth hints injected per role category ───────────────────
function getRoleContext(role: string): string {
  const r = role.toLowerCase();

  if (r.includes("qa") || r.includes("test") || r.includes("sdet")) {
    return "Focus on test strategy, test case design, automation frameworks (Selenium, Cypress, Playwright, Jest), bug reporting, and shift-left testing practices.";
  }
  if (r.includes("devops") || r.includes("sre") || r.includes("platform") || r.includes("infrastructure")) {
    return "Focus on CI/CD pipelines, container orchestration (Docker, Kubernetes), monitoring/alerting, incident management, and infrastructure-as-code.";
  }
  if (r.includes("data engineer") || r.includes("etl") || r.includes("data pipeline")) {
    return "Focus on data pipelines, batch vs streaming (Kafka, Spark, Airflow), data warehouse design (Snowflake, BigQuery), and data quality.";
  }
  if (r.includes("data analyst") || r.includes("business analyst") || r.includes("analytics")) {
    return "Focus on SQL proficiency, data modelling, dashboards (Tableau, Looker), metrics definition, A/B testing, and translating data to business insights.";
  }
  if (r.includes("ml") || r.includes("machine learning") || r.includes("ai engineer") || r.includes("data scientist")) {
    return "Focus on model training/evaluation, feature engineering, overfitting/underfitting trade-offs, model deployment, MLOps, and practical ML system design.";
  }
  if (r.includes("mobile") || r.includes("ios") || r.includes("android")) {
    return "Focus on mobile architecture (MVC/MVVM), state management, lifecycle, networking, performance optimisation, and app store deployment.";
  }
  if (r.includes("cloud") || r.includes("solutions architect")) {
    return "Focus on cloud services (AWS/GCP/Azure), cost optimisation, security best practices, serverless, and multi-region architecture.";
  }
  if (r.includes("product manager") || r.includes("apm") || r.includes("product")) {
    return "Focus on product thinking, prioritisation frameworks (RICE, MoSCoW), PRD writing, metrics definition, and cross-functional stakeholder management.";
  }
  // default: generic SDE / fullstack
  return "";
}

// ── Main question prompt builder ──────────────────────────────────────────────
export function buildQuestionPrompt(data: QuestionPromptInput): string {
  const isFirst = !data.previousQuestion;
  const strategy = getQuestionStrategy(data.type, data.role, data.techStacks);
  const difficultyCtx = getDifficultyContext(data.difficulty);
  const roleCtx = getRoleContext(data.role);

  const topicAvoidance = data.coveredTopics?.length
    ? `Topics already covered — do NOT repeat: ${data.coveredTopics.join(", ")}.`
    : "";

  // Follow-up: probe the specific weak dimension rather than a generic re-ask
  const followUpBlock = data.isFollowUp
    ? `The candidate gave a weak answer. Do NOT move to a new topic.
Ask a targeted follow-up that probes the same concept more deeply.
${data.weakestDimension === "technicalAccuracy" ? "Their explanation sounded fluent but was technically incorrect. Test whether they truly understand the concept." : ""}
${data.weakestDimension === "reasoning" ? "They identified the right concept but could not reason through the trade-offs or edge cases. Push on that." : ""}
${data.weakestDimension === "communication" ? "Their thinking seems correct but they struggled to articulate it. Ask them to explain in a simpler way." : ""}`
    : "";

  const contextBlock = isFirst ? "" : `
Previous question: ${data.previousQuestion}
Candidate's answer: ${data.previousAnswer}
${data.evaluationFeedback ? `Feedback on that answer: ${data.evaluationFeedback}` : ""}
${!data.isFollowUp ? "Generate the next question on a fresh topic." : ""}`;

  return `You are a professional technical interviewer conducting a ${data.type} interview for a ${data.role} role.
${difficultyCtx}
${roleCtx}
${strategy}
${topicAvoidance}
${followUpBlock}
${contextBlock}

Respond ONLY with valid JSON:
{"question":"<your question here>","topic":"<short topic label>"}`;
}

// ── Evaluation prompt ─────────────────────────────────────────────────────────

interface EvaluationPromptInput {
  question: string;
  answer: string;
  role: string;
  type: string;
  difficulty: string;
  mode?: "voice" | "text";
}

function getEvalRubric(type: string): string {
  switch (type) {
    case "behavioral":
      return "Check for STAR structure: Situation, Task, Action, Result. Penalise vague or hypothetical answers. Reward specific examples with measurable outcomes.";
    case "system_design":
      return "Check: (1) Did they address scale? (2) Did they discuss trade-offs between design options? (3) Did they choose appropriate data stores and APIs? (4) Did they mention failure modes? Penalise jumping to solutions without trade-off analysis.";
    case "dsa":
      return "Check: (1) Correct algorithm approach, (2) Time and space complexity stated explicitly, (3) Edge cases handled. Penalise answers that describe the approach without Big-O analysis.";
    default:
      return "Check technical accuracy, practical depth, and clarity of explanation. Reward real-world reasoning over textbook definitions.";
  }
}

export function buildEvaluationPrompt(data: EvaluationPromptInput): string {
  const rubric = getEvalRubric(data.type);

  const difficultyStandard =
    data.difficulty === "hard"
      ? "Apply a senior engineer bar. Be strict on depth and trade-off awareness."
      : data.difficulty === "easy"
      ? "Apply a junior engineer bar. Be fair and encouraging. Reward foundational understanding."
      : "Apply a mid-level engineer bar. Expect solid fundamentals and some practical experience.";

  // Voice responses are naturally conversational — penalise grammar/style less
  const voiceNote = data.mode === "voice"
    ? "IMPORTANT: This is a spoken voice response. The candidate may use filler words and conversational phrasing. Judge the conceptual quality of their answer, not grammar or sentence structure."
    : "";

  return `You are evaluating a ${data.role} candidate on a ${data.type} question.
${difficultyStandard}
${rubric}
${voiceNote}

Question: ${data.question}
Candidate's answer: ${data.answer}

Respond ONLY with valid JSON:
{
  "technicalAccuracy": <0-10>,
  "reasoning": <0-10>,
  "communication": <0-10>,
  "overallScore": <0-10>,
  "feedback": "<2-3 sentence specific, actionable feedback>",
  "weakTopics": ["<topic>"]
}`;
}
