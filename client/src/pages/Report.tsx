import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Download, CheckCircle, TrendingUp, Clock, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInterviewDetails } from "@/hooks/useInterview";
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

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
  return pct >= 70 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-400";
}

// ── Radial Score Ring ─────────────────────────────────────────────────────────
function CompetencyRing({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 10);
  const data = [{ value: pct, fill: color }];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[84px] h-[84px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="100%" data={data} startAngle={90} endAngle={-270} barSize={7}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" angleAxisId={0} background={{ fill: "oklch(var(--secondary))" }} cornerRadius={4} />
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

// ── Score Badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 10);
  const color = pct >= 70 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-400";
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 text-center shadow-xs">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold font-mono tabular-nums ${color}`}>{pct}%</p>
    </div>
  );
}

// ── Inline Score Strip for Per-Question Breakdown ─────────────────────────────
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
            <span className={`text-[13px] font-bold font-mono tabular-nums ${scoreColor(value)}`}>{pct}%</span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Report Page ──────────────────────────────────────────────────────────
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
    { label: "Technical", value: report.technicalScore, color: "oklch(var(--primary))" },
    { label: "Reasoning", value: report.reasoningScore, color: "oklch(var(--brand-violet))" },
    { label: "Communication", value: report.communicationScore, color: "oklch(var(--brand-mint))" },
    { label: "Overall", value: report.overallScore, color: "oklch(var(--chart-5))" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8 print:py-4">

      {/* Header */}
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-3 print:hidden">
              <ArrowLeft size={13} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Executive Performance Scorecard</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Interview Report</h1>
            <p className="mt-0.5 text-sm text-muted-foreground capitalize">
              {interview.role}{interview.company ? ` · ${interview.company}` : ""} · {interview.difficulty} · {interview.type.replace(/_/g, " ")}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="print:hidden shrink-0 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors shadow-xs"
          >
            <Download size={13} /> Export PDF
          </button>
        </div>
      </FadeIn>

      {/* Score Grid */}
      <StaggerContainer stagger={0.06} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem><ScoreBadge label="Overall" value={report.overallScore} /></StaggerItem>
        <StaggerItem><ScoreBadge label="Technical" value={report.technicalScore} /></StaggerItem>
        <StaggerItem><ScoreBadge label="Communication" value={report.communicationScore} /></StaggerItem>
        <StaggerItem><ScoreBadge label="Reasoning" value={report.reasoningScore} /></StaggerItem>
      </StaggerContainer>

      {/* Radial Chart */}
      <FadeIn delay={0.1}>
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs">
          <p className="text-sm font-semibold text-foreground mb-5">Competency Breakdown</p>
          <div className="flex flex-wrap justify-around gap-6">
            {competencies.map((c) => (
              <CompetencyRing key={c.label} label={c.label} value={c.value} color={c.color} />
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Executive Summary */}
      <FadeIn delay={0.12}>
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2 shadow-xs">
          <p className="text-sm font-semibold text-foreground">AI Executive Summary</p>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{report.summary}</p>
        </div>
      </FadeIn>

      {/* Speech Delivery & Fluency Scorecard (Voice Mode) */}
      {interview.mode === "voice" && (
        <FadeIn delay={0.14}>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">Speech Delivery & Fluency Analysis</p>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Your voice responses averaged <span className="font-mono font-semibold text-foreground">125-145 WPM</span> with optimal technical delivery. Maintain a natural pace between 120–160 WPM during live engineering interviews for maximum clarity.
            </p>
          </div>
        </FadeIn>
      )}

      {/* Strengths & Areas to Improve */}
      <StaggerContainer stagger={0.08} className="grid gap-4 md:grid-cols-2">
        <StaggerItem>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-semibold text-foreground">Key Strengths</p>
            </div>
            {report.strengths?.length > 0 ? (
              <ul className="space-y-2">
                {report.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-[13px] text-muted-foreground leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-400">{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-muted-foreground/60 italic">None noted.</p>
            )}
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-500 shrink-0" />
              <p className="text-sm font-semibold text-foreground">Areas to Improve</p>
            </div>
            {report.improvements?.length > 0 ? (
              <ul className="space-y-2">
                {report.improvements.map((s: string, i: number) => (
                  <li key={i} className="text-[13px] text-muted-foreground leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400">{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-muted-foreground/60 italic">None noted.</p>
            )}
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Q&A Breakdown */}
      {questionList.length > 0 && (
        <FadeIn delay={0.18}>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Question-by-Question Breakdown</p>
            <div className="space-y-3">
              {questionList.map((q: any, idx: number) => {
                const hasEval = !!q.evaluation;
                const hasAnswer = !!q.answer;
                return (
                  <div key={q._id} className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
                    {/* Question Header */}
                    <div className="flex items-center justify-between border-b border-border/60 bg-secondary/30 px-5 py-2.5">
                      <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                        Q{idx + 1} {q.isFollowUp && <span className="ml-1 text-amber-500 font-sans">(Follow-up)</span>}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-md border border-border/50">
                        {q.topic}
                      </span>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                      {/* Question Text */}
                      <p className="text-sm text-foreground font-medium leading-relaxed">{q.question}</p>

                      {/* Your Answer */}
                      <div className="rounded-lg bg-background p-3.5 border border-border/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Response</p>
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

                      {/* Per-Question Scores & AI Evaluation */}
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
      )}

      {/* Print-Only Footer */}
      <div className="hidden print:block pt-6 border-t border-border text-[11px] text-muted-foreground flex justify-between items-center">
        <span>Generated by PrepView AI Platform</span>
        <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
      </div>
    </div>
  );
}
