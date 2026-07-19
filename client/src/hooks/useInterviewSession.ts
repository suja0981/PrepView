import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInterview, submitAnswer } from "@/api/interview.api";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useTimer } from "./useTimer";

export type InterviewStatus =
  | "idle"
  | "speaking"
  | "listening"
  | "submitting"
  | "completed";

export const useInterviewSession = (interviewId: string) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<InterviewStatus>("idle");
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    isListening,
    transcript,
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

  // Load interview details on mount
  useEffect(() => {
    let active = true;
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const res = await getInterview(interviewId);
        if (!active) return;

        // API returns { success, data: { interview, currentQuestion } }
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
    return () => {
      active = false;
    };
  }, [interviewId, navigate]);

  const startInterview = useCallback(() => {
    if (!currentQuestion) return;

    setStatus("listening");
    startTimer();
    startListening();
  }, [currentQuestion, startTimer, startListening]);

  const handleNextQuestion = useCallback((nextQuestionObj: any) => {
    setCurrentQuestion(nextQuestionObj);
    resetTranscript();
    resetTimer();

    setStatus("listening");
    startTimer();
    startListening();
  }, [resetTranscript, resetTimer, startTimer, startListening]);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || status !== "listening") return;

    setStatus("submitting");
    stopTimer();
    stopListening();

    try {
      const res = await submitAnswer(interviewId, {
        questionId: currentQuestion._id,
        answer: transcript || "(No answer spoken)",
        responseTime: seconds || 1,
      });

      // API returns { success, data: { completed, nextQuestion/report } }
      const payload = res.data;

      if (payload.completed) {
        setStatus("completed");
        navigate(`/interview/${interviewId}/report`);
      } else {
        handleNextQuestion(payload.nextQuestion);
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
    stopTimer,
    stopListening,
    startTimer,
    startListening,
    navigate,
    handleNextQuestion,
  ]);

  const cleanUp = useCallback(() => {
    stopListening();
    stopTimer();
  }, [stopListening, stopTimer]);

  // Clean up speech and timers on unmount
  useEffect(() => {
    return () => {
      cleanUp();
    };
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
    isListening,
    isSpeechSupported,
    startInterview,
    handleSubmit,
    cleanUp,
  };
};
