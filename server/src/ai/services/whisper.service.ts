import Groq from "groq-sdk";
import fs from "fs";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

export async function transcribeAudioFile(filePath: string): Promise<string> {
  const rawKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY || "";
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

  if (!apiKey || apiKey === "gsk_dummy_test_key") {
    throw new AppError(
      "GROQ_API_KEY environment variable is missing on the server. Voice transcription is unavailable.",
      500,
    );
  }

  const client = new Groq({ apiKey });
  const fileStream = fs.createReadStream(filePath);

  const response = await client.audio.transcriptions.create({
    file: fileStream,
    model: "whisper-large-v3-turbo",
    response_format: "json",
    language: "en",
  });

  return response.text ?? "";
}
