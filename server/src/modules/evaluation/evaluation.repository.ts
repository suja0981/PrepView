import { EvaluationModel } from "./evaluation.model";

class EvaluationRepository {
  async create(data: {
    answerId: string;
    interviewId: string;
    technicalAccuracy: number;
    reasoning: number;
    communication: number;
    overallScore: number;
    feedback: string;
    weakTopics: string[];
  }) {
    return EvaluationModel.create(data);
  }

  async findByAnswer(answerId: string) {
    return EvaluationModel.findOne({ answerId });
  }

  async findByInterview(interviewId: string) {
    return EvaluationModel.find({ interviewId });
  }
}

export const evaluationRepository = new EvaluationRepository();
