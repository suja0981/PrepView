import { QuestionBankModel, BankQuestion } from "./question-bank.model";

export interface CandidateSearchParams {
  type: string;
  difficulty: string;
  role?: string;
  techStacks?: string[];
  coveredTopics?: string[];
  limit?: number;
}

class QuestionBankRepository {
  async findCandidates(params: CandidateSearchParams): Promise<any[]> {
    const query: Record<string, any> = {
      type: params.type,
      difficulty: params.difficulty,
    };

    if (params.coveredTopics && params.coveredTopics.length > 0) {
      query.topic = { $nin: params.coveredTopics };
    }

    if (params.role) {
      const roleRegex = new RegExp(params.role.split(" ")[0], "i");
      query.$or = [
        { roles: { $in: [roleRegex] } },
        { roles: { $size: 0 } },
      ];
    }

    const limit = params.limit || 5;

    return QuestionBankModel.find(query)
      .sort({ avgEvalScore: -1, usageCount: 1 })
      .limit(limit)
      .lean();
  }

  async incrementUsage(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    await QuestionBankModel.updateMany(
      { _id: { $in: ids } },
      { $inc: { usageCount: 1 } },
    );
  }

  async upsertGeneratedQuestion(data: {
    question: string;
    topic: string;
    type: string;
    difficulty: string;
    roles?: string[];
    techStacks?: string[];
    avgEvalScore: number;
  }): Promise<void> {
    const existing = await QuestionBankModel.findOne({
      $or: [
        { question: data.question.trim() },
        { topic: data.topic.trim(), type: data.type as any, difficulty: data.difficulty as any },
      ],
    } as any).lean();

    if (existing) {
      // Update average evaluation score with new sample
      const prevAvg = existing.avgEvalScore || 0;
      const newAvg = prevAvg > 0
        ? Math.round(((prevAvg + data.avgEvalScore) / 2) * 10) / 10
        : data.avgEvalScore;

      await QuestionBankModel.findByIdAndUpdate(existing._id, {
        $set: { avgEvalScore: newAvg },
        $inc: { usageCount: 1 },
      });
      return;
    }

    await QuestionBankModel.create({
      ...data,
      type: data.type as any,
      difficulty: data.difficulty as any,
      source: "generated",
      usageCount: 1,
    } as any);
  }

  async seedQuestions(questions: Partial<BankQuestion>[]): Promise<number> {
    const ops = questions.map((q) => ({
      updateOne: {
        filter: { question: q.question },
        update: { $setOnInsert: q },
        upsert: true,
      },
    }));

    const result = await QuestionBankModel.bulkWrite(ops);
    return result.upsertedCount;
  }

  async count(): Promise<number> {
    return QuestionBankModel.countDocuments();
  }
}

export const questionBankRepository = new QuestionBankRepository();
