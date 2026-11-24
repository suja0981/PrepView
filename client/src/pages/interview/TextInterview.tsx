import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitAnswer } from "@/api/interview.api";
import { useTimer } from "@/hooks/useTimer";
import AnswerFeedbackPanel from "@/components/interview/AnswerFeedbackPanel";

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

// ── Main component ────────────────────────────────────────────────────────────
export default function TextInterview({ id, interview, currentQuestion, onQuestionChange }: Props) {
  const navigate = useNavigate();
  const isResuming = interview?.status === "in_progress" && (interview?.questionsAsked || 0) > 0;
  const initialQNum = Math.min(10, (interview?.questionsAsked || 0) + 1);
  const [started, setStarted] = useState(isResuming);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(initialQNum);

  // Feedback panel state — shown between questions
  const [pendingEvaluation, setPendingEvaluation] = useState<EvaluationData | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<any>(null);
  const [pendingIsFollowUp, setPendingIsFollowUp] = useState(false);

  const { seconds, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer();

  useEffect(() => {
    if (isResuming) {
      startTimer();
    }
  }, [isResuming, startTimer]);

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
      <AnswerFeedbackPanel
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
        {/* Progress bar */}
        <div className="w-full bg-secondary h-1 overflow-hidden">
          <div
            className="bg-primary h-full origin-left transition-transform duration-300"
            style={{ transform: `scaleX(${Math.min(1, Math.max(0.1, questionNumber / 10))})` }}
          />
        </div>
        <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground font-mono">
              Question {questionNumber} of 10
            </span>
            {currentQuestion?.isFollowUp && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Follow-up
              </span>
            )}
          </div>
          <span className="text-[12px] text-muted-foreground capitalize">{currentQuestion?.topic}</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-foreground">{currentQuestion?.question}</p>
        </div>
      </div>

      {/* Answer textarea */}
      <div className="space-y-2">
        <label htmlFor="interview-answer" className="sr-only">Your interview answer</label>
        <textarea
          id="interview-answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isAnswerReady && !submitting) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={submitting}
          placeholder="Type your answer here... (Ctrl/Cmd + Enter to submit)"
          rows={8}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring transition-colors disabled:opacity-50"
        />

        {/* Word count + progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className={`font-mono text-xs font-medium ${isAnswerReady ? "text-emerald-500" : "text-muted-foreground"}`}>
              {wordCount} words {isAnswerReady ? "(Ready)" : `(min ${MIN_WORDS})`}
            </span>
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>
          <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full origin-left transition-[transform,background-color] duration-300 ${isAnswerReady ? "bg-emerald-500" : "bg-primary/50"}`}
              style={{ transform: `scaleX(${progressPct / 100})` }}
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
