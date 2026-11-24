import { InterviewModel } from "../interview/interview.model";
import { EvaluationModel } from "../evaluation/evaluation.model";
import { ReportModel } from "../report/report.model";
import mongoose from "mongoose";

class DashboardRepository {
  async getStats(userId: string) {
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Single aggregation: interviews → lookup reports
    const result = await InterviewModel.aggregate([
      { $match: { userId: userObjId } },
      {
        $lookup: {
          from: "reports",
          localField: "_id",
          foreignField: "interviewId",
          as: "report",
        },
      },
      { $addFields: { report: { $arrayElemAt: ["$report", 0] } } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          completedInterviews: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          totalScore: {
            $sum: { $ifNull: ["$report.overallScore", 0] },
          },
          scoredCount: {
            $sum: { $cond: [{ $ifNull: ["$report.overallScore", false] }, 1, 0] },
          },
          performanceHistory: {
            $push: {
              $cond: [
                { $eq: ["$status", "completed"] },
                { date: "$createdAt", score: { $multiply: [{ $ifNull: ["$report.overallScore", 0] }, 10] } },
                "$$REMOVE",
              ],
            },
          },
        },
      },
    ]);

    const agg = result[0] ?? {
      totalInterviews: 0,
      completedInterviews: 0,
      totalScore: 0,
      scoredCount: 0,
      performanceHistory: [],
    };

    const averageScore = agg.scoredCount > 0 ? (agg.totalScore / agg.scoredCount) * 10 : 0;

    const performanceHistory = (agg.performanceHistory as Array<{ date: Date; score: number }>)
      .filter((h) => h.score > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const recentInterviews = await InterviewModel.find({ userId: userObjId })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      totalInterviews: agg.totalInterviews,
      completedInterviews: agg.completedInterviews,
      averageScore: Math.round(averageScore),
      recentInterviews,
      performanceHistory,
    };
  }

  async getWeakTopics(userId: string) {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const interviews = await InterviewModel.find({ userId: userObjId }, "_id");
    const interviewIds = interviews.map((i) => i._id);

    const result = await EvaluationModel.aggregate([
      { $match: { interviewId: { $in: interviewIds } } },
      { $unwind: "$weakTopics" },
      { $group: { _id: "$weakTopics", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { topic: "$_id", count: 1, _id: 0 } },
    ]);

    return result;
  }

  async getScoreByType(userId: string) {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const result = await InterviewModel.aggregate([
      { $match: { userId: userObjId, status: "completed" } },
      {
        $lookup: {
          from: "reports",
          localField: "_id",
          foreignField: "interviewId",
          as: "report",
        },
      },
      { $addFields: { report: { $arrayElemAt: ["$report", 0] } } },
      { $match: { "report.overallScore": { $exists: true } } },
      {
        $group: {
          _id: "$type",
          avgScore: { $avg: { $multiply: ["$report.overallScore", 10] } },
          count: { $sum: 1 },
        },
      },
      { $project: { type: "$_id", avgScore: { $round: ["$avgScore", 1] }, count: 1, _id: 0 } },
    ]);

    return result;
  }
}

export const dashboardRepository = new DashboardRepository();
