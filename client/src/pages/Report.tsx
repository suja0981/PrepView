import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Download, CheckCircle, TrendingUp, Clock, Sparkles, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useInterviewDetails } from "@/hooks/useInterview";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import {
  CompetencyRing,
  ScoreBadge,
  QABreakdownList,
  computeInterviewDuration,
} from "@/components/report/ReportSections";

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
  const interviewDuration = computeInterviewDuration(interview.startedAt, interview.endedAt);

  // Compute actual WPM for voice interviews
  const voiceStats = (() => {
    if (interview.mode !== "voice") return null;

    let totalWords = 0;
    let totalResponseSeconds = 0;

    for (const q of questionList) {
      if (q.answer?.answer) {
        totalWords += q.answer.answer.trim().split(/\s+/).filter(Boolean).length;
        if (typeof q.answer.responseTime === "number" && q.answer.responseTime > 0) {
          totalResponseSeconds += q.answer.responseTime;
        }
      }
    }

    if (totalWords === 0 || totalResponseSeconds <= 0) return { wpm: null };
    return { wpm: Math.round(totalWords / (totalResponseSeconds / 60)) };
  })();

  const handleShare = () => {
    if (!report?.shareToken) {
      toast.error("Share link is not available yet.");
      return;
    }
    const shareUrl = `${window.location.origin}/report/share/${report.shareToken}`;
    navigator.clipboard.writeText(shareUrl).then(
      () => toast.success("Public share link copied to clipboard!"),
      () => toast.error("Could not copy link to clipboard")
    );
  };

  const competencies = [
    { label: "Technical", value: report.technicalScore, color: "var(--primary)" },
    { label: "Reasoning", value: report.reasoningScore, color: "var(--brand-violet)" },
    { label: "Communication", value: report.communicationScore, color: "var(--brand-mint)" },
    { label: "Overall", value: report.overallScore, color: "var(--chart-5)" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8 print:py-4">

      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-3 print:hidden">
              <ArrowLeft size={13} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">Executive Performance Scorecard</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Interview Report</h1>
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
          <div className="print:hidden flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-secondary/60 transition-colors shadow-xs"
            >
              <Share2 size={13} className="text-primary" /> Share Link
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors shadow-xs"
            >
              <Download size={13} /> Export PDF
            </button>
          </div>
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

      {/* Speech Delivery & Fluency Scorecard (Voice Mode only) */}
      {interview.mode === "voice" && (
        <FadeIn delay={0.14}>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">Speech Delivery & Fluency Analysis</p>
            </div>
            {voiceStats?.wpm ? (
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Your voice responses averaged <span className="font-mono font-semibold text-foreground">{voiceStats.wpm} WPM</span> (avg speaking pace). Maintain a natural pace between 120–160 WPM during live engineering interviews for maximum clarity.
              </p>
            ) : (
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Speaking pace: <span className="font-mono font-semibold text-foreground">N/A (insufficient data)</span>.
              </p>
            )}
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
      <QABreakdownList questions={questionList} responseLabel="Your Response" />

      {/* Print-Only Footer */}
      <div className="hidden print:block pt-6 border-t border-border text-[11px] text-muted-foreground flex justify-between items-center">
        <span>Generated by PrepView AI Platform</span>
        <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
      </div>
    </div>
  );
}
