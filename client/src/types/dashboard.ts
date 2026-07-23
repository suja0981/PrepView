export interface RecentInterview {
  _id: string;
  role: string;
  company?: string;
  difficulty: string;
  type: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
}

export interface DashboardData {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  recentInterviews: RecentInterview[];
  performanceHistory?: { date: string; score: number }[];
}
