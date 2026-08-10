import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mic, BarChart3, MessageSquare, FileText, Map,
  ArrowRight, Star, ChevronDown, Check, Crown,
  Zap, Shield, Clock, Brain,
} from "lucide-react";
import LandingNav from "@/components/LandingNav";
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Mic,
    title: "Voice & Text Interviews",
    desc: "Full mock interviews by voice or text. The AI adapts follow-up questions based on weak answers.",
  },
  {
    icon: BarChart3,
    title: "Performance Reports",
    desc: "Detailed breakdown of technical depth, communication clarity, and problem-solving after every session.",
  },
  {
    icon: MessageSquare,
    title: "Per-Answer Feedback",
    desc: "Each answer scored individually. See exactly where you lost marks and what a stronger answer looks like.",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    desc: "Upload your resume against a job description. AI identifies skill gaps, ATS score, and missing keywords.",
  },
  {
    icon: Brain,
    title: "5 Interview Types",
    desc: "Technical, Behavioral, DSA, System Design, or Mixed — each with company-specific question tailoring.",
  },
  {
    icon: Map,
    title: "Progress Tracking",
    desc: "Track scores across sessions. See weak topics shrink over time as you practice consistently.",
  },
];

const steps = [
  {
    number: "01",
    title: "Configure your session",
    desc: "Pick a role, company, difficulty, and interview type. Takes under 30 seconds.",
  },
  {
    number: "02",
    title: "Answer questions",
    desc: "Respond by voice or text. AI evaluates each answer in real-time and adapts the next question.",
  },
  {
    number: "03",
    title: "Review your report",
    desc: "Get a full performance breakdown with per-question scores, strengths, and areas to improve.",
  },
];

const testimonials = [
  {
    quote: "I went from freezing up on technical questions to confidently explaining my thought process. PrepView made the difference.",
    name: "Arjun Mehta",
    role: "Software Engineer · Razorpay",
  },
  {
    quote: "The per-answer feedback is brutally honest in the best way. I didn't realize how vague my answers were until I saw the scores.",
    name: "Priya Sharma",
    role: "Product Manager · Zepto",
  },
  {
    quote: "Three sessions before my Google interview. My communication score jumped from 4/10 to 8/10. That practice was everything.",
    name: "Rohan Kapoor",
    role: "Backend Developer · Google L4",
  },
];

const faqs = [
  {
    q: "Is PrepView free?",
    a: "The Free plan gives you 3 text interviews per month with AI feedback. Premium unlocks voice mode, DSA, System Design, unlimited interviews, and more for $9/month.",
  },
  {
    q: "What types of interviews does it support?",
    a: "Technical, Behavioral, DSA, System Design, and Mixed. Each can be targeted to a specific company's interview style.",
  },
  {
    q: "How realistic are the AI questions?",
    a: "Questions are generated fresh every session by AI, tailored to your role, company, and difficulty level — not a static question bank.",
  },
  {
    q: "Do I need any special hardware?",
    a: "Just a laptop or desktop with a working microphone and Chrome or Edge browser. No downloads or extensions needed.",
  },
  {
    q: "Can I cancel my Premium subscription anytime?",
    a: "Yes. You can cancel from your account at any time through the Stripe customer portal. No questions asked.",
  },
];

const companies = ["Google", "Amazon", "Microsoft", "Meta", "Stripe", "Razorpay"];

/* ─── FAQ Accordion Item ─────────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/30"
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
        <ScaleIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-[12px] text-muted-foreground mb-8">
            <Zap size={11} className="text-primary" />
            AI-powered mock interviews
          </div>
        </ScaleIn>

        <FadeIn delay={0.05}>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.08] max-w-2xl mx-auto">
            Practice interviews that
            <span className="text-primary"> actually prepare you.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.12}>
          <p className="mt-5 text-[15px] sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Adaptive AI questions, real-time evaluation on every answer, and honest performance reports — so you walk in ready.
          </p>
        </FadeIn>

        <FadeIn delay={0.18}>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Start practicing free
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/15 hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground/60">
            No credit card required
          </p>
        </FadeIn>

        {/* Hero product window — shows the actual interview UI */}
        <FadeIn delay={0.28}>
          <div className="mt-14 mx-auto max-w-2xl rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/30">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-border bg-secondary/40 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
              <div className="ml-3 h-4 flex-1 max-w-[180px] rounded bg-border/50" />
            </div>

            {/* Mock interview content */}
            <div className="p-5 sm:p-6 space-y-3.5 text-left">
              {/* Status bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[12px] text-muted-foreground">Listening</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">Question 2</span>
                  <span className="font-mono text-[12px] text-muted-foreground tabular-nums">02:34</span>
                </div>
              </div>

              {/* Question card */}
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">System Design</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Medium</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  How would you design a URL shortening service that handles 100 million requests per day? Walk me through your approach.
                </p>
              </div>

              {/* Transcript preview */}
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Transcript</p>
                  <span className="text-[11px] text-emerald-500 font-medium">42 words ✓</span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  "I'd start by breaking down the requirements. We need a hash function to generate short keys, a database to store mappings, and a caching layer for hot URLs..."
                </p>
              </div>

              {/* Score strip preview */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-2.5">
                <span className="text-[11px] text-muted-foreground">Previous answer:</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-semibold text-emerald-500 tabular-nums">Technical 80%</span>
                  <span className="h-3 w-px bg-border" />
                  <span className="text-[12px] font-semibold text-amber-500 tabular-nums">Communication 65%</span>
                  <span className="h-3 w-px bg-border" />
                  <span className="text-[12px] font-semibold text-primary tabular-nums">Reasoning 75%</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8">
              <span className="text-[12px] text-muted-foreground/60 uppercase tracking-wider font-medium shrink-0">
                Students preparing for
              </span>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {companies.map((name) => (
                  <span key={name} className="text-[13px] font-semibold text-muted-foreground/40 tracking-tight">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 scroll-mt-16">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Features
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Everything you need to prepare well.
            </h2>
            <p className="mt-2.5 text-[13px] text-muted-foreground max-w-md mx-auto">
              Built around the full preparation loop — practice, evaluate, improve, repeat.
            </p>
          </div>
        </FadeIn>

        <StaggerContainer stagger={0.06} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <StaggerItem key={title}>
              <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border/80 hover:bg-secondary/20 hover:shadow-sm">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon size={15} />
                </div>
                <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border bg-secondary/15 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                How it works
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
                From setup to feedback in minutes.
              </h2>
            </div>
          </FadeIn>

          <StaggerContainer stagger={0.1} className="grid gap-8 sm:grid-cols-3">
            {steps.map(({ number, title, desc }, i) => (
              <StaggerItem key={number}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary font-mono">
                      {number}
                    </span>
                    {i < steps.length - 1 && (
                      <div className="hidden sm:block flex-1 h-px bg-border" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Testimonials
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              People who used it. Got the job.
            </h2>
          </div>
        </FadeIn>

        <StaggerContainer stagger={0.08} className="grid gap-4 sm:grid-cols-3">
          {testimonials.map(({ quote, name, role }) => (
            <StaggerItem key={name}>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-foreground/80 text-foreground/80" />
                  ))}
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">"{quote}"</p>
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-[13px] font-medium text-foreground">{name}</p>
                  <p className="text-[11px] text-muted-foreground">{role}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── Pricing teaser ───────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-border bg-secondary/15 scroll-mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 sm:py-28">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Pricing
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
                Start free. Upgrade when ready.
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Free */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Free</p>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-3xl font-bold tracking-tight">$0</span>
                    <span className="text-sm text-muted-foreground mb-0.5">/month</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {["3 text interviews / month", "Technical & Behavioral types", "AI feedback on every answer", "Full performance reports"].map(t => (
                    <li key={t} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                      <Check size={13} className="text-muted-foreground/50 shrink-0 mt-0.5" />{t}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="flex items-center justify-center rounded-lg border border-border h-9 text-[13px] font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
                >
                  Get started free
                </Link>
              </div>

              {/* Premium */}
              <div className="relative rounded-xl border-2 border-primary/30 bg-card p-6 space-y-4 shadow-lg shadow-primary/5">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                    <Crown size={9} /> Popular
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Premium</p>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-3xl font-bold tracking-tight">$9</span>
                    <span className="text-sm text-muted-foreground mb-0.5">/month</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {["Unlimited interviews", "Voice interview mode", "DSA & System Design types", "Hard difficulty", "Unlimited resume analyses"].map(t => (
                    <li key={t} className="flex items-start gap-2 text-[13px] text-foreground">
                      <Check size={13} className="text-primary shrink-0 mt-0.5" />{t}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-primary h-9 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Start free trial <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20 sm:py-28">
        <FadeIn>
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              FAQ
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Common questions.
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {faqs.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 sm:pb-28">
        <FadeIn>
          <div className="rounded-2xl border border-border bg-card px-6 py-14 sm:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight max-w-md mx-auto">
              Your next interview is already scheduled. Are you ready?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
              Create a free account and run your first mock interview in the next 5 minutes.
            </p>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Start for free
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
              <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[9px] font-bold text-primary-foreground">P</span>
              <span className="text-[13px] font-semibold text-foreground">PrepView</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/login" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
              <Link to="/register" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Create account</Link>
              <Link to="/pricing" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </div>

            <p className="text-[12px] text-muted-foreground/50">
              © {new Date().getFullYear()} PrepView
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
