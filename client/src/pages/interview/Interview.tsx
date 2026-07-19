import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Mic, Loader2, ArrowLeft, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import TextInterview from "./TextInterview";

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
    isSpeechSupported,
    startInterview,
    handleSubmit,
  } = useInterviewSession(id ?? "");

  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  const requestMicPermission = async () => {
    setIsCheckingPermission(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("Microphone permission denied", err);
      setHasMicPermission(false);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

  // ── Text mode: delegate (no double-fetch, shares loaded data) ──
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

  // ── Lobby (voice) ──
  if (status === "idle") {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={13} /> Back
        </Link>

        <div className="rounded-lg border border-border bg-card p-6 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                {interview.difficulty}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                {interview.type}
              </span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight capitalize">{interview.role} Interview</h1>
            {interview.company && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                Targeting <span className="text-foreground font-medium">{interview.company}</span>
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="text-[13px] text-muted-foreground space-y-1.5">
            <p>• Hybrid Voice Mode — Read the question on screen, speak your answer</p>
            <p>• Speak clearly in a quiet environment</p>
            <p>• Click the submit button when you finish answering</p>
          </div>

          {!isSpeechSupported && (
            <p className="text-[13px] text-destructive">
              Speech recognition isn't supported in this browser. Use Chrome or Edge.
            </p>
          )}
        </div>

        {/* Mic check */}
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-foreground">Microphone</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground mb-4">Enable your microphone to start.</p>

          {hasMicPermission === true ? (
            <div className="flex items-center gap-2 text-[13px] text-emerald-400">
              <Check size={14} />
              <span>Connected</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={requestMicPermission}
              disabled={isCheckingPermission}
              className="text-[13px]"
            >
              {isCheckingPermission ? "Checking..." : "Enable microphone"}
            </Button>
          )}
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

  // ── Active Session ──
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${
            status === "listening" ? "bg-emerald-400" :
            "bg-amber-400"
          }`} />
          <span className="text-[13px] text-muted-foreground">
            {status === "listening" ? "Listening to your answer..." :
             "Processing"}
          </span>
        </div>
        <span className="font-mono text-[13px] text-muted-foreground tabular-nums">
          {formatTime(seconds)}
        </span>
      </div>

      {/* Central indicator */}
      <div className="flex flex-col items-center py-8">
        <button
          className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all ${
            status === "listening"
              ? "border-emerald-500/50 text-emerald-400 cursor-pointer hover:bg-emerald-500/10"
              : "border-border text-muted-foreground"
          }`}
          onClick={() => status === "listening" && handleSubmit()}
          disabled={status !== "listening"}
        >
          {status === "listening" && <Mic size={24} />}
          {status === "submitting" && <Loader2 size={24} className="animate-spin" />}
        </button>
        <p className="mt-3 text-[12px] text-muted-foreground">
          {status === "listening" ? "Speak your answer, then click to submit" :
           "Evaluating with AI..."}
        </p>
      </div>

      {/* Question */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
          <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            Question {interview.questionsAsked + 1}
          </span>
          <span className="text-[12px] text-muted-foreground capitalize">{currentQuestion?.topic}</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-foreground">{currentQuestion?.question}</p>
        </div>
      </div>

      {/* Transcript */}
      {status === "listening" && (
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Transcript</p>
          {transcript ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{transcript}</p>
          ) : (
            <p className="text-[13px] text-muted-foreground/50 italic">Waiting for speech...</p>
          )}
        </div>
      )}

      {/* Submit */}
      {status === "listening" && (
        <Button onClick={handleSubmit} className="w-full h-9 text-[13px] font-medium gap-1.5">
          Submit answer <ArrowRight size={13} />
        </Button>
      )}
    </div>
  );
}
