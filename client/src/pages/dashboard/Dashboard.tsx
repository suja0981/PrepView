import { ClipboardList, CircleCheckBig, TrendingUp, Clock, Plus, FileSearch, Crown, Zap } from "lucide-react";
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

  // Completion rate for a subtle progress bar on the completed card
  const completionRate = stats?.totalInterviews
    ? Math.round(((stats.completedInterviews ?? 0) / stats.totalInterviews) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              Welcome back, {firstName}
            </h1>
            {/* Plan badge */}
            {user?.plan === "premium" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                <Crown size={9} /> Premium
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Free
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here's how your practice is going.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/resume"
            className="hidden sm:flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <FileSearch size={14} />
            Analyze Resume
          </Link>
          <Link
            to="/interview/create"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 sm:px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Interview</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {/* Stat cards — 2 cols on mobile, 4 on desktop */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={stats?.totalInterviews ?? 0} icon={<ClipboardList size={15} />} />
        <StatCard
          title="Completed"
          value={stats?.completedInterviews ?? 0}
          icon={<CircleCheckBig size={15} />}
          subtext={stats?.totalInterviews ? `${completionRate}% completion rate` : undefined}
        />
        <StatCard title="Avg Score" value={`${Math.round(stats?.averageScore ?? 0)}%`} icon={<TrendingUp size={15} />} />
        <StatCard title="Pending" value={pending} icon={<Clock size={15} />} />
      </div>

      {/* Upgrade CTA — shown only for free users */}
      {user?.plan !== "premium" && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Zap size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Unlock voice, DSA & unlimited interviews</p>
              <p className="text-[12px] text-muted-foreground">Upgrade to Premium for $9/month</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Crown size={11} /> Upgrade
          </Link>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left col: performance chart */}
        <div className="lg:col-span-2">
          <ScoreChart data={stats?.performanceHistory ?? []} />
        </div>

        {/* Right col: recent interviews */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Recent interviews</h2>
          <RecentInterviews interviews={stats?.recentInterviews ?? []} />
        </div>
      </div>

      {/* Empty state — first-time user CTA */}
      {(stats?.totalInterviews ?? 0) === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-sm font-medium text-foreground">No interviews yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Create your first session and start practising.
          </p>
          <Link
            to="/interview/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={13} /> Start practising
          </Link>
        </div>
      )}
    </div>
  );
}