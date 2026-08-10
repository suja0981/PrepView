import Groq from "groq-sdk";
import { env } from "../../config/env";

// ── Active provider config ────────────────────────────────────────────────────
// Change MODEL here to swap between Groq-hosted LLMs at any time.
// Available fast models on Groq:
//   llama-3.1-8b-instant  → fastest, good for question generation
//   llama-3.3-70b-versatile → stronger, better for evaluation/report
//   mixtral-8x7b-32768    → large context window
const MODEL = "llama-3.1-8b-instant";

const groq = new Groq({ apiKey: env.GROQ_API_KEY || "gsk_dummy_test_key" });

/** Strip markdown code fences that LLMs sometimes wrap around JSON */
function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

/**
 * Single entry point for all AI calls — drop-in replacement for the old Gemini call.
 * All prompts, services, and controllers call this function and nothing else,
 * so swapping the provider here is the only change needed anywhere.
 *
 * Retries once if the response can't be parsed as JSON.
 */
export async function callGemini(prompt: string): Promise<any> {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    // Enforce JSON output — Groq supports this natively for Llama 3 models
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content ?? "";

  if (!raw.trim()) {
    throw new Error("AI service returned an empty response. Please try again.");
  }

  try {
    return JSON.parse(stripFences(raw));
  } catch {
    // One retry — ask the model to return raw JSON only
    const retry = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: `Return ONLY valid JSON, no markdown, no explanation:\n${prompt}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    const retryRaw = retry.choices[0]?.message?.content ?? "";
    if (!retryRaw.trim()) {
      throw new Error("AI service failed to return valid JSON after retry. Please try again.");
    }
    return JSON.parse(stripFences(retryRaw));
  }
}
