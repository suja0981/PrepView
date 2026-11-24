import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Mic, Loader2, ArrowLeft, Check, ArrowRight,
  AlertTriangle, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import TextInterview from "./TextInterview";
import AnswerFeedbackPanel from "@/components/interview/AnswerFeedbackPanel";
import { calculateSpeechMetrics } from "@/utils/speechMetrics";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Use browser SpeechSynthesis to read the question aloud
function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // Stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ── Animated mic pulse rings (shows mic is actively recording) ────────────────
function MicPulse({ isListening }: { isListening: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Animated pulse rings — only visible when actively listening */}
      {isListening && (
        <>
          <span className="absolute inline-flex h-24 w-24 rounded-full bg-emerald-500/10 animate-ping [animation-duration:1.5s]" />
          <span className="absolute inline-flex h-20 w-20 rounded-full bg-emerald-500/10 animate-ping [animation-duration:1.5s] [animation-delay:0.3s]" />
        </>
      )}
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
          isListening
            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
            : "border-border bg-card text-muted-foreground"
        }`}
      >
        <Mic size={24} />
      </div>
    </div>
  );
}

// ── Main Interview component ──────────────────────────────────────────────────
export default function Interview() {
  const { id } = useParams<{ id: string }>();
  const {
    status,
    interview,
    currentQuestion,
    setCurrentQuestion,
    isLoading,
    error,
    seconds,
    transcript,
    spokenWordCount,
    isAnswerReady,
    isListening,
    isSpeechSupported,
    speechErrorMessage,
    questionNumber,
    pendingEvaluation,
    pendingIsFollowUp,
    startInterview,
    handleSubmit,
    handleContinueToNext,
  } = useInterviewSession(id ?? "");

  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<any>(null);

  // Read question aloud when TTS is enabled and a new question appears
  useEffect(() => {
    if (ttsEnabled && currentQuestion?.question && status === "listening") {
      speakText(currentQuestion.question);
    }
    return () => { stopSpeaking(); };
  }, [currentQuestion, ttsEnabled, status]);

  const requestMicPermission = async () => {
    setIsCheckingPermission(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setHasMicPermission(false);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error ──
  if (error || !interview) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-sm flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium text-foreground">Something went wrong</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{error ?? "Interview session not found."}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/"><ArrowLeft size={13} className="mr-1.5" /> Dashboard</Link>
        </Button>
      </div>
    );
  }

  // ── Delegate to text mode ──
  if (interview.mode === "text") {
    return (
      <TextInterview
        id={id ?? ""}
        interview={interview}
        currentQuestion={currentQuestion}
        onQuestionChange={setCurrentQuestion}
      />
    );
  }

  // ── Voice: Feedback panel (between questions) ──
  if (status === "feedback" && pendingEvaluation) {
    return (
      <AnswerFeedbackPanel
        evaluation={pendingEvaluation}
        questionNumber={questionNumber}
        isFollowUp={pendingIsFollowUp}
        onContinue={handleContinueToNext}
        metrics={lastMetrics}
      />
    );
  }

  // ── Voice: Lobby ──
  if (status === "idle") {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={13} /> Back
        </Link>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">{interview.difficulty}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">{interview.type.replace("_", " ")}</span>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">Voice mode</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight capitalize">{interview.role} Interview</h1>
            {interview.company && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                Targeting <span className="text-foreground font-medium">{interview.company}</span>
              </p>
            )}
          </div>

          <div className="text-[13px] text-muted-foreground space-y-1.5 border-t border-border pt-4">
            <p>• Read the question on screen, then speak your answer</p>
            <p>• Speak clearly (at least 5 words required to submit)</p>
            <p>• You will see AI feedback after each answer</p>
            <p>• Weak answers will get a targeted follow-up question</p>
          </div>

          {!isSpeechSupported && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-2.5">
              <AlertTriangle size={13} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-[12px] text-destructive">Speech recognition isn't supported in this browser. Use Chrome or Edge.</p>
            </div>
          )}
        </div>

        {/* Mic check */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground">Microphone</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Enable your microphone to start.</p>
          </div>

          {hasMicPermission === true ? (
            <div className="flex items-center gap-2 text-[13px] text-emerald-400">
              <Check size={14} /> <span>Connected</span>
            </div>
          ) : hasMicPermission === false ? (
            <div className="flex items-start gap-2">
              <AlertTriangle size={13} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-[12px] text-destructive">Microphone access denied. Allow it in your browser settings and reload.</p>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={requestMicPermission} disabled={isCheckingPermission} className="text-[13px]">
              {isCheckingPermission ? "Checking..." : "Enable microphone"}
            </Button>
          )}

          {/* TTS toggle */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-muted-foreground" />
              <div>
                <p className="text-[13px] font-medium text-foreground">Read questions aloud</p>
                <p className="text-[11px] text-muted-foreground">AI will speak each question so you can stay hands-free</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={ttsEnabled}
              aria-label="Read questions aloud"
              onClick={() => setTtsEnabled((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ttsEnabled ? "bg-primary" : "bg-secondary border border-border"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${ttsEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <Button
          onClick={startInterview}
          disabled={hasMicPermission !== true || !isSpeechSupported}
          className="w-full h-9 text-[13px] font-medium"
        >
          Start Interview
        </Button>
      </div>
    );
  }

  // ── Voice: Active Session ──
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${
            status === "listening" ? "bg-emerald-400 animate-pulse" :
            status === "submitting" ? "bg-amber-400 animate-pulse" :
            "bg-muted-foreground"
          }`} />
          <span className="text-[13px] text-muted-foreground">
            {status === "listening" ? "Listening to your answer..." :
             status === "submitting" ? "Evaluating with AI..." :
             "Processing"}
          </span>
        </div>
        <span className="font-mono text-[13px] text-muted-foreground tabular-nums">{formatTime(seconds)}</span>
      </div>

      {/* Question card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
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

      {/* Central mic animation */}
      <div className="flex flex-col items-center py-6 gap-4">
        <MicPulse isListening={isListening} />
        <p className="text-[12px] text-muted-foreground text-center">
          {status === "listening"
            ? isListening ? "Listening, speak your answer..." : "Starting microphone..."
            : "Evaluating with AI..."}
        </p>
      </div>

      {/* Live transcript */}
      {status === "listening" && (() => {
        const metrics = calculateSpeechMetrics(transcript, seconds);
        return (
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs font-medium text-muted-foreground">Transcript</p>
              
              <div className="flex items-center gap-2">
                {/* Live WPM badge */}
                {metrics.wpm > 0 && (
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                    metrics.wpmStatus === "optimal"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                    {metrics.wpm} WPM ({metrics.wpmStatus})
                  </span>
                )}

                {/* Live Filler badge */}
                {metrics.fillerCount > 0 && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {metrics.fillerCount} filler{metrics.fillerCount > 1 ? "s" : ""}
                  </span>
                )}

                {/* Word count */}
                <span className={`text-[11px] font-medium ${isAnswerReady ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {spokenWordCount} words {isAnswerReady ? "✓" : `(min 5)`}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full origin-left transition-[transform,background-color] duration-300 ${isAnswerReady ? "bg-emerald-500" : "bg-primary/50"}`}
                style={{ transform: `scaleX(${Math.min(spokenWordCount / 10, 1)})` }}
              />
            </div>

            {transcript ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{transcript}</p>
            ) : (
              <p className="text-[13px] text-muted-foreground/50 italic">Waiting for speech...</p>
            )}
          </div>
        );
      })()}

      {/* Speech error message */}
      {speechErrorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-2.5">
          <AlertTriangle size={13} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-[12px] text-destructive">{speechErrorMessage}</p>
        </div>
      )}

      {/* Submit */}
      {status === "listening" && (
        <Button
          onClick={() => {
            const m = calculateSpeechMetrics(transcript, seconds);
            setLastMetrics(m);
            handleSubmit();
          }}
          disabled={!isAnswerReady}
          className="w-full h-9 text-[13px] font-medium gap-1.5"
        >
          Submit answer <ArrowRight size={13} />
        </Button>
      )}

      {status === "submitting" && (
        <div className="flex items-center justify-center gap-2 py-2 text-[13px] text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Evaluating your answer...
        </div>
      )}
    </div>
  );
}
