import Groq from "groq-sdk";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

// ── Model constants ──────────────────────────────────────────────────────────
// Fast (8B)  → question generation, resume extraction  — low latency, high volume
// Smart (70B) → evaluation, report narrative            — higher quality, used sparingly
const FAST_MODEL  = "llama-3.1-8b-instant";
const SMART_MODEL = "llama-3.3-70b-versatile";

// ── Groq client factory ──────────────────────────────────────────────────────
function getGroqClient(): Groq {
  const rawKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY || "";
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

  if (!apiKey || apiKey === "gsk_dummy_test_key") {
    throw new AppError(
      "GROQ_API_KEY environment variable is missing on the server. Please set it in your environment.",
      500,
    );
  }

  return new Groq({ apiKey });
}

// ── Strip markdown code fences LLMs sometimes wrap around JSON ───────────────
function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

// ── Core call with 429 retry ─────────────────────────────────────────────────
async function callGroq(model: string, prompt: string): Promise<any> {
  const client = getGroqClient();

  async function attempt(): Promise<string> {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content ?? "";
    } catch (err: unknown) {
      const e = err as any;
      // 401 — bad key
      if (e?.status === 401 || e?.message?.includes("401") || e?.code === "invalid_api_key") {
        throw new AppError(
          "Invalid GROQ_API_KEY. Get a free key at https://console.groq.com/keys and update your environment settings.",
          500,
        );
      }
      // 429 — rate limited: throw a typed sentinel so the caller can retry once
      if (e?.status === 429) {
        throw Object.assign(new Error("GROQ_RATE_LIMITED"), { isRateLimit: true });
      }
      throw err;
    }
  }

  let raw: string;
  try {
    raw = await attempt();
  } catch (err: unknown) {
    const e = err as any;
    if (e?.isRateLimit) {
      // One retry after 1 s
      await new Promise((res) => setTimeout(res, 1000));
      try {
        raw = await attempt();
      } catch (retryErr: unknown) {
        const re = retryErr as any;
        if (re?.isRateLimit) {
          throw new AppError(
            "AI service is temporarily rate-limited. Please wait a moment and try again.",
            429,
          );
        }
        throw retryErr;
      }
    } else {
      throw err;
    }
  }

  if (!raw.trim()) {
    throw new Error("AI service returned an empty response. Please try again.");
  }

  try {
    return JSON.parse(stripFences(raw));
  } catch {
    // One retry asking for raw JSON only
    const client2 = getGroqClient();
    const retry = await client2.chat.completions.create({
      model,
      messages: [{ role: "user", content: `Return ONLY valid JSON, no markdown, no explanation:\n${prompt}` }],
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

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fast model (llama-3.1-8b-instant)
 * Use for: question generation, resume extraction
 */
export async function callGroqFast(prompt: string): Promise<any> {
  return callGroq(FAST_MODEL, prompt);
}

/**
 * Smart model (llama-3.3-70b-versatile)
 * Use for: answer evaluation, interview report narrative
 */
export async function callGroqSmart(prompt: string): Promise<any> {
  return callGroq(SMART_MODEL, prompt);
}

/**
 * @deprecated Use callGroqFast or callGroqSmart instead.
 * Kept temporarily so old imports don't break during migration.
 */
export async function callGemini(prompt: string): Promise<any> {
  return callGroqFast(prompt);
}
