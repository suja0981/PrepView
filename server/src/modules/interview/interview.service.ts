import { callGemini } from "../../ai/services/gemini.service";
import { buildQuestionPrompt } from "../../ai/prompts/interview.prompt";
import { answerRepository } from "../answer";
import { questionRepository } from "../question";
import { interviewRepository } from "./interview.repository";
import type {
  CreateInterviewInput,
  SubmitAnswerInput,
} from "./interview.validation";
import { AppError } from "../../shared/errors/app-error";
import { evaluateAnswer } from "../../ai/services/evaluation.service";
import { generateInterviewReport } from "../../ai/services/report.service";
import { MAX_QUESTIONS } from "../../shared/constants/interview";
import { evaluationRepository } from "../evaluation/evaluation.repository";
import { reportRepository } from "../report/report.repository";

class InterviewService {
  async createInterview(userId: string, data: CreateInterviewInput) {
    const interview = await interviewRepository.create(userId, data);

    const prompt = buildQuestionPrompt({
      role: data.role,
      type: data.type,
      company: data.company,
      difficulty: data.difficulty,
      techStacks: data.techStacks,
    });

    const questionData = await callGemini(prompt);

    const question = await questionRepository.create({
      interviewId: interview.id,
      question: questionData.question,
      topic: questionData.topic,
      difficulty: data.difficulty,
      order: 1,
    });

    return {
      interview,
      question,
    };
  }

  async getInterview(id: string) {
    const interview = await interviewRepository.findById(id);

    if (!interview) {
      throw new AppError("Interview not found.", 404);
    }

    const currentQuestion = await questionRepository.findLatest(id);

    return {
      interview,
      currentQuestion,
    };
  }

  async getUserInterviews(userId: string) {
    return interviewRepository.findByUser(userId);
  }

  async submitAnswer(interviewId: string, data: SubmitAnswerInput) {
    // 1 Find interview

    const interview = await interviewRepository.findById(interviewId);

    if (!interview) {
      throw new AppError("Interview not found.", 404);
    }

    // 2 Find current question

    const question = await questionRepository.findById(data.questionId);

    if (!question) {
      throw new AppError("Question not found.", 404);
    }

    // 3 Save answer

    const answer = await answerRepository.create({
      interviewId,

      questionId: data.questionId,

      answer: data.answer,

      responseTime: data.responseTime,
    });

    // 4 Evaluate answer

    const evaluation = await evaluateAnswer({
      question: question.question,
      answer: data.answer,
      role: interview.role,
      type: interview.type,
      difficulty: interview.difficulty,
    });

    // 5 Save evaluation

    await evaluationRepository.create({
      answerId: answer.id,
      interviewId,
      ...evaluation,
    });

    // 6 Check if max questions reached
    interview.questionsAsked = (interview.questionsAsked || 0) + 1;
    await interview.save();

    if (interview.questionsAsked >= MAX_QUESTIONS) {
      const questions = await questionRepository.findByInterview(interviewId);

      const answers = await answerRepository.findByInterview(interviewId);

      const evaluations =
        await evaluationRepository.findByInterview(interviewId);

      const answerMap = new Map(
        answers.map((a) => [a.questionId.toString(), a]),
      );
      const evaluationMap = new Map(
        evaluations.map((e) => [e.answerId.toString(), e]),
      );

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
            overallScore: e ? e.overallScore : 0,
          };
        }),
      });

      const savedReport = await reportRepository.create({
        interviewId,
        ...report,
      });

      await interviewRepository.markCompleted(interviewId);

      return {
        completed: true,
        report: savedReport,
      };
    }

    interview.questionsAsked = (interview.questionsAsked || 0) + 1;
    await interview.save();

    const prompt = buildQuestionPrompt({
      role: interview.role,
      type: interview.type,
      company: interview.company || undefined,
      difficulty: interview.difficulty,
      techStacks: interview.techStacks || undefined,
      previousQuestion: question.question,
      previousAnswer: data.answer,
      evaluationFeedback: evaluation.feedback,
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
      evaluation,
      nextQuestion: savedQuestion,
    };
  }
  async getInterviewReport(interviewId: string) {
    const report = await reportRepository.findByInterview(interviewId);

    if (!report) {
      throw new AppError("Report not found.", 404);
    }

    return report;
  }
  async getInterviewDetails(interviewId: string) {
    const interview = await interviewRepository.findById(interviewId);

    if (!interview) {
      throw new AppError("Interview not found.", 404);
    }

    const questions = await questionRepository.findByInterview(interviewId);

    const answers = await answerRepository.findByInterview(interviewId);

    const report = await reportRepository.findByInterview(interviewId);

    return {
      interview,
      questions,
      answers,
      report,
    };
  }
}

export const interviewService = new InterviewService();
