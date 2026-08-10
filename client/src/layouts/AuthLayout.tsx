import { Outlet } from "react-router-dom";
import { Mic, BarChart3, FileText, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/* ─── Rotating feature showcase for the left panel ──────────────────────── */

const showcaseItems = [
  {
    icon: Mic,
    title: "Voice Interviews",
    desc: "Speak your answers naturally. AI listens, evaluates in real-time, and adapts follow-up questions based on weak spots.",
    stat: "10 questions",
    statLabel: "per session",
  },
  {
    icon: BarChart3,
    title: "Performance Reports",
    desc: "Get a full breakdown of technical depth, communication clarity, and problem-solving approach after every session.",
    stat: "4 dimensions",
    statLabel: "scored per answer",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    desc: "Upload your resume against a job description. AI identifies skill gaps, ATS compatibility, and missing keywords.",
    stat: "ATS score",
    statLabel: "with suggestions",
  },
  {
    icon: MessageSquare,
    title: "Per-Answer Feedback",
    desc: "Each answer scored individually on Technical, Communication, and Reasoning. See exactly what a stronger answer looks like.",
    stat: "Instant",
    statLabel: "AI feedback",
  },
];

function FeatureShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % showcaseItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const item = showcaseItems[index];
  const Icon = item.icon;

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-4"
        >
          {/* Feature card */}
          <div className="rounded-xl border border-border bg-background/50 p-5 space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
            {/* Stat badge */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-base font-bold text-foreground font-mono">{item.stat}</span>
              <span className="text-[11px] text-muted-foreground">{item.statLabel}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {showcaseItems.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? "w-5 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Auth Layout ────────────────────────────────────────────────────────── */

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding panel with rotating showcase */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between border-r border-border bg-card p-8 xl:p-10">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">P</span>
          <span className="text-[15px] font-semibold tracking-tight">PrepView</span>
        </div>

        <div className="space-y-6 max-w-md">
          <div>
            <p className="text-[24px] xl:text-[28px] font-semibold leading-tight tracking-tight text-foreground">
              Practice interviews with AI that actually helps you improve.
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
              Adaptive questions, real-time evaluation, and honest performance feedback.
            </p>
          </div>
          <FeatureShowcase />
        </div>

        <p className="text-[12px] text-muted-foreground/50">
          © {new Date().getFullYear()} PrepView
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">P</span>
          <span className="text-[15px] font-semibold tracking-tight">PrepView</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
