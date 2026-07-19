import { useState, useRef } from "react";
import {
  Upload, FileText, Loader2, CheckCircle, AlertCircle,
  Sparkles, BarChart3, ArrowRight, X, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { analyzeResume } from "@/api/resume.api";

type AnalysisState = "idle" | "uploading" | "done";

interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  talkingPoints: string[];
}



function ScoreMeter({ score }: { score: number }) {
  const color = score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  const ringColor = score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500";
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" strokeWidth="6" className="stroke-border" />
          <circle
            cx="48" cy="48" r={r} fill="none" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${ringColor} transition-all duration-700`}
          />
        </svg>
        <span className={`absolute text-2xl font-bold ${color}`}>{score}</span>
      </div>
      <p className="text-[12px] text-muted-foreground">Match score</p>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const [state, setState] = useState<AnalysisState>("idle");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!["application/pdf", "text/plain"].includes(f.type)) {
      toast.error("Only PDF or TXT files are supported");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }
    setResumeFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!resumeFile || jdText.trim().length < 50) {
      toast.error("Upload a resume and paste the job description (min 50 chars)");
      return;
    }
    setState("uploading");
    try {
      const res = await analyzeResume(resumeFile, jdText.trim());
      setResult(res.data);
      setState("done");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Analysis failed. Please try again.");
      setState("idle");
    }
  };

  const reset = () => {
    setState("idle");
    setResumeFile(null);
    setJdText("");
    setResult(null);
  };

  // ── Results view ──
  if (state === "done" && result) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Analysis complete</p>
            <h1 className="text-2xl font-semibold tracking-tight">Resume vs JD Report</h1>
            <p className="mt-1 text-sm text-muted-foreground">{resumeFile?.name}</p>
          </div>
          <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <RefreshCw size={13} /> New analysis
          </button>
        </div>

        {/* Score + summary */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <ScoreMeter score={result.matchScore} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1.5">AI Summary</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{result.summary}</p>
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-500" />
              <p className="text-sm font-semibold text-foreground">What matches</p>
            </div>
            <ul className="space-y-2">
              {result.strengths.map((s) => (
                <li key={s} className="text-[13px] text-muted-foreground pl-4 relative before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-emerald-500">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-500" />
              <p className="text-sm font-semibold text-foreground">Gaps identified</p>
            </div>
            <ul className="space-y-2">
              {result.gaps.map((g) => (
                <li key={g} className="text-[13px] text-muted-foreground pl-4 relative before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-amber-500">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggestions */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Suggested improvements</p>
          <div className="space-y-2">
            {result.suggestions.map((s, i) => (
              <div key={s} className="flex gap-3 text-[13px]">
                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground mt-0.5">
                  {i + 1}
                </span>
                <p className="text-muted-foreground leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-border bg-secondary/30 px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-[13px] text-muted-foreground">
            Ready to test your answers for this role?
          </p>
          <a
            href="/interview/text/create"
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Practice now <ArrowRight size={13} />
          </a>
        </div>
      </div>
    );
  }

  // ── Upload / input view ──
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 space-y-10">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground mb-4">
          <Sparkles size={11} className="text-primary" />
          AI-powered gap analysis
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Resume Analyzer</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Paste a job description and upload your resume. The AI compares them and tells you exactly what's missing, what's strong, and what to fix.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">

        {/* Resume upload */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Your resume <span className="text-destructive">*</span>
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !resumeFile && fileRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[180px] ${
              dragging
                ? "border-primary bg-primary/5"
                : resumeFile
                ? "border-emerald-500/40 bg-emerald-500/5 cursor-default"
                : "border-border hover:border-primary/40 hover:bg-secondary/30"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            {resumeFile ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                  <FileText size={20} className="text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-foreground">{resumeFile.name}</p>
                  <p className="text-[12px] text-muted-foreground">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                  className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Upload size={18} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-foreground">Drop your resume here</p>
                  <p className="text-[12px] text-muted-foreground">PDF or TXT · Max 5 MB</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* JD input */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Job description <span className="text-destructive">*</span>
          </p>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here — requirements, responsibilities, preferred skills..."
            rows={8}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-colors"
          />
          <p className="text-[12px] text-muted-foreground">{jdText.length} characters</p>
        </div>
      </div>

      {/* Analyze button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
        <Button
          onClick={handleAnalyze}
          disabled={state === "uploading" || !resumeFile || jdText.trim().length < 50}
          className="h-10 px-6 text-[13px] font-medium gap-2"
        >
          {state === "uploading" ? (
            <><Loader2 size={14} className="animate-spin" /> Analyzing with AI...</>
          ) : (
            <><BarChart3 size={14} /> Analyze resume</>
          )}
        </Button>
        <p className="text-[12px] text-muted-foreground">
          {!resumeFile && "Upload resume · "}
          {jdText.trim().length < 50 && "Add job description · "}
          Powered by Gemini AI
        </p>
      </div>

    </div>
  );
}
