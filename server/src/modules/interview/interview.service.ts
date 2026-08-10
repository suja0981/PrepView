import { callGemini } from "../../ai/services/gemini.service";
import { buildQuestionPrompt } from "../../ai/prompts/interview.prompt";
import { answerRepository } from "../answer";
import { questionRepository } from "../question";
import { interviewRepository } from "./interview.repository";
import type { CreateInterviewInput, SubmitAnswerInput } from "./interview.validation";
import { WEAK_ANSWER_THRESHOLD } from "./interview.validation";
import { AppError } from "../../shared/errors/app-error";
import { evaluateAnswer } from "../../ai/services/evaluation.service";
import { generateInterviewReport } from "../../ai/services/report.service";
import { MAX_QUESTIONS } from "../../shared/constants/interview";
import { evaluationRepository } from "../evaluation/evaluation.repository";
import { reportRepository } from "../report/report.repository";
import { User } from "../user/user.model";
import { InterviewModel } from "./interview.model";

// ── Plan limits ───────────────────────────────────────────────────────────────
const FREE_MONTHLY_TEXT_LIMIT = 3;
// Features that require Premium
const PREMIUM_MODES = ["voice"];
const PREMIUM_TYPES = ["system_design"];
const PREMIUM_DIFFICULTIES = ["hard"];


class InterviewService {
  async createInterview(userId: string, data: CreateInterviewInput) {
    // ── Plan enforcement ────────────────────────────────────────────────────
    const user = await User.findById(userId).select("plan");
    const isPremium = user?.plan === "premium";

    // Voice mode requires Premium
    if (PREMIUM_MODES.includes(data.mode) && !isPremium) {
      throw new AppError(
        "Voice interviews are a Premium feature. Upgrade to continue.",
        403,
        true, // upgradeRequired
      );
    }

    // DSA / System Design types require Premium
    if (PREMIUM_TYPES.includes(data.type) && !isPremium) {
      throw new AppError(
        "DSA and System Design interviews are Premium features. Upgrade to continue.",
        403,
        true,
      );
    }

    // Hard difficulty requires Premium
    if (PREMIUM_DIFFICULTIES.includes(data.difficulty) && !isPremium) {
      throw new AppError(
        "Hard difficulty is a Premium feature. Upgrade to continue.",
        403,
        true,
      );
    }

    // Free tier: max 3 text interviews per calendar month
    if (!isPremium) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyCount = await InterviewModel.countDocuments({
        userId,
        createdAt: { $gte: startOfMonth },
      });

      if (monthlyCount >= FREE_MONTHLY_TEXT_LIMIT) {
        throw new AppError(
          `Free plan allows ${FREE_MONTHLY_TEXT_LIMIT} interviews per month. Upgrade for unlimited access.`,
          403,
          true,
        );
      }
    }
    // ── End plan enforcement ─────────────────────────────────────────────────

    const interview = await interviewRepository.create(userId, data);


    const prompt = buildQuestionPrompt({
      role: data.role,
      type: data.type,
      difficulty: data.difficulty,
      techStacks: data.techStacks,
      mode: data.mode,
    });

    const questionData = await callGemini(prompt);

    const question = await questionRepository.create({
      interviewId: interview.id,
      question: questionData.question,
      topic: questionData.topic,
      difficulty: data.difficulty,
      order: 1,
    });

    return { interview, question };
  }

  async getInterview(id: string) {
    const interview = await interviewRepository.findById(id);

    if (!interview) {
      throw new AppError("Interview not found.", 404);
    }

    const currentQuestion = await questionRepository.findLatest(id);

    return { interview, currentQuestion };
  }

  async getUserInterviews(userId: string) {
    return interviewRepository.findByUser(userId);
  }

  async submitAnswer(interviewId: string, data: SubmitAnswerInput, userId: string) {
    // 1. Find interview
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) throw new AppError("Interview not found.", 404);

    // 1a. Ownership guard — only the interview owner can submit answers
    if (interview.userId.toString() !== userId) {
      throw new AppError("Access denied.", 403);
    }

    // 2. Find current question
    const question = await questionRepository.findById(data.questionId);
    if (!question) throw new AppError("Question not found.", 404);

    // 3. Idempotency check — block duplicate submission for the same question
    const existingAnswer = await answerRepository.findByQuestion(data.questionId);
    if (existingAnswer) {
      throw new AppError(
        "This question has already been answered. Refresh to continue.",
        409,
      );
    }

    // 4. Save the answer
    const answer = await answerRepository.create({
      interviewId,
      questionId: data.questionId,
      answer: data.answer,
      responseTime: data.responseTime,
    });

    // 5. Evaluate the answer with AI
    const evaluation = await evaluateAnswer({
      question: question.question,
      answer: data.answer,
      role: interview.role,
      type: interview.type,
      difficulty: interview.difficulty,
      mode: interview.mode as "voice" | "text",
    });

    // 6. Save evaluation
    await evaluationRepository.create({
      answerId: answer.id,
      interviewId,
      ...evaluation,
    });

    // 7. Increment questions asked counter and check if done
    interview.questionsAsked = (interview.questionsAsked || 0) + 1;
    await interview.save();

    if (interview.questionsAsked >= MAX_QUESTIONS) {
      // ── Interview complete: generate the final report ──────────────────────
      const questions = await questionRepository.findByInterview(interviewId);
      const answers = await answerRepository.findByInterview(interviewId);
      const evaluations = await evaluationRepository.findByInterview(interviewId);

      const answerMap = new Map(answers.map((a) => [a.questionId.toString(), a]));
      const evaluationMap = new Map(evaluations.map((e) => [e.answerId.toString(), e]));

      const report = await generateInterviewReport({
        role: interview.role,
        difficulty: interview.difficulty,
        evaluations: questions.map((q) => {
          const a = answerMap.get(q.id.toString());
          const e = a ? evaluationMap.get(a.id.toString()) : undefined;
          return {
            question: q.question,
            answer: a ? a.answer : "",
            feedback: e ? e.feedback : "",
            // Pass all numeric scores so they can be averaged in code, not re-guessed by AI
            overallScore: e ? e.overallScore : 0,
            technicalAccuracy: e ? e.technicalAccuracy : 0,
            reasoning: e ? e.reasoning : 0,
            communication: e ? e.communication : 0,
          };
        }),
      });

      const savedReport = await reportRepository.create({ interviewId, ...report });
      await interviewRepository.markCompleted(interviewId);

      return { completed: true, report: savedReport };
    }

    // ── Decide: follow-up on weak answer OR move to a new topic ───────────────
    const isWeakAnswer = evaluation.overallScore < WEAK_ANSWER_THRESHOLD;
    const followUpsLeft = (interview.followUpsRemaining ?? 0) > 0;
    const isFollowUp = isWeakAnswer && followUpsLeft;

    if (isFollowUp) {
      interview.followUpsRemaining = (interview.followUpsRemaining ?? 0) - 1;
      await interview.save();
    }

    // ── Topic tracking — collect all topics asked so far ──────────────────────
    const previousQuestions = await questionRepository.findByInterview(interviewId);
    const coveredTopics = previousQuestions.map((q) => q.topic).filter(Boolean);

    // Find the weakest scoring dimension to give targeted follow-up questions
    const dims = {
      technicalAccuracy: evaluation.technicalAccuracy,
      reasoning: evaluation.reasoning,
      communication: evaluation.communication,
    };
    const weakestDimension = isFollowUp
      ? (Object.entries(dims).sort(([, a], [, b]) => a - b)[0][0])
      : undefined;

    const prompt = buildQuestionPrompt({
      role: interview.role,
      type: interview.type,
      difficulty: interview.difficulty,
      techStacks: interview.techStacks || undefined,
      mode: interview.mode as "voice" | "text",
      previousQuestion: question.question,
      previousAnswer: data.answer,
      evaluationFeedback: evaluation.feedback,
      coveredTopics,
      isFollowUp,
      weakestDimension,
    });

    const nextQuestion = await callGemini(prompt);

    const savedQuestion = await questionRepository.create({
      interviewId,
      question: nextQuestion.question,
      topic: nextQuestion.topic,
      difficulty: interview.difficulty,
      order: interview.questionsAsked,
    });

    return {
      completed: false,
      evaluation, // returned so frontend can show interim feedback
      nextQuestion: savedQuestion,
      isFollowUp,
    };
  }

  async getInterviewReport(interviewId: string) {
    const report = await reportRepository.findByInterview(interviewId);
    if (!report) throw new AppError("Report not found.", 404);
    return report;
  }

  async getInterviewDetails(interviewId: string) {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) throw new AppError("Interview not found.", 404);

    const questions = await questionRepository.findByInterview(interviewId);
    const answers = await answerRepository.findByInterview(interviewId);
    const evaluations = await evaluationRepository.findByInterview(interviewId);
    const report = await reportRepository.findByInterview(interviewId);

    // Build lookup maps for O(1) joins
    const answerMap = new Map(answers.map((a) => [a.questionId.toString(), a]));
    const evaluationMap = new Map(evaluations.map((e) => [e.answerId.toString(), e]));

    // Merge each question with its answer and evaluation
    const questionDetails = questions.map((q) => {
      const answer = answerMap.get(q.id.toString());
      const evaluation = answer ? evaluationMap.get(answer.id.toString()) : undefined;
      return {
        ...q.toObject(),
        answer: answer ? answer.toObject() : null,
        evaluation: evaluation ? evaluation.toObject() : null,
      };
    });

    return { interview, questions: questionDetails, report };
  }
}

export const interviewService = new InterviewService();
