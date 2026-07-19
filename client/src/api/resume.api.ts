import { api } from "./axios";

export async function analyzeResume(file: File, jobDescription: string) {
  const form = new FormData();
  form.append("resume", file);
  form.append("jobDescription", jobDescription);
  const res = await api.post("/resume/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
