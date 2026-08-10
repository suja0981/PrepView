import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import {
  Loader2, ArrowLeft, Mic, Code2, Users, Server, Shuffle,
  Volume2, Crown, ArrowRight, Zap, Clock,
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInterviewSchema, type CreateInterviewSchema } from "@/schemas/interview.schema";
import { useCreateInterview } from "@/hooks/useInterview";
import { useAuthContext } from "@/context/AuthContext";

// ── Role presets — each maps to a structured interview config ──────────────────
const ROLE_PRESETS = [
  { label: "Frontend Dev",     role: "Frontend Software Engineer",     techStacks: "React, TypeScript, JavaScript, CSS, Browser APIs",       type: "technical" as const },
  { label: "Backend Dev",      role: "Backend Software Engineer",      techStacks: "Node.js, REST APIs, SQL, MongoDB, Redis, Docker",         type: "technical" as const },
  { label: "Fullstack Dev",    role: "Fullstack Software Engineer",    techStacks: "React, Node.js, TypeScript, PostgreSQL, REST APIs",       type: "technical" as const },
  { label: "Mobile Dev",       role: "Mobile Software Engineer",       techStacks: "React Native, Swift, Kotlin, State Management, REST",     type: "technical" as const },
  { label: "DevOps / SRE",     role: "DevOps / SRE Engineer",         techStacks: "Docker, Kubernetes, CI/CD, Terraform, Monitoring",        type: "technical" as const },
  { label: "QA / Automation",  role: "QA Automation Engineer",        techStacks: "Selenium, Cypress, Playwright, Jest, Test Strategy",      type: "technical" as const },
  { label: "Data Engineer",    role: "Data Engineer",                  techStacks: "Python, Spark, Airflow, Kafka, BigQuery, Snowflake",      type: "technical" as const },
  { label: "Data Analyst",     role: "Data Analyst",                   techStacks: "SQL, Python, Tableau, A/B Testing, Data Modelling",      type: "technical" as const },
  { label: "AI / ML Engineer", role: "ML Engineer",                    techStacks: "Python, PyTorch, scikit-learn, MLOps, Model Deployment", type: "technical" as const },
  { label: "System Design",    role: "Software Engineer",              techStacks: "",                                                        type: "system_design" as const },
  { label: "Behavioral",       role: "Software Engineer",              techStacks: "",                                                        type: "behavioral" as const },
  { label: "Custom",           role: "",                               techStacks: "",                                                        type: "technical" as const },
];

const difficulties = [
  { value: "easy",   label: "Easy",   desc: "0–1 yr · Fundamentals" },
  { value: "medium", label: "Medium", desc: "1–3 yr · Industry standard" },
  { value: "hard",   label: "Hard",   desc: "4+ yr · Senior level" },
] as const;

const types = [
  { value: "technical",      label: "Technical",      desc: "Concepts & real-world problems",  icon: Code2 },
  { value: "behavioral",     label: "Behavioral",     desc: "STAR format & soft skills",        icon: Users },
  { value: "system_design",  label: "System Design",  desc: "Architecture & trade-offs",        icon: Server },
  { value: "mixed",          label: "Mixed",          desc: "All domains combined",              icon: Shuffle },
] as const;

export default function CreateVoiceInterview() {
  const navigate = useNavigate();
  const mutation = useCreateInterview();
  const { user } = useAuthContext();
  const isPremium = user?.plan === "premium";
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const form = useForm<CreateInterviewSchema>({
    resolver: zodResolver(createInterviewSchema),
    defaultValues: {
      role: "",
      techStacks: "",
      difficulty: "medium",
      type: "technical",
      mode: "voice",
    },
  });

  function applyPreset(preset: typeof ROLE_PRESETS[number]) {
    setSelectedPreset(preset.label);
    form.setValue("role", preset.role);
    form.setValue("techStacks", preset.techStacks);
    form.setValue("type", preset.type);
  }

  async function onSubmit(values: CreateInterviewSchema) {
    try {
      const res = await mutation.mutateAsync({ ...values, mode: "voice" });
      toast.success("Voice interview session created");
      navigate(`/interview/${res.data.interview._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message ?? "Failed to create interview");
    }
  }

  const selectedDifficulty = form.watch("difficulty");
  const selectedType = form.watch("type");

  if (!isPremium) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
        <div className="mx-auto max-w-sm text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
              <Crown size={28} className="text-amber-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Voice Interview is Premium</h1>
            <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
              Voice interviews, System Design, and unlimited sessions are available on the Premium plan for $9/month.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="gap-1.5">
              <Link to="/pricing"><Crown size={13} /> View Premium plans <ArrowRight size={13} /></Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/interview/create"><ArrowLeft size={13} className="mr-1" /> Back to hub</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      <Link
        to="/interview/create"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={13} /> Back to Practice hub
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground mb-3">
          <Mic size={11} className="text-primary" /> Voice Interview
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Configure your session</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Speak your answers aloud. AI listens, evaluates, and gives targeted feedback in real time.
        </p>
      </div>

      {/* Mic notice */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3.5 mb-6">
        <Volume2 size={15} className="text-primary shrink-0 mt-0.5" />
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Microphone required.</span>{" "}
          Allow microphone access when prompted. Use Chrome or Edge for best results.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Role Presets */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Quick Start</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Pick a preset or configure manually below.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-all text-[12.5px] font-medium ${
                    selectedPreset === preset.label
                      ? "border-primary bg-primary/8 text-foreground ring-1 ring-primary/20"
                      : "border-border text-muted-foreground hover:border-border/60 hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <Zap size={11} className={selectedPreset === preset.label ? "text-primary" : "text-muted-foreground/50"} />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role & Tech Stacks */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Target Role</p>

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Role <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Backend Software Engineer" className="h-10 bg-background text-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="techStacks" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Tech Stack <span className="text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. React, Node.js, PostgreSQL" className="h-10 bg-background text-sm" {...field} />
                </FormControl>
                <p className="text-[12px] text-muted-foreground">Comma-separated. Questions will focus on these technologies.</p>
              </FormItem>
            )} />
          </div>

          {/* Interview Type */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Interview Type</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Weak answers trigger a targeted follow-up automatically.</p>
            </div>
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 gap-2.5">
                  {types.map(({ value, label, desc, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`flex flex-col items-start gap-1.5 rounded-lg border px-4 py-3 text-left transition-all ${
                        selectedType === value
                          ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                          : "border-border hover:border-border/60 hover:bg-secondary/50"
                      }`}
                    >
                      <Icon size={15} className={selectedType === value ? "text-primary" : "text-muted-foreground"} />
                      <span className={`text-[13px] font-semibold leading-tight ${selectedType === value ? "text-foreground" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-tight">{desc}</span>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Difficulty */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Difficulty</p>
            <FormField control={form.control} name="difficulty" render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-3 gap-3">
                  {difficulties.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-all ${
                        selectedDifficulty === value
                          ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                          : "border-border hover:border-border/60 hover:bg-secondary/50"
                      }`}
                    >
                      <span className={`text-[13px] font-semibold ${selectedDifficulty === value ? "text-foreground" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{desc}</span>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Summary + Submit */}
          <div className="rounded-xl border border-border bg-secondary/30 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
              <Clock size={13} />
              <span>
                <span className="text-foreground font-medium capitalize">
                  {types.find(t => t.value === selectedType)?.label} · {selectedDifficulty}
                </span>
                {" "}· Voice · 7–12 questions
              </span>
            </div>
            <Button type="submit" disabled={mutation.isPending} className="shrink-0 h-9 px-5 text-[13px] font-medium">
              {mutation.isPending
                ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Generating...</>
                : "Start session →"
              }
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
