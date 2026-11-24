import { ClipboardList, CircleCheckBig, TrendingUp, Clock, Plus, FileSearch, Crown, Zap, ArrowRight, Target, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
          <Skeleton key={i} className="h-[96px] sm:h-[108px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
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
  const avgScore = Math.round(stats?.averageScore ?? 0);

  const completionRate = stats?.totalInterviews
    ? Math.round(((stats.completedInterviews ?? 0) / stats.totalInterviews) * 100)
    : 0;

  // Context-aware AI recommendation based on weak topics and score trends
  const getRecommendation = () => {
    if ((stats?.totalInterviews ?? 0) === 0) return null;
    if (stats?.weakTopics && stats.weakTopics.length > 0) {
      const topWeak = stats.weakTopics[0];
      return {
        text: `Frequent weak topic detected: "${topWeak.topic}". Practice a targeted session to solidify this area.`,
        type: "Technical",
        difficulty: avgScore < 60 ? "Easy" : "Medium",
      };
    }
    if (avgScore < 50) return { text: "Focus on fundamentals — try an Easy Technical interview next.", type: "Technical", difficulty: "Easy" };
    if (avgScore < 70) return { text: "Your scores are improving. Try a Medium Behavioral interview to sharpen communication.", type: "Behavioral", difficulty: "Medium" };
    return { text: "Strong performance. Challenge yourself with a Hard Technical or System Design round.", type: "Technical", difficulty: "Hard" };
  };
  const recommendation = getRecommendation();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-5 sm:space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-start justify-between gap-4"
      >
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
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Here's how your practice is going.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/resume"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <FileSearch size={14} />
            Resume
          </Link>
          <Link
            to="/interview/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 sm:px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/15"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Interview</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={stats?.totalInterviews ?? 0} icon={<ClipboardList size={14} />} />
        <StatCard
          title="Completed"
          value={stats?.completedInterviews ?? 0}
          icon={<CircleCheckBig size={14} />}
          subtext={stats?.totalInterviews ? `${completionRate}% completion rate` : undefined}
        />
        <StatCard title="Avg Score" value={`${avgScore}%`} icon={<TrendingUp size={14} />} />
        <StatCard title="Pending" value={pending} icon={<Clock size={14} />} />
      </div>

      {/* Upgrade CTA — free users only */}
      {user?.plan !== "premium" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-center justify-between gap-4 rounded-xl border border-primary/15 bg-primary/[0.03] px-5 py-3.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Zap size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Unlock voice, DSA & unlimited interviews</p>
              <p className="text-[12px] text-muted-foreground">Upgrade to Premium for $9/month</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Crown size={10} /> Upgrade
          </Link>
        </motion.div>
      )}

      {/* AI recommendation — derived from existing score data */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-3.5"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-violet/10">
              <Zap size={14} className="text-brand-violet" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Recommended next</p>
              <p className="text-[13px] text-foreground mt-0.5 truncate">{recommendation.text}</p>
            </div>
          </div>
          <Link
            to="/interview/create"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            Start <ArrowRight size={11} />
          </Link>
        </motion.div>
      )}

      {/* Main content grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Performance chart — 2 cols */}
        <div className="lg:col-span-2">
          <ScoreChart data={stats?.performanceHistory ?? []} />
        </div>

        {/* Recent interviews — 1 col */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Recent interviews</h2>
            {(stats?.recentInterviews?.length ?? 0) > 0 && (
              <Link
                to="/interviews"
                className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all →
              </Link>
            )}
          </div>
          <RecentInterviews interviews={stats?.recentInterviews ?? []} />
        </div>
      </div>

      {/* Advanced Analytics Grid (Phase 6.1) */}
      {(stats?.totalInterviews ?? 0) > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {/* Weak Topics */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-amber-500" />
                <h3 className="text-sm font-medium text-foreground">Recurring Weak Topics</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">Focus areas</span>
            </div>

            {stats?.weakTopics && stats.weakTopics.length > 0 ? (
              <div className="space-y-3">
                {stats.weakTopics.slice(0, 5).map((item) => (
                  <div key={item.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-foreground truncate max-w-[240px]">{item.topic}</span>
                      <span className="font-mono text-muted-foreground text-[11px]">{item.count} flag{item.count > 1 ? "s" : ""}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500/80 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(15, (item.count / (stats.weakTopics?.[0]?.count || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12.5px] text-muted-foreground/70 py-4 text-center">
                No weak topics flagged yet. Solid work across your sessions!
              </p>
            )}
          </div>

          {/* Performance by Round Type */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-primary" />
                <h3 className="text-sm font-medium text-foreground">Score by Interview Type</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">Avg performance</span>
            </div>

            {stats?.scoreByType && stats.scoreByType.length > 0 ? (
              <div className="space-y-3">
                {stats.scoreByType.map((item) => {
                  const pct = Math.round(item.avgScore);
                  const color = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
                  return (
                    <div key={item.type} className="space-y-1">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-medium capitalize text-foreground">{item.type.replace(/_/g, " ")}</span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="font-bold text-foreground">{pct}%</span>
                          <span className="text-muted-foreground/60">({item.count} session{item.count > 1 ? "s" : ""})</span>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12.5px] text-muted-foreground/70 py-4 text-center">
                Complete more interview rounds to see score breakdowns by type.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty state — first-time user */}
      {(stats?.totalInterviews ?? 0) === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center"
        >
          <p className="text-sm font-medium text-foreground">No interviews yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Create your first session and start practising.
          </p>
          <Link
            to="/interview/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={13} /> Start practising
          </Link>
        </motion.div>
      )}
    </div>
  );
}