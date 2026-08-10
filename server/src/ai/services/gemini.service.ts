import Groq from "groq-sdk";
import { env } from "../../config/env";

// ── Active provider config ────────────────────────────────────────────────────
// Change MODEL here to swap between Groq-hosted LLMs at any time.
// Available fast models on Groq:
//   llama-3.1-8b-instant  → fastest, good for question generation
//   llama-3.3-70b-versatile → stronger, better for evaluation/report
//   mixtral-8x7b-32768    → large context window
const MODEL = "llama-3.1-8b-instant";

import { AppError } from "../../shared/errors/app-error";

function getGroqClient(): Groq {
  const rawKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY || "";
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

  if (!apiKey || apiKey === "gsk_dummy_test_key") {
    throw new AppError(
      "GROQ_API_KEY environment variable is missing on the server. Please set it in Render dashboard.",
      500,
    );
  }

  return new Groq({ apiKey });
}

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
  const client = getGroqClient();

  let response;
  try {
    response = await client.chat.completions.create({
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
  } catch (err: any) {
    if (err?.status === 401 || err?.message?.includes("401") || err?.code === "invalid_api_key") {
      throw new AppError(
        "Invalid GROQ_API_KEY configured in environment variables. Get a free key at https://console.groq.com/keys and update Render settings.",
        500,
      );
    }
    throw err;
  }

  const raw = response.choices[0]?.message?.content ?? "";

  if (!raw.trim()) {
    throw new Error("AI service returned an empty response. Please try again.");
  }

  try {
    return JSON.parse(stripFences(raw));
  } catch {
    // One retry — ask the model to return raw JSON only
    const retry = await client.chat.completions.create({
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
