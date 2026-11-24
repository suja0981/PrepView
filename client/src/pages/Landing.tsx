import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mic, BarChart3, MessageSquare, FileText, Map,
  ArrowRight, ChevronDown, Check, Crown,
  Brain, Terminal, ShieldCheck,
} from "lucide-react";
import LandingNav from "@/components/LandingNav";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

/* ─── Interactive Demo Data ─────────────────────────────────────────────── */

interface DemoSample {
  id: string;
  label: string;
  difficulty: string;
  question: string;
  transcript: string;
  wordCount: number;
  duration: string;
  scores: {
    technical: number;
    reasoning: number;
    communication: number;
  };
  feedback: string;
}

const DEMO_SAMPLES: DemoSample[] = [
  {
    id: "system-design",
    label: "System Design",
    difficulty: "Medium",
    question: "Design a distributed rate limiter that handles 50k requests/second per region with minimal latency overhead.",
    transcript:
      "I'd place an API gateway layer backed by Redis using a Sliding Window Counter or Token Bucket via atomic Lua scripts to avoid race conditions, falling back to local memory if Redis partitions...",
    wordCount: 31,
    duration: "02:14",
    scores: { technical: 88, reasoning: 84, communication: 80 },
    feedback: "Strong grasp of Redis Lua atomicity and fail-open fallback. Discussing consistent hashing across Redis shards would raise technical depth further.",
  },
  {
    id: "backend",
    label: "Technical",
    difficulty: "Hard",
    question: "How does Node.js handle I/O concurrency on a single thread, and when would you offload work to Worker Threads?",
    transcript:
      "The V8 main thread delegates async I/O operations to libuv's thread pool and OS kernel selectors like epoll or kqueue. CPU-bound tasks like crypto hashing or image resizing block the event loop and belong in Worker Threads...",
    wordCount: 36,
    duration: "01:48",
    scores: { technical: 92, reasoning: 86, communication: 88 },
    feedback: "Accurate distinction between kernel non-blocking I/O and libuv's default 4-thread pool. Clear explanation of event loop starvation.",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    difficulty: "Medium",
    question: "Tell me about a time you pushed back on a technical decision or architectural shortcut under a tight deadline.",
    transcript:
      "Situation: Before a major release, our team planned to skip idempotency keys on payment webhooks. I demonstrated duplicate-charge risks in staging, proposed a 2-hour Redis lock mitigation, and got buy-in from engineering and product...",
    wordCount: 34,
    duration: "02:05",
    scores: { technical: 80, reasoning: 85, communication: 90 },
    feedback: "Well-structured STAR response with quantifiable engineering impact. Highlighting post-launch reliability metrics would make the Result even sharper.",
  },
];

const features = [
  {
    icon: Mic,
    title: "Voice & Text Modes",
    desc: "Speak answers aloud with Whisper transcription and real WPM delivery tracking, or type structured technical responses.",
  },
  {
    icon: Brain,
    title: "Adaptive Follow-Ups",
    desc: "When an answer is shallow or misses edge cases, the interviewer probes deeper with targeted follow-up questions.",
  },
  {
    icon: BarChart3,
    title: "70B Evaluation Grading",
    desc: "Fast 8B prompts keep sessions snappy while 70B models grade technical accuracy, reasoning, and communication.",
  },
  {
    icon: FileText,
    title: "ATS Resume Analyzer",
    desc: "Score your resume deterministically against target job descriptions to spot missing keywords and weak bullet points.",
  },
  {
    icon: Terminal,
    title: "250+ Curated Question Bank",
    desc: "Tag-indexed questions across Frontend, Backend, Fullstack, DevOps, Behavioral, and System Design.",
  },
  {
    icon: Map,
    title: "Weak Topic Tracking",
    desc: "Aggregate analytics surface recurring gaps across your completed interviews and recommend targeted practice.",
  },
];

const steps = [
  {
    number: "01",
    title: "Configure your session",
    desc: "Select role, target company, difficulty, and interview format in under 30 seconds.",
  },
  {
    number: "02",
    title: "Complete 10-question round",
    desc: "Respond by voice or text. Sessions persist automatically so you can pause or resume anytime.",
  },
  {
    number: "03",
    title: "Inspect & share your report",
    desc: "Review per-question score breakdowns, optimal answers, export to PDF, or share a verified public link.",
  },
];

const faqs = [
  {
    q: "What is included in the Free plan?",
    a: "Free accounts include 3 full text interviews per month (Technical and Behavioral), AI feedback after every answer, resume analysis, and full performance reports.",
  },
  {
    q: "What formats does PrepView support?",
    a: "Technical, Behavioral, DSA (with complexity analysis), System Design, and Mixed interviews — optionally tailored to specific target companies.",
  },
  {
    q: "How are questions selected and evaluated?",
    a: "PrepView pairs a curated 250+ tag-based question bank with fast LLM generation to avoid duplicates, then grades answers using a 70B reasoning model.",
  },
  {
    q: "Can I pause or refresh mid-interview?",
    a: "Yes. Every question and answer is persisted immediately to your session history so refreshing or resuming later picks up right where you left off.",
  },
  {
    q: "Can I cancel my Premium subscription anytime?",
    a: "Yes. You can cancel directly from the Pricing page at any time with a single click.",
  },
];

/* ─── FAQ Accordion Item ─────────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-[13px] text-muted-foreground leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function Landing() {
  const [activeDemoId, setActiveDemoId] = useState<string>(DEMO_SAMPLES[0].id);
  const activeDemo = DEMO_SAMPLES.find((d) => d.id === activeDemoId) ?? DEMO_SAMPLES[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      {/* ── Hero + Interactive Product Cockpit ───────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="text-center max-w-2xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
              <Terminal size={12} className="text-primary" />
              <span>AI Technical Interview Simulator</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-foreground">
              Practice engineering interviews with real-time AI grading.
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-4 text-[15px] sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Adaptive engineering interviews with real-time grading and weak-topic analytics.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.985]"
              >
                <span>Start practicing free</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              3 free text sessions monthly with instant AI grading.
            </p>
          </FadeIn>
        </div>

        {/* Interactive Product Demo Cockpit */}
        <FadeIn delay={0.22}>
          <div className="mt-12 mx-auto max-w-3xl rounded-xl border border-border bg-card overflow-hidden">
            {/* Mode Switcher Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
              <div className="flex items-center gap-1" role="tablist" aria-label="Interview sample modes">
                {DEMO_SAMPLES.map((sample) => {
                  const selected = sample.id === activeDemo.id;
                  return (
                    <button
                      key={sample.id}
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveDemoId(sample.id)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {sample.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                <span>Q02 / 10</span>
                <span className="text-border">|</span>
                <span>{activeDemo.duration}</span>
              </div>
            </div>

            {/* Interactive Preview Body */}
            <div className="p-5 sm:p-6 space-y-4 text-left">
              {/* Question Block */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
                    {activeDemo.label}
                  </span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {activeDemo.difficulty}
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] font-medium text-foreground leading-relaxed">
                  {activeDemo.question}
                </p>
              </div>

              {/* Recorded Response */}
              <div className="rounded-lg border border-border bg-background/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Candidate Response</span>
                  <span className="text-emerald-500 font-medium tabular-nums">{activeDemo.wordCount} words</span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  "{activeDemo.transcript}"
                </p>
              </div>

              {/* Evaluation Output Bar */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-xs text-muted-foreground">Technical</span>
                    <span className="font-mono text-sm font-semibold text-emerald-500">
                      {activeDemo.scores.technical}%
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-xs text-muted-foreground">Reasoning</span>
                    <span className="font-mono text-sm font-semibold text-primary">
                      {activeDemo.scores.reasoning}%
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-xs text-muted-foreground">Communication</span>
                    <span className="font-mono text-sm font-semibold text-emerald-500">
                      {activeDemo.scores.communication}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground border-t border-border pt-2.5 leading-relaxed">
                  <span className="font-medium text-foreground">AI Critique: </span>
                  {activeDemo.feedback}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────── */}
      <section id="features" className="border-t border-border bg-secondary/15 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <FadeIn>
            <div className="max-w-xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Built around the real engineering interview loop.
              </h2>
              <p className="mt-2.5 text-sm text-muted-foreground">
                Every session combines structured question selection, live evaluation, and persistent analytics.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer stagger={0.05} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/80">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                    <Icon size={15} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <FadeIn>
            <div className="max-w-xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                From setup to scored report in minutes.
              </h2>
            </div>
          </FadeIn>

          <StaggerContainer stagger={0.08} className="grid gap-8 sm:grid-cols-3">
            {steps.map(({ number, title, desc }) => (
              <StaggerItem key={number}>
                <div className="space-y-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary">
                    {number}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-border bg-secondary/15 scroll-mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 sm:py-24">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Transparent pricing for individual prep.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with 3 free sessions monthly. Upgrade anytime for unlimited practice and voice mode.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Free */}
              <div className="flex flex-col rounded-xl border border-border bg-card p-6 space-y-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Free Tier</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-3xl font-bold tracking-tight">$0</span>
                    <span className="text-xs text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {[
                    "3 text interviews per month",
                    "Technical & Behavioral formats",
                    "AI feedback after every answer",
                    "10 ATS resume checks per day",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                      <Check size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="flex items-center justify-center rounded-lg border border-border bg-secondary/50 h-9 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Create free account
                </Link>
              </div>

              {/* Premium */}
              <div className="flex flex-col rounded-xl border-2 border-primary bg-card p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-primary">Premium</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-mono text-3xl font-bold tracking-tight">$9</span>
                      <span className="text-xs text-muted-foreground">/month</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <Crown size={11} /> Full Access
                  </span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {[
                    "Unlimited text & voice interviews",
                    "DSA (with complexity analysis) & System Design",
                    "Hard difficulty & company tailoring",
                    "Unlimited ATS resume evaluations",
                    "Verified shareable performance reports",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[13px] text-foreground">
                      <Check size={14} className="text-primary shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-primary h-9 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <span>Start with Premium</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20 sm:py-24">
        <FadeIn>
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {faqs.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 sm:pb-24">
        <FadeIn>
          <div className="rounded-xl border border-border bg-card px-6 py-12 sm:py-16 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 mb-3">
              <ShieldCheck size={14} />
              <span>Ready in 30 seconds</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight max-w-lg mx-auto">
              Run your first mock interview today.
            </h2>
            <p className="mt-2.5 text-sm text-muted-foreground max-w-md mx-auto">
              Create a free account with email or Google and review your first scored breakdown in minutes.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.985]"
            >
              <span>Create free account</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">P</span>
              <span className="text-[13px] font-semibold text-foreground">PrepView</span>
            </div>

            <nav className="flex items-center gap-6" aria-label="Footer navigation">
              <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
              <Link to="/register" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Register</Link>
              <Link to="/pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </nav>

            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} PrepView
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
