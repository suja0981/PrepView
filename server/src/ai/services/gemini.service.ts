import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const MODEL = "gemini-3.5-flash";

/** Strip markdown code fences that Gemini sometimes wraps around JSON */
function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

/**
 * Single entry point for all Gemini calls.
 * Retries once if the first parse fails (Gemini occasionally adds preamble).
 */
export async function callGemini(prompt: string): Promise<any> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const raw = response.text ?? "";

  try {
    return JSON.parse(stripFences(raw));
  } catch {
    // One retry — ask model to return raw JSON only
    const retry = await ai.models.generateContent({
      model: MODEL,
      contents: `Return ONLY valid JSON, no markdown, no explanation:\n${prompt}`,
    });
    return JSON.parse(stripFences(retry.text ?? "{}"));
  }
}
