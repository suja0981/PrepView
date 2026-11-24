import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/context/AuthContext";
import { resendVerificationEmail } from "@/api/auth.api";

export default function EmailVerificationBanner() {
  const { user, refetchUser } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Check URL query parameters for verification status from backend redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verifiedStatus = params.get("verified");

    if (verifiedStatus === "true") {
      toast.success("Email verified successfully! Welcome to PrepView.", {
        icon: <CheckCircle2 className="text-emerald-500" size={18} />,
      });
      refetchUser();
      params.delete("verified");
      navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
    } else if (verifiedStatus === "failed") {
      toast.error("Email verification failed or link has expired. Please request a new link.", {
        icon: <AlertCircle className="text-destructive" size={18} />,
      });
      params.delete("verified");
      navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
    }
  }, [location.search, location.pathname, navigate, refetchUser]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Don't render banner if user is verified or logged in with Google (OAuth users are automatically verified)
  if (!user || user.isEmailVerified !== false || user.googleId) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    try {
      const res = await resendVerificationEmail();
      toast.success(res.message || "Verification email sent! Check your inbox.");
      setCooldown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend verification email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-amber-500 font-medium text-center sm:text-left">
          <Mail size={15} className="shrink-0" />
          <span>
            Please verify your email address (<strong>{user.email}</strong>) to secure your account and unlock all features.
          </span>
        </div>
        <button
          onClick={handleResend}
          disabled={isSending || cooldown > 0}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium text-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {isSending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : null}
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
}
