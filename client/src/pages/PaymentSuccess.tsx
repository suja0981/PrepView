import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Shown after Stripe redirects back to the app on successful payment.
 * The plan may not be updated yet (webhook is async), so we show a
 * friendly "activating" message for a few seconds before showing the CTA.
 */
export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isActivating, setIsActivating] = useState(true);

  useEffect(() => {
    // Give the Stripe webhook ~3s to fire and update the user plan
    const timer = setTimeout(() => setIsActivating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
      <div className="mx-auto max-w-md text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment successful!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome to PrepView Premium. Your account is being upgraded now.
          </p>
        </div>

        {/* Activating indicator */}
        {isActivating ? (
          <div className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Activating your Premium account...
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-muted-foreground">
              Your Premium plan is now active. Voice interviews, DSA, System Design, and unlimited sessions are all unlocked.
            </p>
            <Button asChild className="gap-1.5">
              <Link to="/interview/create">
                Start practising <ArrowRight size={13} />
              </Link>
            </Button>
          </div>
        )}

        {sessionId && (
          <p className="text-[11px] text-muted-foreground/50">Session: {sessionId.slice(0, 20)}...</p>
        )}
      </div>
    </div>
  );
}
