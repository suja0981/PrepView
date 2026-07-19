import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInterviewDetails } from "@/hooks/useInterview";

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

  const { interview, report, questions: rawQuestions, answers: rawAnswers } = data.data;
  const answers = rawAnswers ?? [];
  const questions = rawQuestions ?? [];
  const answerMap = new Map(answers.map((a: any) => [a.questionId.toString(), a]));

  const formatScore = (score: number) => `${Math.round(score * 10)}%`;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft size={13} /> Back
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Interview Report</h1>
        <p className="mt-0.5 text-sm text-muted-foreground capitalize">
          {interview.role}{interview.company ? ` · ${interview.company}` : ""} · {interview.difficulty} · {interview.type}
        </p>
      </div>

      {/* Scores — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Overall", value: report.overallScore },
          { label: "Technical", value: report.technicalScore },
          { label: "Communication", value: report.communicationScore },
          { label: "Problem Solving", value: report.reasoningScore },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <p className="text-[11px] sm:text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-foreground">{formatScore(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground mb-2">Summary</p>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {report.summary}
        </p>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground mb-3">Strengths</p>
          {report.strengths?.length > 0 ? (
            <ul className="space-y-2">
              {report.strengths.map((s: string, i: number) => (
                <li key={i} className="text-[13px] text-muted-foreground leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-emerald-400">
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground/60 italic">None noted.</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground mb-3">Areas to improve</p>
          {report.improvements?.length > 0 ? (
            <ul className="space-y-2">
              {report.improvements.map((s: string, i: number) => (
                <li key={i} className="text-[13px] text-muted-foreground leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-amber-400">
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground/60 italic">None noted.</p>
          )}
        </div>
      </div>

      {/* Q&A Breakdown */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Question breakdown</p>
          <div className="space-y-3">
            {questions.map((q: any, idx: number) => {
              const a = answerMap.get(q._id.toString()) as any;
              return (
                <div key={q._id} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
                    <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                      Question {idx + 1}
                    </span>
                    <span className="text-[12px] text-muted-foreground capitalize">{q.topic}</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-sm text-foreground font-medium">{q.question}</p>
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Response</p>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        {a ? a.answer : "No response recorded"}
                      </p>
                      {a && (
                        <p className="text-[11px] text-muted-foreground/50 mt-1">
                          {a.responseTime}s
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
