import { InterviewModel } from "./interview.model";
import { CreateInterviewInput } from "./interview.validation";

class InterviewRepository {
  async create(userId: string, Interview: CreateInterviewInput) {
    return InterviewModel.create({
      userId,
      ...Interview,
      questionsAsked: 1,
    });
  }

  async findById(id: string) {
    return InterviewModel.findById(id);
  }

  async findByUser(userId: string) {
    return InterviewModel.find({ userId }).sort({
      createdAt: -1,
    });
  }

  async startInterview(id: string) {
    return InterviewModel.findByIdAndUpdate(
      id,
      {
        status: "in_progress",
        startedAt: new Date(),
      },
      { new: true },
    );
  }

  async updateStatus(
    id: string,
    status: "pending" | "in_progress" | "completed",
  ) {
    return InterviewModel.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
      },
    );
  }

  async markCompleted(id: string) {
    return InterviewModel.findByIdAndUpdate(
      id,
      {
        status: "completed",
        endedAt: new Date(),
      },
      {
        new: true,
      },
    );
  }
}

export const interviewRepository = new InterviewRepository();
