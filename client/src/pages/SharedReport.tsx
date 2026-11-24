import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight, Download, CheckCircle, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/api/axios";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import {
  CompetencyRing,
  ScoreBadge,
  QABreakdownList,
  computeInterviewDuration,
} from "@/components/report/ReportSections";

export default function SharedReport() {
  const { shareToken } = useParams<{ shareToken: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["shared-report", shareToken],
    queryFn: async () => {
      const res = await api.get(`/reports/share/${shareToken}`);
      return res.data.data;
    },
    enabled: !!shareToken,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
        <p className="text-base font-semibold">Report Not Found</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          This shared link may have expired or is invalid.
        </p>
        <Button asChild size="sm" className="mt-5">
          <Link to="/">Go to PrepView Home</Link>
        </Button>
      </div>
    );
  }

  const { interview, report, questions } = data;
  const questionList = questions ?? [];
  const interviewDuration = computeInterviewDuration(interview.startedAt, interview.endedAt);

  const competencies = [
    { label: "Technical", value: report.technicalScore, color: "var(--primary)" },
    { label: "Reasoning", value: report.reasoningScore, color: "var(--brand-violet)" },
    { label: "Communication", value: report.communicationScore, color: "var(--brand-mint)" },
    { label: "Overall", value: report.overallScore, color: "var(--chart-5)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <div className="border-b border-border/80 bg-secondary/40 py-2.5 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground tracking-tight">PrepView AI</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground">Verified Candidate Scorecard</span>
          </div>
          <Link
            to="/register"
            className="font-medium text-primary hover:underline flex items-center gap-1"
          >
            Practice your own interview <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">Candidate Performance Report</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Executive Scorecard</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="capitalize">{interview.role}{interview.company ? ` · ${interview.company}` : ""}</span>
                <span>·</span>
                <span className="capitalize">{interview.difficulty}</span>
                <span>·</span>
                <span className="capitalize">{interview.type.replace(/_/g, " ")}</span>
                {interviewDuration && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[12px] bg-secondary/80 px-2 py-0.5 rounded-md border border-border/50">
                      <Clock size={11} /> {interviewDuration}
                    </span>
                  </>
                )}
              </div>
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
        <QABreakdownList questions={questionList} responseLabel="Candidate Response" />

        {/* Call to Action Footer */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Want to prepare for your next engineering interview?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            PrepView gives you realistic text and voice AI interviews with comprehensive scoring and actionable feedback.
          </p>
          <div className="pt-2">
            <Button asChild size="default">
              <Link to="/register">Create Free Account <ArrowRight size={13} className="ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
