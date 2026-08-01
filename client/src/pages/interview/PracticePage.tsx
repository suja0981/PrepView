import { Link } from "react-router-dom";
import { ArrowRight, Type, Mic, FileSearch, Sparkles } from "lucide-react";

const features = [
  {
    id: "text",
    href: "/interview/text/create",
    available: true,
    icon: Type,
    label: "Text Interview",
    tag: "Available",
    tagStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    desc: "Answer questions by typing at your own pace. Great for practicing structured responses and technical explanations.",
    bullets: [
      "Type detailed, well-structured answers",
      "AI scores every response individually",
      "Full report with strengths & improvements",
    ],
    cta: "Start text interview",
    ctaStyle: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    id: "voice",
    href: "/interview/voice/create",
    available: true,
    icon: Mic,
    label: "Voice Interview",
    tag: "Available",
    tagStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    desc: "Speak your answers aloud just like a real interview. AI listens, evaluates each answer, and gives detailed feedback.",
    bullets: [
      "Real-time speech-to-text transcription",
      "AI feedback panel after every answer",
      "Targeted follow-up on weak responses",
    ],
    cta: "Start voice interview",
    ctaStyle: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
];

const tools = [
  {
    href: "/resume",
    icon: FileSearch,
    label: "Resume Analyzer",
    desc: "Upload your resume and a job description. Get a gap analysis, match score, and tailored recommendations.",
    available: true,
  },
];

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 space-y-12">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground mb-4">
          <Sparkles size={11} className="text-primary" />
          Powered by AI
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Practice hub</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Choose how you want to prepare. Every session is tailored to your role, company, and difficulty level.
        </p>
      </div>

      {/* Interview modes */}
      <section className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Mock Interview
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ id, href, available, icon: Icon, label, tag, tagStyle, desc, bullets, cta, ctaStyle }) => (
            <div
              key={id}
              className={`group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200 ${
                available
                  ? "border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                  : "border-border opacity-70"
              }`}
            >
              {/* Card header */}
              <div className="p-6 pb-0 flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                  available ? "border-primary/20 bg-primary/10" : "border-border bg-secondary"
                }`}>
                  <Icon size={18} className={available ? "text-primary" : "text-muted-foreground"} />
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tagStyle}`}>
                  {tag}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{label}</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>

                <ul className="space-y-1.5">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${available ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                {available ? (
                  <Link
                    to={href}
                    className={`flex items-center justify-center gap-2 w-full rounded-lg h-9 text-[13px] font-medium transition-colors ${ctaStyle}`}
                  >
                    {cta}
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    disabled
                    className={`flex items-center justify-center gap-2 w-full rounded-lg h-9 text-[13px] font-medium ${ctaStyle}`}
                  >
                    {cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          AI Tools
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              to={href}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <Icon size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <ArrowRight size={14} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
