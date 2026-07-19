import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitAnswer } from "@/api/interview.api";
import { useTimer } from "@/hooks/useTimer";

interface Props {
  id: string;
  interview: any;
  currentQuestion: any;
  onQuestionChange: (q: any) => void;
}

const formatTime = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

export default function TextInterview({ id, interview, currentQuestion, onQuestionChange }: Props) {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const { seconds, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer();


  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || answer.trim().length < 10) return;
    setError(null);
    setSubmitting(true);
    stopTimer();


    try {
      const res = await submitAnswer(id, {
        questionId: currentQuestion._id,
        answer: answer.trim(),
        responseTime: seconds || 1,
      });

      const payload = res.data;
      if (payload.completed) {
        navigate(`/interview/${id}/report`);
      } else {
        onQuestionChange(payload.nextQuestion);
        setQuestionNumber((n) => n + 1);
        setAnswer("");
        resetTimer();
        startTimer();
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to submit");
      setSubmitting(false);
      startTimer();
    }
  }, [id, currentQuestion, answer, seconds, stopTimer, resetTimer, startTimer, navigate, onQuestionChange]);

  // ── Lobby ──
  if (!started) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={13} /> Back
        </Link>

        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">{interview.difficulty}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">{interview.type}</span>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">Text mode</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight capitalize">{interview.role} Interview</h1>
            {interview.company && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                Targeting <span className="text-foreground font-medium">{interview.company}</span>
              </p>
            )}
          </div>

          <div className="text-[13px] text-muted-foreground space-y-1.5 border-t border-border pt-4">
            <p>• Read each question carefully before typing</p>
            <p>• Write a complete, structured answer</p>
            <p>• Submit when ready — answers cannot be edited</p>
          </div>
        </div>

        <Button onClick={() => { setStarted(true); startTimer(); }} className="w-full h-9 text-[13px] font-medium">
          Start Interview
        </Button>
      </div>
    );
  }

  // ── Active session ──
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-[13px] text-muted-foreground">
            {submitting ? "Evaluating..." : "Type your answer"}
          </span>
        </div>
        <span className="font-mono text-[13px] text-muted-foreground tabular-nums">{formatTime(seconds)}</span>
      </div>

      {/* Question */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
          <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            Question {questionNumber}
          </span>
          <span className="text-[12px] text-muted-foreground capitalize">{currentQuestion?.topic}</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-foreground">{currentQuestion?.question}</p>
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitting}
          placeholder="Type your answer here..."
          rows={8}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors disabled:opacity-50"
        />
        <div className="flex justify-between">
          <span className="text-[11px] text-muted-foreground">{answer.length} characters</span>
          {error && <span className="text-[11px] text-destructive">{error}</span>}
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={submitting || answer.trim().length < 10}
        className="w-full h-9 text-[13px] font-medium gap-1.5"
      >
        {submitting
          ? <><Loader2 size={14} className="animate-spin" /> Evaluating...</>
          : <>Submit answer <ArrowRight size={13} /></>
        }
      </Button>
    </div>
  );
}
