export interface FillerMatch {
  word: string;
  count: number;
}

export interface SpeechMetrics {
  wordCount: number;
  durationSeconds: number;
  wpm: number;
  wpmStatus: "slow" | "optimal" | "fast";
  fillerCount: number;
  fillerDensity: number;
  fillersFound: FillerMatch[];
}

const COMMON_FILLERS = [
  "um",
  "uh",
  "like",
  "you know",
  "basically",
  "actually",
  "sort of",
  "kind of",
  "right",
  "honestly",
];

/**
 * Calculates speech metrics (WPM, status, filler words, density) from speech transcript and duration.
 */
export function calculateSpeechMetrics(
  transcript: string,
  durationSeconds: number,
): SpeechMetrics {
  const text = transcript.trim();
  if (!text || durationSeconds <= 0) {
    return {
      wordCount: 0,
      durationSeconds: Math.max(0, durationSeconds),
      wpm: 0,
      wpmStatus: "slow",
      fillerCount: 0,
      fillerDensity: 0,
      fillersFound: [],
    };
  }

  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;

  const minutes = durationSeconds / 60;
  const wpm = Math.round(wordCount / minutes);

  let wpmStatus: "slow" | "optimal" | "fast" = "optimal";
  if (wpm < 110) wpmStatus = "slow";
  else if (wpm > 165) wpmStatus = "fast";

  const lowerText = text.toLowerCase();
  const fillersFound: FillerMatch[] = [];
  let totalFillers = 0;

  for (const filler of COMMON_FILLERS) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      fillersFound.push({ word: filler, count });
      totalFillers += count;
    }
  }

  const fillerDensity = Math.round((totalFillers / wordCount) * 100);

  return {
    wordCount,
    durationSeconds,
    wpm,
    wpmStatus,
    fillerCount: totalFillers,
    fillerDensity,
    fillersFound,
  };
}
