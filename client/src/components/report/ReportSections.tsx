import { Clock } from "lucide-react";
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import { FadeIn } from "@/components/ui/motion";

export function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function scoreColor(score: number): string {
  const pct = score * 10;
  return pct >= 70 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-400";
}

export function computeInterviewDuration(startedAt?: string | null, endedAt?: string | null): string | null {
  if (!startedAt || !endedAt) return null;
  const diffMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  if (diffMs <= 0) return null;
  return formatSeconds(Math.round(diffMs / 1000));
}

export function CompetencyRing({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 10);
  const data = [{ value: pct, fill: color }];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[84px] h-[84px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="100%" data={data} startAngle={90} endAngle={-270} barSize={7}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" angleAxisId={0} background={{ fill: "var(--secondary)" }} cornerRadius={4} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[15px] font-bold text-foreground tabular-nums font-mono">{pct}%</span>
        </div>
      </div>
      <p className="text-[11px] text-center text-muted-foreground font-medium leading-tight">{label}</p>
    </div>
  );
}

export function ScoreBadge({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 10);
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 text-center shadow-xs">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold font-mono tabular-nums ${scoreColor(value)}`}>{pct}%</p>
    </div>
  );
}

function QuestionScoreStrip({ evaluation }: { evaluation: any }) {
  const scores = [
    { label: "Technical", value: evaluation.technicalAccuracy },
    { label: "Reasoning", value: evaluation.reasoning },
    { label: "Communication", value: evaluation.communication },
    { label: "Overall", value: evaluation.overallScore },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {scores.map(({ label, value }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`text-[13px] font-bold font-mono tabular-nums ${scoreColor(value)}`}>{Math.round(value * 10)}%</span>
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function QABreakdownList({
  questions,
  responseLabel = "Your Response",
}: {
  questions: any[];
  responseLabel?: string;
}) {
  if (!questions || questions.length === 0) return null;

  return (
    <FadeIn delay={0.18}>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Question-by-Question Breakdown</p>
        <div className="space-y-3">
          {questions.map((q: any, idx: number) => {
            const hasEval = !!q.evaluation;
            const hasAnswer = !!q.answer;
            return (
              <div key={q._id} className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 bg-secondary/30 px-5 py-2.5">
                  <span className="text-xs font-semibold text-muted-foreground font-mono">
                    Q{idx + 1} {q.isFollowUp && <span className="ml-1 text-amber-500 font-sans">(Follow-up)</span>}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-md border border-border/50">
                    {q.topic}
                  </span>
                </div>

                <div className="px-5 py-4 space-y-4">
                  <p className="text-sm text-foreground font-medium leading-relaxed">{q.question}</p>

                  <div className="rounded-lg bg-background p-3.5 border border-border/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">{responseLabel}</p>
                      {hasAnswer && q.answer.responseTime && (
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-muted-foreground/50" />
                          <span className="text-[11px] text-muted-foreground/50 font-mono">{formatSeconds(q.answer.responseTime)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {hasAnswer ? q.answer.answer : "No response recorded"}
                    </p>
                  </div>

                  {hasEval && (
                    <div className="rounded-xl bg-secondary/20 border border-border/60 p-4 space-y-3">
                      <QuestionScoreStrip evaluation={q.evaluation} />
                      <p className="text-[12.5px] text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                        {q.evaluation.feedback}
                      </p>
                      {q.evaluation.weakTopics?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                          <span className="text-[11px] text-muted-foreground/60">Weak topics:</span>
                          {q.evaluation.weakTopics.map((t: string) => (
                            <span key={t} className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
