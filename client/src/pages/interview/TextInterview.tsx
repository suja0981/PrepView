import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import {
  ArrowLeft, ArrowRight, Loader2, Zap,
  CheckCircle2, AlertCircle, ChevronRight,
} from "lucide-react";
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

const MIN_WORDS = 10;

const LOADING_STEPS = [
  "Evaluating your answer...",
  "Analysing depth & accuracy...",
  "Generating next question...",
];

// Evaluation data returned per-answer from the API
interface EvaluationData {
  overallScore: number;
  technicalAccuracy: number;
  reasoning: number;
  communication: number;
  feedback: string;
  weakTopics: string[];
}

// Compact score badge used in the feedback panel
function ScoreBadge({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 10);
  const color = pct >= 70 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-500";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-base font-bold tabular-nums ${color}`}>{pct}%</span>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// ── Interim feedback panel shown after submitting an answer ───────────────────
function FeedbackPanel({
  evaluation,
  questionNumber,
  isFollowUp,
  onContinue,
}: {
  evaluation: EvaluationData;
  questionNumber: number;
  isFollowUp: boolean;
  onContinue: () => void;
}) {
  const overallPct = Math.round(evaluation.overallScore * 10);
  const isStrong = overallPct >= 70;
  const isMid = overallPct >= 50;

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Answer {questionNumber} Evaluated
        </p>
        <h2 className="text-lg font-semibold tracking-tight">
          {isStrong ? "Good answer!" : isMid ? "Decent answer" : "Needs improvement"}
        </h2>
      </div>

      {/* Score strip */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-around gap-4">
        <ScoreBadge label="Overall" value={evaluation.overallScore} />
        <div className="w-px h-8 bg-border" />
        <ScoreBadge label="Technical" value={evaluation.technicalAccuracy} />
        <div className="w-px h-8 bg-border" />
        <ScoreBadge label="Reasoning" value={evaluation.reasoning} />
        <div className="w-px h-8 bg-border" />
        <ScoreBadge label="Communication" value={evaluation.communication} />
      </div>

      {/* AI feedback text */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center gap-2">
          {isStrong
            ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            : <AlertCircle size={14} className="text-amber-500 shrink-0" />
          }
          <p className="text-[12px] font-semibold text-foreground uppercase tracking-wider">AI Feedback</p>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{evaluation.feedback}</p>
      </div>

      {/* Follow-up warning */}
      {isFollowUp && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/8 px-4 py-2.5">
          <Zap size={13} className="text-amber-500 shrink-0" />
          <p className="text-[12px] text-amber-600 dark:text-amber-400">
            The next question will probe this same topic more deeply.
          </p>
        </div>
      )}

      {/* Continue button */}
      <Button onClick={onContinue} className="w-full h-9 text-[13px] font-medium gap-1.5">
        Next question <ChevronRight size={13} />
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TextInterview({ id, interview, currentQuestion, onQuestionChange }: Props) {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);

  // Feedback panel state — shown between questions
  const [pendingEvaluation, setPendingEvaluation] = useState<EvaluationData | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<any>(null);
  const [pendingIsFollowUp, setPendingIsFollowUp] = useState(false);

  const { seconds, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer();

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const isAnswerReady = wordCount >= MIN_WORDS;
  const progressPct = Math.min((wordCount / (MIN_WORDS * 2)) * 100, 100);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || !isAnswerReady) return;
    setError(null);
    setSubmitting(true);
    stopTimer();

    let step = 0;
    setLoadingStep(0);
    const stepInterval = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1);
      setLoadingStep(step);
    }, 1800);

    try {
      const res = await submitAnswer(id, {
        questionId: currentQuestion._id,
        answer: answer.trim(),
        responseTime: seconds || 1,
      });

      clearInterval(stepInterval);
      const payload = res.data;

      if (payload.completed) {
        navigate(`/interview/${id}/report`);
      } else {
        // ── Store everything in "pending" state and show the feedback panel ──
        setPendingEvaluation(payload.evaluation);
        setPendingNextQuestion(payload.nextQuestion);
        setPendingIsFollowUp(!!payload.isFollowUp);
        setSubmitting(false);
        setLoadingStep(0);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.response?.data?.message ?? "Failed to submit");
      setSubmitting(false);
      startTimer();
      setLoadingStep(0);
    }
  }, [id, currentQuestion, answer, seconds, isAnswerReady, stopTimer, startTimer, navigate]);

  // Called when user clicks "Next question" on the feedback panel
  const handleContinue = useCallback(() => {
    if (!pendingNextQuestion) return;
    onQuestionChange(pendingNextQuestion);
    setQuestionNumber((n) => n + 1);
    setAnswer("");
    setPendingEvaluation(null);
    setPendingNextQuestion(null);
    setPendingIsFollowUp(false);
    resetTimer();
    startTimer();
  }, [pendingNextQuestion, onQuestionChange, resetTimer, startTimer]);

  // ── Lobby ────────────────────────────────────────────────────────────────────
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
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">{interview.type.replace("_", " ")}</span>
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
            <p>• Write a complete, structured answer (aim for 10+ words)</p>
            <p>• You will see AI feedback after each answer before moving on</p>
            <p>• Weak answers will get a targeted follow-up question</p>
          </div>
        </div>

        <Button
          onClick={() => { setStarted(true); startTimer(); }}
          className="w-full h-9 text-[13px] font-medium"
        >
          Start Interview
        </Button>
      </div>
    );
  }

  // ── Feedback panel (between questions) ───────────────────────────────────────
  if (pendingEvaluation) {
    return (
      <FeedbackPanel
        evaluation={pendingEvaluation}
        questionNumber={questionNumber}
        isFollowUp={pendingIsFollowUp}
        onContinue={handleContinue}
      />
    );
  }

  // ── Active session ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${submitting ? "bg-amber-400 animate-pulse" : "bg-primary"}`} />
          <span className="text-[13px] text-muted-foreground">
            {submitting ? LOADING_STEPS[loadingStep] : "Type your answer"}
          </span>
        </div>
        <span className="font-mono text-[13px] text-muted-foreground tabular-nums">{formatTime(seconds)}</span>
      </div>

      {/* Question card */}
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

      {/* Answer textarea */}
      <div className="space-y-2">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitting}
          placeholder="Type your answer here..."
          rows={8}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors disabled:opacity-50"
        />

        {/* Word count + progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className={`text-[11px] font-medium ${isAnswerReady ? "text-emerald-500" : "text-muted-foreground"}`}>
              {wordCount} words {isAnswerReady ? "✓" : `(min ${MIN_WORDS})`}
            </span>
            {error && <span className="text-[11px] text-destructive">{error}</span>}
          </div>
          <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isAnswerReady ? "bg-emerald-500" : "bg-primary/50"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={submitting || !isAnswerReady}
        className="w-full h-9 text-[13px] font-medium gap-1.5"
      >
        {submitting
          ? <><Loader2 size={14} className="animate-spin" /> {LOADING_STEPS[loadingStep]}</>
          : <>Submit answer <ArrowRight size={13} /></>
        }
      </Button>
    </div>
  );
}
