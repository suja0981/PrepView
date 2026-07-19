import { QuestionModel } from "./question.model";

class QuestionRepository {
  async create(data: {
    interviewId: string;
    question: string;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    order: number;
    isFollowUp?: boolean;
  }) {
    return QuestionModel.create(data);
  }

  async findByInterview(interviewId: string) {
    return QuestionModel.find({ interviewId }).sort({
      order: 1,
    });
  }

  async findLatest(interviewId: string) {
    return QuestionModel.findOne({ interviewId }).sort({
      order: -1,
    });
  }

  async findById(id: string) {
    return QuestionModel.findById(id);
  }

  async countByInterview(interviewId: string) {
    return QuestionModel.countDocuments({ interviewId });
  }
}

export const questionRepository = new QuestionRepository();
