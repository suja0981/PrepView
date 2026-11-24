/**
 * AppRoutesCON.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all client-side route paths.
 * Never hardcode route strings directly in components — always import from here.
 *
 * Usage:
 *   import AppRoutesCON from "@/constants/AppRoutesCON";
 *   navigate(AppRoutesCON.DASHBOARD);
 *   <Link to={AppRoutesCON.INTERVIEW_SESSION(id)}>...</Link>
 */
export default class AppRoutesCON {
  // ── Public routes ──────────────────────────────────────────────────────────
  public static readonly LANDING = "/" as const;

  // ── Auth routes ───────────────────────────────────────────────────────────
  public static readonly LOGIN = "/login" as const;
  public static readonly REGISTER = "/register" as const;

  // ── App routes ────────────────────────────────────────────────────────────
  public static readonly DASHBOARD = "/dashboard" as const;

  // Practice hub
  public static readonly PRACTICE = "/interview/create" as const;
  public static readonly CREATE_TEXT_INTERVIEW = "/interview/text/create" as const;
  public static readonly CREATE_VOICE_INTERVIEW = "/interview/voice/create" as const;

  // Dynamic interview routes (functions for parameterised paths)
  public static readonly INTERVIEW_SESSION = (id: string): string =>
    `/interview/${id}`;
  public static readonly INTERVIEW_REPORT = (id: string): string =>
    `/interview/${id}/report`;

  // History
  public static readonly INTERVIEW_HISTORY = "/interviews" as const;

  // Tools
  public static readonly RESUME = "/resume" as const;

  // Payments
  public static readonly PRICING = "/pricing" as const;
  public static readonly PAYMENT_SUCCESS = "/payment/success" as const;
  public static readonly PAYMENT_CANCEL = "/payment/cancel" as const;

  // Profile (Phase 6)
  public static readonly PROFILE = "/profile" as const;

  // ── API redirect targets (used in axios interceptor) ──────────────────────
  public static readonly API_AUTH_GOOGLE = "/api/v1/auth/google" as const;
}
