import { InterviewModel } from "./interview.model";
import { CreateInterviewInput } from "./interview.validation";

class InterviewRepository {
  async create(userId: string, Interview: CreateInterviewInput) {
    return InterviewModel.create({
      userId,
      ...Interview,
      questionsAsked: 0,
      startedAt: new Date(),
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

  async findByUserPaginated(
    userId: string,
    options: {
      page: number;
      limit: number;
      status?: string;
      type?: string;
      difficulty?: string;
    }
  ) {
    const { page, limit, status, type, difficulty } = options;
    const filter: Record<string, any> = { userId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    const [interviews, total] = await Promise.all([
      InterviewModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      InterviewModel.countDocuments(filter),
    ]);

    return { interviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const interviewRepository = new InterviewRepository();
