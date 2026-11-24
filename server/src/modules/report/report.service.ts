import { reportRepository } from "./report.repository";
import { interviewRepository } from "../interview/interview.repository";
import { questionRepository } from "../question";
import { answerRepository } from "../answer";
import { evaluationRepository } from "../evaluation/evaluation.repository";
import { AppError } from "../../shared/errors/app-error";

class ReportService {
  async getSharedReport(shareToken: string) {
    const report = await reportRepository.findByShareToken(shareToken);
    if (!report) {
      throw new AppError("Shared report not found or link has expired.", 404);
    }

    const interview = await interviewRepository.findById(report.interviewId.toString());
    if (!interview) {
      throw new AppError("Interview details not found.", 404);
    }

    const questions = await questionRepository.findByInterview(report.interviewId.toString());
    const answers = await answerRepository.findByInterview(report.interviewId.toString());
    const evaluations = await evaluationRepository.findByInterview(report.interviewId.toString());

    const answerMap = new Map(answers.map((a) => [a.questionId.toString(), a]));
    const evaluationMap = new Map(evaluations.map((e) => [e.answerId.toString(), e]));

    const questionDetails = questions.map((q) => {
      const answer = answerMap.get(q.id.toString());
      const evaluation = answer ? evaluationMap.get(answer.id.toString()) : undefined;
      return {
        _id: q._id,
        question: q.question,
        topic: q.topic,
        difficulty: q.difficulty,
        order: q.order,
        isFollowUp: q.isFollowUp,
        answer: answer
          ? {
              answer: answer.answer,
              responseTime: answer.responseTime,
            }
          : null,
        evaluation: evaluation
          ? {
              overallScore: evaluation.overallScore,
              technicalAccuracy: evaluation.technicalAccuracy,
              reasoning: evaluation.reasoning,
              communication: evaluation.communication,
              feedback: evaluation.feedback,
              weakTopics: evaluation.weakTopics,
            }
          : null,
      };
    });

    return {
      report: {
        overallScore: report.overallScore,
        technicalScore: report.technicalScore,
        communicationScore: report.communicationScore,
        reasoningScore: report.reasoningScore,
        strengths: report.strengths,
        improvements: report.improvements,
        summary: report.summary,
        shareToken: report.shareToken,
        createdAt: (report as any).createdAt,
      },
      interview: {
        role: interview.role,
        company: interview.company,
        type: interview.type,
        difficulty: interview.difficulty,
        mode: interview.mode,
        startedAt: interview.startedAt,
        endedAt: interview.endedAt,
        createdAt: interview.createdAt,
      },
      questions: questionDetails,
    };
  }
}

export const reportService = new ReportService();
