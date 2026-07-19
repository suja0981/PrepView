import { AnswerModel } from "./answer.model";

class AnswerRepository {
  async create(data: {
    interviewId: string;
    questionId: string;
    answer: string;
    responseTime: number;
  }) {
    return AnswerModel.create(data);
  }

  async findByQuestion(questionId: string) {
    return AnswerModel.findOne({ questionId });
  }

  async findByInterview(interviewId: string) {
    return AnswerModel.find({ interviewId });
  }
}

export const answerRepository = new AnswerRepository();
