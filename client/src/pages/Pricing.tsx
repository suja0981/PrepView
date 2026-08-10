import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check, Zap, Loader2, ArrowRight, Crown,
  Mic, Binary, Server, Infinity, BookOpen, ChevronDown, ShieldCheck, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { createCheckoutSession, createPortalSession } from "@/api/payment.api";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const FREE_FEATURES = [
  { icon: BookOpen, text: "3 text interviews / month" },
  { icon: Check, text: "Technical & behavioral types" },
  { icon: Check, text: "AI feedback after each answer" },
  { icon: Check, text: "Full report with Q&A breakdown" },
  { icon: Check, text: "10 resume analyses / day" },
];

const PREMIUM_FEATURES = [
  { icon: Infinity, text: "Unlimited text interviews" },
  { icon: Mic, text: "Voice interviews (speech-to-text)" },
  { icon: Binary, text: "DSA interviews (with complexity grading)" },
  { icon: Server, text: "System design interviews" },
  { icon: Zap, text: "Hard difficulty mode" },
  { icon: Check, text: "Unlimited resume analyses" },
  { icon: Check, text: "AI feedback after every answer" },
  { icon: Check, text: "Full report with per-question scores" },
  { icon: Check, text: "All interview history" },
];

const PRICING_FAQS = [
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel your subscription at any time directly through the Stripe customer portal with a single click. You will retain access until the end of your billing cycle.",
  },
  {
    q: "How does the 3 free interviews limit work?",
    a: "Free users get 3 full text interview sessions every month. Your quota resets automatically on the first day of each calendar month.",
  },
  {
    q: "Is payment information securely handled?",
    a: "All payment processing is handled by Stripe. PrepView does not store or process your credit card details.",
  },
];

export default function Pricing() {
  const { user } = useAuthContext();
  const isPremium = user?.plan === "premium";
  const [isLoading, setIsLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await createCheckoutSession();
      window.location.href = res.data.data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to start checkout");
      setIsLoading(false);
    }
  };

  const handleManage = async () => {
    setIsPortalLoading(true);
    try {
      const res = await createPortalSession();
      window.location.href = res.data.data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to open billing portal");
      setIsPortalLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16 space-y-12">

      {/* Header */}
      <FadeIn>
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <Crown size={11} className="text-amber-500" />
            PrepView Premium
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Level up your prep
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Get unlimited interviews, voice mode, and every AI tool — for less than a coffee a week.
          </p>
        </div>
      </FadeIn>

      {/* Plan Cards */}
      <StaggerContainer stagger={0.1} className="grid gap-6 sm:grid-cols-2">

        {/* Free Card */}
        <StaggerItem>
          <div className={`relative flex flex-col rounded-2xl border bg-card p-6 space-y-5 transition-all ${!isPremium ? "border-border" : "border-border/60 opacity-60"}`}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight font-mono">$0</span>
                <span className="text-sm text-muted-foreground mb-1">/month</span>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">Get started with basic practice</p>
            </div>

            <ul className="space-y-3 flex-1">
              {FREE_FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                  <Icon size={14} className="text-muted-foreground/60 shrink-0 mt-0.5" />
                  {text}
                </li>
              ))}
            </ul>

            <div className="pt-2">
              {!isPremium ? (
                <div className="flex items-center justify-center rounded-lg border border-border bg-secondary h-9 text-[13px] font-medium text-muted-foreground">
                  Current plan
                </div>
              ) : (
                <Link to="/interview/create" className="flex items-center justify-center rounded-lg border border-border bg-secondary h-9 text-[13px] font-medium text-muted-foreground hover:bg-secondary/80 transition-colors">
                  Start practising
                </Link>
              )}
            </div>
          </div>
        </StaggerItem>

        {/* Premium Card */}
        <StaggerItem>
          <div className={`relative flex flex-col rounded-2xl border-2 bg-card p-6 space-y-5 transition-all shadow-xl ${isPremium ? "border-amber-500/50 shadow-amber-500/5" : "border-primary shadow-primary/10"}`}>

            {/* Badges */}
            {!isPremium && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
                  <Zap size={10} /> Most popular
                </span>
              </div>
            )}
            {isPremium && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                  <Crown size={10} /> Your plan
                </span>
              </div>
            )}

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">Premium</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight font-mono">$9</span>
                <span className="text-sm text-muted-foreground mb-1">/month</span>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">Unlimited access to all features</p>
            </div>

            <ul className="space-y-3 flex-1">
              {PREMIUM_FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-[13px] text-foreground">
                  <Icon size={14} className="text-primary shrink-0 mt-0.5" />
                  {text}
                </li>
              ))}
            </ul>

            <div className="pt-2">
              {isPremium ? (
                <div className="space-y-2">
                  {user?.planExpiresAt && (
                    <p className="text-center text-[12px] text-muted-foreground font-mono">
                      Renews {new Date(user.planExpiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                  <Button
                    onClick={handleManage}
                    disabled={isPortalLoading}
                    variant="outline"
                    className="w-full h-9 text-[13px] font-medium"
                  >
                    {isPortalLoading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                    Manage subscription
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full h-9 text-[13px] font-medium gap-1.5 shadow-sm shadow-primary/20"
                >
                  {isLoading
                    ? <><Loader2 size={14} className="animate-spin" /> Redirecting to Stripe...</>
                    : <>Upgrade now <ArrowRight size={13} /></>
                  }
                </Button>
              )}
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Trust Badges */}
      <FadeIn delay={0.2}>
        <div className="flex flex-wrap justify-center gap-6 text-[12px] text-muted-foreground pt-2">
          <span className="flex items-center gap-1.5"><RefreshCw size={12} className="text-emerald-500" /> Cancel anytime</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500" /> Secure payments via Stripe</span>
          <span className="flex items-center gap-1.5"><Zap size={12} className="text-emerald-500" /> Instant activation</span>
        </div>
      </FadeIn>

      {/* Pricing FAQ Accordion */}
      <FadeIn delay={0.25}>
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h2 className="text-base font-semibold text-center tracking-tight">Frequently asked questions</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {PRICING_FAQS.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div key={i} className="border-b border-border last:border-b-0">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left text-[13px] font-medium text-foreground hover:bg-secondary/30 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-3.5 text-[12.5px] text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </FadeIn>

    </div>
  );
}
