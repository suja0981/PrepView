export interface RecentInterview {
  _id: string;
  role: string;
  company?: string;
  difficulty: string;
  type: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
}

export interface WeakTopic {
  topic: string;
  count: number;
}

export interface ScoreByType {
  type: string;
  avgScore: number;
  count: number;
}

export interface DashboardData {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  recentInterviews: RecentInterview[];
  performanceHistory?: { date: string; score: number }[];
  weakTopics?: WeakTopic[];
  scoreByType?: ScoreByType[];
}
