import { useState, useRef, useEffect } from "react";
import {
  Upload, FileText, Loader2, CheckCircle, AlertCircle,
  Sparkles, BarChart3, ArrowRight, X, RefreshCw,
  MessageSquare, HelpCircle, Lightbulb, Check, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { analyzeResume } from "@/api/resume.api";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

type AnalysisState = "idle" | "uploading" | "done";

// Matches the actual API response from resume.service.ts
interface AnalysisResult {
  atsScore: number;         // 0-100 deterministic ATS score
  matchedSkills: string[];  // skills found in both resume & JD
  missingSkills: string[];  // required JD skills absent from resume
  summary: string;
  suggestions: string[];
  talkingPoints: string[];
  possibleQuestions: string[];
}

const SCAN_STEPS = [
  "Extracting text & parsing document structure...",
  "Analyzing job description requirements & skill taxonomy...",
  "Cross-referencing experience against missing keywords...",
  "Calculating deterministic ATS score & generating report...",
];

// ── Multi-Step Animated Scanning Radar ───────────────────────────────────────
function ScanningRadar() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-lg rounded-2xl border border-primary/20 bg-card/95 p-8 text-center shadow-2xl space-y-6 backdrop-blur-xl"
    >
      {/* Animated Scan Pulsar */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-primary/10 animate-ping [animation-duration:2s]" />
        <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/20 animate-pulse" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Cpu size={22} className="animate-spin [animation-duration:6s]" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Analyzing Resume & JD</h2>
        <p className="text-[13px] text-muted-foreground">PrepView AI is scanning your profile against requirements</p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-2.5 text-left pt-2 border-t border-border/50">
        {SCAN_STEPS.map((stepText, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div key={idx} className="flex items-center gap-3 text-[12.5px]">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                {isDone ? (
                  <Check size={13} className="text-emerald-500 font-bold" />
                ) : isCurrent ? (
                  <Loader2 size={13} className="animate-spin text-primary" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                )}
              </div>
              <span className={isDone ? "text-muted-foreground line-through decoration-muted-foreground/40" : isCurrent ? "font-medium text-foreground" : "text-muted-foreground/50"}>
                {stepText}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Circular ATS Score Meter ──────────────────────────────────────────────────
function ScoreMeter({ score }: { score: number }) {
  const isGood = score >= 75;
  const isMid = score >= 50;
  const color = isGood ? "text-emerald-500" : isMid ? "text-amber-500" : "text-red-400";
  const ringColor = isGood ? "stroke-emerald-500" : isMid ? "stroke-amber-500" : "stroke-red-400";
  const label = isGood ? "Strong match" : isMid ? "Partial match" : "Weak match";
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
          <circle cx="56" cy="56" r={r} fill="none" strokeWidth="7" className="stroke-border/60" />
          <circle
            cx="56" cy="56" r={r} fill="none" strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${ringColor} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-3xl font-bold tabular-nums font-mono ${color}`}>{score}</span>
          <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className={`text-[12px] font-semibold ${color}`}>{label}</p>
        <p className="text-[11px] text-muted-foreground">ATS Score</p>
      </div>
    </div>
  );
}

// ── Skill Chip ───────────────────────────────────────────────────────────────
function SkillChip({ label, variant }: { label: string; variant: "matched" | "missing" }) {
  const styles =
    variant === "matched"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles}`}>
      {label}
    </span>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
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

  // ── Scanning / Uploading State View ────────────────────────────────────────
  if (state === "uploading") {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
        <ScanningRadar />
      </div>
    );
  }

  // ── Results View ─────────────────────────────────────────────────────────
  if (state === "done" && result) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">

        {/* Header */}
        <FadeIn>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Analysis complete
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">Resume vs JD Report</h1>
              <p className="mt-1 text-sm text-muted-foreground">{resumeFile?.name}</p>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors shrink-0"
            >
              <RefreshCw size={13} /> New analysis
            </button>
          </div>
        </FadeIn>

        {/* Score + Summary */}
        <FadeIn delay={0.05}>
          <div className="rounded-xl border border-border/80 bg-card p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-xs">
            <ScoreMeter score={result.atsScore} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1.5">AI Summary</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </FadeIn>

        {/* Skill Chips — Matched & Missing */}
        <StaggerContainer stagger={0.08} className="grid sm:grid-cols-2 gap-4">
          <StaggerItem>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <p className="text-sm font-semibold text-foreground">
                  Matched skills ({result.matchedSkills.length})
                </p>
              </div>
              {result.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map((s) => (
                    <SkillChip key={s} label={s} variant="matched" />
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-muted-foreground italic">None detected.</p>
              )}
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" />
                <p className="text-sm font-semibold text-foreground">
                  Missing skills ({result.missingSkills.length})
                </p>
              </div>
              {result.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s) => (
                    <SkillChip key={s} label={s} variant="missing" />
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-emerald-500 font-medium">✓ No skill gaps found</p>
              )}
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Suggested Improvements */}
        <FadeIn delay={0.12}>
          <SectionCard title="Suggested improvements" icon={<Lightbulb size={15} />}>
            <div className="space-y-2">
              {result.suggestions.map((s, i) => (
                <div key={i} className="flex gap-3 text-[13px]">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground font-mono mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </FadeIn>

        {/* Talking Points */}
        {result.talkingPoints.length > 0 && (
          <FadeIn delay={0.15}>
            <SectionCard title="Talking points for the interview" icon={<MessageSquare size={15} />}>
              <ul className="space-y-2">
                {result.talkingPoints.map((t, i) => (
                  <li key={i} className="text-[13px] text-muted-foreground pl-4 relative before:absolute before:left-0 before:top-[7px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary">
                    {t}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </FadeIn>
        )}

        {/* Possible Interview Questions */}
        {result.possibleQuestions.length > 0 && (
          <FadeIn delay={0.18}>
            <SectionCard title="Likely interview questions" icon={<HelpCircle size={15} />}>
              <p className="text-[12px] text-muted-foreground -mt-1">
                Based on the JD and your profile — practice these before the interview.
              </p>
              <ol className="space-y-2.5">
                {result.possibleQuestions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-[13px]">
                    <span className="shrink-0 w-5 text-right text-[11px] font-semibold text-muted-foreground/60 font-mono mt-0.5">
                      {i + 1}.
                    </span>
                    <p className="text-muted-foreground leading-relaxed">{q}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          </FadeIn>
        )}

        {/* CTA */}
        <FadeIn delay={0.2}>
          <div className="rounded-xl border border-border bg-secondary/30 px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-[13px] text-muted-foreground">
              Ready to practice answers for this role?
            </p>
            <a
              href="/interview/create"
              className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
            >
              Practice now <ArrowRight size={13} />
            </a>
          </div>
        </FadeIn>
      </div>
    );
  }

  // ── Upload / Input View ──────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">

      {/* Header */}
      <FadeIn>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground mb-3">
            <Sparkles size={11} className="text-primary" />
            AI-powered ATS analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Resume Analyzer</h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
            Paste a job description and upload your resume. PrepView AI compares them and provides your ATS
            score, matched/missing skills, and likely interview questions.
          </p>
        </div>
      </FadeIn>

      <StaggerContainer stagger={0.08} className="grid sm:grid-cols-2 gap-5">

        {/* Resume Upload */}
        <StaggerItem>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Your resume <span className="text-destructive">*</span>
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !resumeFile && fileRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[200px] ${
                dragging
                  ? "border-primary bg-primary/5"
                  : resumeFile
                  ? "border-emerald-500/40 bg-emerald-500/5 cursor-default"
                  : "border-border/70 hover:border-primary/40 hover:bg-secondary/30"
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <FileText size={20} className="text-emerald-500" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-[13px] font-medium text-foreground truncate max-w-[200px]">{resumeFile.name}</p>
                    <p className="text-[12px] text-muted-foreground font-mono">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                    aria-label="Remove resume"
                    className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <Upload size={18} />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-medium text-foreground">Drop your resume here</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">PDF or TXT · Max 5 MB</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </StaggerItem>

        {/* JD Input */}
        <StaggerItem>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Job description <span className="text-destructive">*</span>
            </p>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here — requirements, responsibilities, preferred skills..."
              rows={8}
              className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <p className="text-[11px] text-muted-foreground font-mono">{jdText.length} characters</p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Analyze Button */}
      <FadeIn delay={0.15}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
          <Button
            onClick={handleAnalyze}
            disabled={state === "uploading" || !resumeFile || jdText.trim().length < 50}
            className="h-10 px-6 text-[13px] font-medium gap-2 shadow-sm shadow-primary/20"
          >
            <BarChart3 size={14} /> Analyze resume
          </Button>
          <p className="text-[12px] text-muted-foreground">
            {!resumeFile && "Upload resume · "}
            {jdText.trim().length < 50 && "Add job description · "}
            Powered by PrepView AI
          </p>
        </div>
      </FadeIn>

    </div>
  );
}
