import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechError =
  | "not-supported"
  | "permission-denied"
  | "audio-capture"
  | "network"
  | "no-speech"
  | "unknown";

const ERROR_MESSAGES: Record<SpeechError, string> = {
  "not-supported": "Speech recognition is not supported in this browser. Use Chrome or Edge.",
  "permission-denied": "Microphone access was denied. Please allow microphone access and try again.",
  "audio-capture": "No microphone was found. Ensure a microphone is connected.",
  "network": "A network error occurred with speech recognition. Check your connection.",
  "no-speech": "No speech detected. Please speak closer to your microphone.",
  "unknown": "An unexpected error occurred with speech recognition.",
};

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState<SpeechError | null>(null);
  const recognitionRef = useRef<any>(null);

  // shouldRestartRef lets us distinguish "user stopped" vs "browser auto-stopped on silence"
  const shouldRestartRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    // Chrome stops recognition after ~5-10s of silence.
    // If shouldRestart is true, we auto-restart to keep listening for long answers.
    recognition.onend = () => {
      setIsListening(false);
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started — ignore the InvalidStateError
        }
      }
    };

    recognition.onerror = (event: any) => {
      const errorType = event.error as string;

      // "no-speech" is non-fatal — Chrome fires it on long pauses but auto-restarts
      if (errorType === "no-speech") return;

      // "aborted" happens when we intentionally stop — not an error
      if (errorType === "aborted") return;

      const mapped: SpeechError =
        errorType === "not-allowed" ? "permission-denied" :
        errorType === "audio-capture" ? "audio-capture" :
        errorType === "network" ? "network" :
        "unknown";

      setSpeechError(mapped);
      shouldRestartRef.current = false;
    };

    recognition.onresult = (event: any) => {
      // Build transcript from only the results we haven't seen yet + interim
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      setTranscript((finalText + interimText).trim());
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      try { recognition.stop(); } catch { /* ignore */ }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setSpeechError(null);
    setTranscript("");
    shouldRestartRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      // Already running — ignore InvalidStateError
      if (e?.name !== "InvalidStateError") {
        console.error("Failed to start speech recognition", e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false; // Prevent auto-restart
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch { /* ignore */ }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  const clearError = useCallback(() => {
    setSpeechError(null);
  }, []);

  return {
    isListening,
    transcript,
    speechError,
    speechErrorMessage: speechError ? ERROR_MESSAGES[speechError] : null,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
    isSupported,
  };
};
