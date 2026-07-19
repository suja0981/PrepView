import { InterviewModel } from "../interview/interview.model";
import { ReportModel } from "../report/report.model";

class DashboardRepository {
  async getStats(userId: string) {
    const totalInterviews = await InterviewModel.countDocuments({
      userId,
    });

    const completedInterviewsList = await InterviewModel.find({
      userId,
      status: "completed",
    });

    const completedInterviews = completedInterviewsList.length;

    const interviewIds = completedInterviewsList.map((i) => i._id);

    const reports = await ReportModel.find({
      interviewId: { $in: interviewIds },
    });

    const averageScore =
      reports.length === 0
        ? 0
        : (reports.reduce((sum, report) => sum + report.overallScore, 0) /
            reports.length) *
          10;

    // Create performance history (chronological order)
    const performanceHistory = completedInterviewsList
      .map((interview) => {
        const report = reports.find(
          (r) => r.interviewId.toString() === interview._id.toString()
        );
        return {
          date: interview.createdAt,
          score: report ? report.overallScore * 10 : 0,
        };
      })
      .filter((h) => h.score > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const recentInterviews = await InterviewModel.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      totalInterviews,
      completedInterviews,
      averageScore,
      recentInterviews,
      performanceHistory,
    };
  }
}

export const dashboardRepository = new DashboardRepository();
