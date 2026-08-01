import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInterview, submitAnswer } from "@/api/interview.api";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useTimer } from "./useTimer";

export type InterviewStatus =
  | "idle"
  | "speaking"    // reserved: AI reading question via TTS
  | "listening"   // microphone is active, capturing speech
  | "feedback"    // showing per-answer evaluation before next question
  | "submitting"  // API call in-flight
  | "completed";

// Minimum words spoken before a voice answer can be submitted
const MIN_SPOKEN_WORDS = 5;

export interface VoiceEvaluation {
  overallScore: number;
  technicalAccuracy: number;
  reasoning: number;
  communication: number;
  feedback: string;
  weakTopics: string[];
}

export const useInterviewSession = (interviewId: string) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<InterviewStatus>("idle");
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Question counter — tracked locally to avoid stale interview.questionsAsked
  const [questionNumber, setQuestionNumber] = useState(1);

  // Pending evaluation & next question — shown in the feedback panel
  const [pendingEvaluation, setPendingEvaluation] = useState<VoiceEvaluation | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<any>(null);
  const [pendingIsFollowUp, setPendingIsFollowUp] = useState(false);

  const {
    isListening,
    transcript,
    speechError,
    speechErrorMessage,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition();

  const {
    seconds,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
  } = useTimer();

  // Computed: is the transcript long enough to submit?
  const spokenWordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const isAnswerReady = spokenWordCount >= MIN_SPOKEN_WORDS;

  // Load interview details on mount
  useEffect(() => {
    let active = true;
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const res = await getInterview(interviewId);
        if (!active) return;

        setInterview(res.data.interview);
        setCurrentQuestion(res.data.currentQuestion);

        if (res.data.interview.status === "completed") {
          setStatus("completed");
          navigate(`/interview/${interviewId}/report`, { replace: true });
        } else {
          setStatus("idle");
        }
      } catch (err: any) {
        if (!active) return;
        setError(err.response?.data?.message ?? "Failed to load interview session");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchSession();
    return () => { active = false; };
  }, [interviewId, navigate]);

  const startInterview = useCallback(() => {
    if (!currentQuestion) return;
    setStatus("listening");
    startTimer();
    startListening();
  }, [currentQuestion, startTimer, startListening]);

  // Called when user clicks "Next question" in the feedback panel
  const handleContinueToNext = useCallback(() => {
    if (!pendingNextQuestion) return;
    setCurrentQuestion(pendingNextQuestion);
    setQuestionNumber((n) => n + 1);
    setPendingEvaluation(null);
    setPendingNextQuestion(null);
    setPendingIsFollowUp(false);
    resetTranscript();
    resetTimer();
    setStatus("listening");
    startTimer();
    startListening();
  }, [pendingNextQuestion, resetTranscript, resetTimer, startTimer, startListening]);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || status !== "listening") return;
    if (!isAnswerReady) return; // Minimum speech guard

    setStatus("submitting");
    stopTimer();
    stopListening();

    try {
      const res = await submitAnswer(interviewId, {
        questionId: currentQuestion._id,
        answer: transcript,
        responseTime: seconds || 1,
      });

      const payload = res.data;

      if (payload.completed) {
        setStatus("completed");
        navigate(`/interview/${interviewId}/report`);
      } else {
        // Show the feedback panel — don't jump directly to next question
        setPendingEvaluation(payload.evaluation);
        setPendingNextQuestion(payload.nextQuestion);
        setPendingIsFollowUp(!!payload.isFollowUp);
        setStatus("feedback");
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to submit answer");
      setStatus("listening");
      startTimer();
      startListening();
    }
  }, [
    interviewId,
    currentQuestion,
    status,
    transcript,
    seconds,
    isAnswerReady,
    stopTimer,
    stopListening,
    startTimer,
    startListening,
    navigate,
  ]);

  const cleanUp = useCallback(() => {
    stopListening();
    stopTimer();
  }, [stopListening, stopTimer]);

  useEffect(() => {
    return () => { cleanUp(); };
  }, [cleanUp]);

  return {
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
    speechError,
    speechErrorMessage,
    questionNumber,
    pendingEvaluation,
    pendingIsFollowUp,
    startInterview,
    handleSubmit,
    handleContinueToNext,
    cleanUp,
  };
};
