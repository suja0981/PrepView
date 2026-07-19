import { Link } from "react-router-dom";
import {
  Mic,
  BarChart3,
  MessageSquare,
  FileText,
  Map,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import LandingNav from "@/components/LandingNav";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Mic,
    title: "Voice Mock Interviews",
    desc: "Conduct full interviews by voice. The AI asks questions, listens to your responses, and follows up — just like a real interviewer.",
  },
  {
    icon: BarChart3,
    title: "Performance Reports",
    desc: "After every session, get a detailed breakdown of your technical depth, communication clarity, and problem-solving approach.",
  },
  {
    icon: MessageSquare,
    title: "Per-Answer Feedback",
    desc: "Each answer is scored individually. See exactly where you lost marks and what a stronger answer would look like.",
  },
  {
    icon: FileText,
    title: "Resume Gap Analysis",
    desc: "Upload your resume and a target role. AI identifies the gaps between your experience and what the role actually needs.",
    badge: "Soon",
  },
  {
    icon: Map,
    title: "Learning Roadmaps",
    desc: "Get a structured study plan for any role — ordered by priority, with resources and a completion tracker.",
    badge: "Soon",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    desc: "Track how your scores evolve across sessions. See weak topics shrink over time as you practice.",
    badge: "Soon",
  },
];

const steps = [
  {
    number: "01",
    title: "Create an interview",
    desc: "Pick a role, company, difficulty, and interview type. Takes under 30 seconds.",
  },
  {
    number: "02",
    title: "Answer by voice",
    desc: "The AI reads each question aloud. You respond naturally. No typing, no scripts.",
  },
  {
    number: "03",
    title: "Get your report",
    desc: "Receive a full performance report with scores, strengths, weaknesses, and detailed per-answer feedback.",
  },
];

const testimonials = [
  {
    quote: "I went from freezing up on technical questions to confidently explaining my thought process. PrepView made the difference.",
    name: "Arjun Mehta",
    role: "Software Engineer · Got hired at Razorpay",
  },
  {
    quote: "The per-answer feedback is brutally honest in the best way. I didn't realize how vague my answers were until I saw the scores.",
    name: "Priya Sharma",
    role: "Product Manager · Placed at Zepto",
  },
  {
    quote: "Three sessions before my Google interview. I noticed my communication score jump from 4/10 to 8/10. That practice was everything.",
    name: "Rohan Kapoor",
    role: "Backend Developer · Google L4",
  },
];

const faqs = [
  {
    q: "Is PrepView free?",
    a: "Yes, PrepView is free to use during our early access period. You can run as many interviews as you want.",
  },
  {
    q: "What types of interviews does it support?",
    a: "Currently Technical and Behavioral interviews. System Design and Coding interviews are coming soon.",
  },
  {
    q: "How realistic are the AI questions?",
    a: "Questions are generated fresh every session using Gemini AI, tailored to your role, company, and difficulty level — not a static bank.",
  },
  {
    q: "Do I need any special hardware?",
    a: "Just a laptop or desktop with a working microphone and Chrome or Edge browser. No downloads or extensions needed.",
  },
  {
    q: "Can I practice for a specific company?",
    a: "Yes. Entering a company name when creating an interview tells the AI to tailor questions to that company's known interview style.",
  },
];

/* ─── Components ─────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-[12px] text-muted-foreground mb-8">
          <Zap size={11} className="text-primary" />
          Powered by Gemini AI
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-semibold tracking-tight leading-[1.1] max-w-3xl mx-auto">
          The smartest way to prepare for your next interview.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Practice with an AI interviewer that adapts to your answers, evaluates every response, and gives you honest feedback — so you walk into the real thing ready.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start practicing free
            <ArrowRight size={15} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-4 text-[12px] text-muted-foreground">
          No credit card. No setup. Ready in 30 seconds.
        </p>

        {/* Hero visual — mock interview UI */}
        <div className="mt-16 mx-auto max-w-2xl rounded-xl border border-border bg-card overflow-hidden shadow-xl">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 border-b border-border bg-secondary/50 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-border" />
            <div className="h-2.5 w-2.5 rounded-full bg-border" />
            <div className="h-2.5 w-2.5 rounded-full bg-border" />
            <div className="ml-3 h-5 flex-1 max-w-[200px] rounded-sm bg-border/60" />
          </div>

          {/* Mock interview content */}
          <div className="p-6 space-y-4 text-left">
            {/* Status bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[12px] text-muted-foreground">Listening</span>
              </div>
              <span className="font-mono text-[12px] text-muted-foreground tabular-nums">02:34</span>
            </div>

            {/* Question card */}
            <div className="rounded-lg border border-border bg-background overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Question 2</span>
                <span className="text-[11px] text-muted-foreground">System Design</span>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-sm text-foreground leading-relaxed">
                  How would you design a URL shortening service that handles 100 million requests per day? Walk me through your approach.
                </p>
              </div>
            </div>

            {/* Transcript preview */}
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Your response</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                "I'd start by breaking down the requirements. We need a hash function to generate short keys, a database to store mappings, and a caching layer for hot URLs..."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ────────────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {[
            { icon: Shield, text: "No account required to try" },
            { icon: Zap, text: "Instant AI feedback" },
            { icon: Clock, text: "Sessions under 20 minutes" },
            { icon: CheckCircle, text: "Free during early access" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Icon size={14} className="shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <SectionLabel>Features</SectionLabel>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
            Everything you need to prepare well.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            PrepView is built around the full preparation loop — not just mock interviews, but understanding where you are and what to work on next.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc, badge }) => (
            <div
              key={title}
              className="relative rounded-lg border border-border bg-card p-6 transition-colors hover:bg-secondary/30"
            >
              {badge && (
                <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                  {badge}
                </span>
              )}
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary">
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center mb-14">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              From setup to feedback in minutes.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map(({ number, title, desc }, i) => (
              <div key={number} className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] font-mono font-semibold tracking-widest text-muted-foreground/50">
                    {number}
                  </span>
                  {i < steps.length - 1 && (
                    <div className="hidden sm:block flex-1 h-px bg-border" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <SectionLabel>Testimonials</SectionLabel>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
            People who used it. Got the job.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {testimonials.map(({ quote, name, role }) => (
            <div key={name} className="rounded-lg border border-border bg-card p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-foreground text-foreground" />
                ))}
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">"{quote}"</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[13px] font-medium text-foreground">{name}</p>
                <p className="text-[11px] text-muted-foreground">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center mb-14">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Common questions.
            </h2>
          </div>

          <div className="space-y-0 divide-y divide-border rounded-lg border border-border bg-card overflow-hidden">
            {faqs.map(({ q, a }) => (
              <div key={q} className="px-6 py-5">
                <p className="text-sm font-medium text-foreground">{q}</p>
                <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="rounded-xl border border-border bg-card px-8 py-14 sm:py-20 text-center">
          <SectionLabel>Get started</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight max-w-lg mx-auto">
            Your next interview is already scheduled. Are you ready?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
            Create a free account and run your first mock interview in the next 5 minutes.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start for free
            <ArrowRight size={15} />
          </Link>
          <p className="mt-3 text-[12px] text-muted-foreground">
            No credit card required · Free during early access
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] font-medium text-foreground">PrepView</p>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
              Create account
            </Link>
          </div>

          <p className="text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} PrepView. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
