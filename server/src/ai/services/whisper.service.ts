import Groq from "groq-sdk";
import fs from "fs";
import { env } from "../../config/env";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

/**
 * Transcribes an audio file using Groq's free whisper-large-v3-turbo model.
 */
export async function transcribeAudioFile(filePath: string): Promise<string> {
  const fileStream = fs.createReadStream(filePath);
  const response = await groq.audio.transcriptions.create({
    file: fileStream,
    model: "whisper-large-v3-turbo",
    response_format: "json",
    language: "en",
  });

  return response.text ?? "";
}
