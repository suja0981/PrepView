import { ClipboardList, CircleCheckBig, TrendingUp, Clock, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import StatCard from "@/pages/dashboard/StatCard";
import RecentInterviews from "@/pages/dashboard/RecentIntervie";
import ScoreChart from "@/pages/dashboard/ScoreChart";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuthContext } from "@/context/AuthContext";

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
      <Skeleton className="h-7 w-40" />
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[88px] sm:h-[104px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard();
  const { user } = useAuthContext();

  if (isLoading) return <DashboardSkeleton />;

  const stats = data;
  const pending = (stats?.totalInterviews ?? 0) - (stats?.completedInterviews ?? 0);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here's how your practice is going.
          </p>
        </div>
        <Link
          to="/interview/create"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 sm:px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Interview</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={stats?.totalInterviews ?? 0} icon={<ClipboardList size={15} />} />
        <StatCard title="Completed" value={stats?.completedInterviews ?? 0} icon={<CircleCheckBig size={15} />} />
        <StatCard title="Avg Score" value={`${Math.round(stats?.averageScore ?? 0)}%`} icon={<TrendingUp size={15} />} />
        <StatCard title="Pending" value={pending} icon={<Clock size={15} />} />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left col (Chart) */}
        <div className="lg:col-span-2">
          <ScoreChart data={stats?.performanceHistory ?? []} />
        </div>

        {/* Right col (Recent) */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Recent interviews</h2>
          <RecentInterviews interviews={stats?.recentInterviews ?? []} />
        </div>
      </div>

    </div>
  );
}