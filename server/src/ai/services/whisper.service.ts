import Groq from "groq-sdk";
import fs from "fs";
import { env } from "../../config/env";

export async function transcribeAudioFile(filePath: string): Promise<string> {
  const rawKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY || "";
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

  const client = new Groq({ apiKey: apiKey || "gsk_dummy_test_key" });
  const fileStream = fs.createReadStream(filePath);
  const response = await client.audio.transcriptions.create({
    file: fileStream,
    model: "whisper-large-v3-turbo",
    response_format: "json",
    language: "en",
  });

  return response.text ?? "";
}
