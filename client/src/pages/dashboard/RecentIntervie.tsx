import type { RecentInterview } from "@/types/dashboard";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mic, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  interviews: RecentInterview[];
}

const statusStyles: Record<string, { text: string; dot: string }> = {
  completed: { text: "Completed", dot: "bg-emerald-400" },
  pending: { text: "Pending", dot: "bg-amber-400" },
  in_progress: { text: "In progress", dot: "bg-blue-400" },
};

export default function RecentInterviews({ interviews }: Props) {
  if (!interviews || interviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 py-10 text-center">
        <p className="text-sm text-muted-foreground">No interviews yet.</p>
        <p className="mt-1 text-[12px] text-muted-foreground/60">
          Create your first one to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {interviews.map((interview, i) => {
        const s = statusStyles[interview.status] ?? statusStyles.pending;
        const href =
          interview.status === "completed"
            ? `/interview/${interview._id}/report`
            : `/interview/${interview._id}`;

        const isVoice = (interview as any).mode === "voice";
        const timeAgo = getRelativeTime(interview.createdAt);

        return (
          <motion.div
            key={interview._id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              to={href}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-3 transition-all hover:bg-secondary/30 hover:border-border/80"
            >
              {/* Mode icon */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                {isVoice ? <Mic size={14} /> : <MessageSquare size={14} />}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground capitalize truncate leading-tight">
                  {interview.role}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground capitalize">{interview.difficulty}</span>
                  <span className="text-[11px] text-muted-foreground/30">·</span>
                  <span className="text-[11px] text-muted-foreground">{timeAgo}</span>
                </div>
              </div>

              {/* Status dot + arrow */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">{s.text}</span>
                </div>
                <ArrowUpRight size={13} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Tiny relative time helper — no dependencies */
function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}