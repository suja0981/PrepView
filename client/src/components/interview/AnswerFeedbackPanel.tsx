import { CheckCircle2, AlertCircle, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EvaluationSummary {
  overallScore: number;
  technicalAccuracy: number;
  reasoning: number;
  communication: number;
  feedback: string;
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 10);
  const color = pct >= 70 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-400";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg font-bold tabular-nums font-mono ${color}`}>{pct}%</span>
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export default function AnswerFeedbackPanel({
  evaluation,
  questionNumber,
  isFollowUp,
  onContinue,
  metrics,
}: {
  evaluation: EvaluationSummary;
  questionNumber: number;
  isFollowUp: boolean;
  onContinue: () => void;
  metrics?: { wpm: number; wpmStatus: string; fillerCount: number } | null;
}) {
  const overallPct = Math.round(evaluation.overallScore * 10);
  const isStrong = overallPct >= 70;
  const isMid = overallPct >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-10 space-y-5"
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {isStrong ? "Strong answer" : isMid ? "Decent answer" : "Needs improvement"}
        </h2>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">
          Answer {questionNumber} evaluated
        </p>
      </div>

      {/* Score strip */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-around gap-4">
        <ScoreCell label="Overall" value={evaluation.overallScore} />
        <div className="w-px h-8 bg-border" />
        <ScoreCell label="Technical" value={evaluation.technicalAccuracy} />
        <div className="w-px h-8 bg-border" />
        <ScoreCell label="Reasoning" value={evaluation.reasoning} />
        <div className="w-px h-8 bg-border" />
        <ScoreCell label="Communication" value={evaluation.communication} />
      </div>

      {/* Delivery Metrics Breakdown (Voice mode) */}
      {metrics && metrics.wpm > 0 && (
        <div className="rounded-xl border border-border/80 bg-card p-4 flex items-center justify-between text-[12.5px]">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Speech Pace:</span>
            <span className="font-mono font-semibold text-foreground">{metrics.wpm} WPM</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              metrics.wpmStatus === "optimal"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}>
              {metrics.wpmStatus}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Fillers:</span>
            <span className="font-mono font-semibold text-foreground">{metrics.fillerCount}</span>
          </div>
        </div>
      )}

      {/* AI feedback */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center gap-2">
          {isStrong
            ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            : <AlertCircle size={14} className="text-amber-500 shrink-0" />
          }
          <p className="text-xs font-semibold text-foreground">AI Feedback</p>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{evaluation.feedback}</p>
      </div>

      {/* Follow-up warning */}
      {isFollowUp && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-2.5">
          <Zap size={13} className="text-amber-500 shrink-0" />
          <p className="text-[12px] text-amber-600 dark:text-amber-400">
            The next question probes this same topic more deeply.
          </p>
        </div>
      )}

      <Button onClick={onContinue} className="w-full h-9 text-[13px] font-medium gap-1.5">
        Next question <ChevronRight size={13} />
      </Button>
    </motion.div>
  );
}
