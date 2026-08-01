import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Download, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInterviewDetails } from "@/hooks/useInterview";
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format raw seconds into "mm:ss" */
function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

/** Convert 0-10 score to colored label */
function scoreColor(score: number): string {
  const pct = score * 10;
  return pct >= 70 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-500";
}

// ── Radial score ring ─────────────────────────────────────────────────────────
function CompetencyRing({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 10);
  const data = [{ value: pct, fill: color }];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[80px] h-[80px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="100%" data={data} startAngle={90} endAngle={-270} barSize={7}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" angleAxisId={0} background={{ fill: "hsl(var(--secondary))" }} cornerRadius={4} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[15px] font-bold text-foreground tabular-nums">{pct}%</span>
        </div>
      </div>
      <p className="text-[11px] text-center text-muted-foreground font-medium leading-tight">{label}</p>
    </div>
  );
}

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 10);
  const color = pct >= 70 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-500";
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4 text-center">
      <p className="text-[11px] sm:text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold ${color}`}>{pct}%</p>
    </div>
  );
}

// ── Inline score strip for per-question breakdown ─────────────────────────────
function QuestionScoreStrip({ evaluation }: { evaluation: any }) {
  const scores = [
    { label: "Technical", value: evaluation.technicalAccuracy },
    { label: "Reasoning", value: evaluation.reasoning },
    { label: "Communication", value: evaluation.communication },
    { label: "Overall", value: evaluation.overallScore },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {scores.map(({ label, value }) => {
        const pct = Math.round(value * 10);
        return (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`text-[13px] font-bold tabular-nums ${scoreColor(value)}`}>{pct}%</span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Report page ──────────────────────────────────────────────────────────
export default function Report() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useInterviewDetails(id ?? "");

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data || !data.data) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-sm flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium">Report not found</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {error ? (error as any).response?.data?.message : "This interview may not be completed yet."}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/dashboard"><ArrowLeft size={13} className="mr-1.5" /> Dashboard</Link>
        </Button>
      </div>
    );
  }

  const { interview, report, questions } = data.data;
  const questionList = questions ?? [];

  const competencies = [
    { label: "Technical", value: report.technicalScore, color: "oklch(0.65 0.15 265)" },
    { label: "Reasoning", value: report.reasoningScore, color: "oklch(0.60 0.17 45)" },
    { label: "Communication", value: report.communicationScore, color: "oklch(0.65 0.15 160)" },
    { label: "Overall", value: report.overallScore, color: "oklch(0.65 0.15 320)" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8 print:py-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-3 print:hidden">
            <ArrowLeft size={13} /> Back
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Interview Report</h1>
          <p className="mt-0.5 text-sm text-muted-foreground capitalize">
            {interview.role}{interview.company ? ` · ${interview.company}` : ""} · {interview.difficulty} · {interview.type.replace(/_/g, " ")}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden shrink-0 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download size={13} /> Save PDF
        </button>
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <ScoreBadge label="Overall" value={report.overallScore} />
        <ScoreBadge label="Technical" value={report.technicalScore} />
        <ScoreBadge label="Communication" value={report.communicationScore} />
        <ScoreBadge label="Reasoning" value={report.reasoningScore} />
      </div>

      {/* Radial chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground mb-5">Competency Breakdown</p>
        <div className="flex flex-wrap justify-around gap-6">
          {competencies.map((c) => (
            <CompetencyRing key={c.label} label={c.label} value={c.value} color={c.color} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground mb-2">Summary</p>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{report.summary}</p>
      </div>

      {/* Strengths & Areas to improve */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={14} className="text-emerald-500" />
            <p className="text-sm font-semibold text-foreground">Strengths</p>
          </div>
          {report.strengths?.length > 0 ? (
            <ul className="space-y-2">
              {report.strengths.map((s: string, i: number) => (
                <li key={i} className="text-[13px] text-muted-foreground leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-emerald-400">{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground/60 italic">None noted.</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-amber-500" />
            <p className="text-sm font-semibold text-foreground">Areas to improve</p>
          </div>
          {report.improvements?.length > 0 ? (
            <ul className="space-y-2">
              {report.improvements.map((s: string, i: number) => (
                <li key={i} className="text-[13px] text-muted-foreground leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-amber-400">{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground/60 italic">None noted.</p>
          )}
        </div>
      </div>

      {/* Q&A Breakdown — now includes per-question scores and AI feedback */}
      {questionList.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Question Breakdown</p>
          <div className="space-y-3">
            {questionList.map((q: any, idx: number) => {
              const hasEval = !!q.evaluation;
              const hasAnswer = !!q.answer;
              return (
                <div key={q._id} className="rounded-lg border border-border bg-card overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
                    <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                      Q{idx + 1} {q.isFollowUp && <span className="ml-1 text-amber-500">(Follow-up)</span>}
                    </span>
                    <span className="text-[12px] text-muted-foreground capitalize">{q.topic}</span>
                  </div>

                  <div className="px-5 py-4 space-y-4">
                    {/* Question */}
                    <p className="text-sm text-foreground font-medium leading-relaxed">{q.question}</p>

                    {/* Answer */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Your Response</p>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        {hasAnswer ? q.answer.answer : "No response recorded"}
                      </p>
                      {hasAnswer && q.answer.responseTime && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock size={11} className="text-muted-foreground/50" />
                          <span className="text-[11px] text-muted-foreground/50">{formatSeconds(q.answer.responseTime)}</span>
                        </div>
                      )}
                    </div>

                    {/* Per-question scores + AI feedback */}
                    {hasEval && (
                      <div className="rounded-lg bg-secondary/30 border border-border/60 p-4 space-y-3">
                        <QuestionScoreStrip evaluation={q.evaluation} />
                        <p className="text-[12px] text-muted-foreground leading-relaxed border-t border-border/60 pt-3">
                          {q.evaluation.feedback}
                        </p>
                        {q.evaluation.weakTopics?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[11px] text-muted-foreground/60">Weak areas:</span>
                            {q.evaluation.weakTopics.map((t: string) => (
                              <span key={t} className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">{t}</span>
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
      )}

      {/* Print-only footer */}
      <div className="hidden print:block pt-4 border-t border-border text-[12px] text-muted-foreground">
        Generated by PrepView · {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
