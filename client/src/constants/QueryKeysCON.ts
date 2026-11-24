/**
 * QueryKeysCON.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all TanStack Query cache keys.
 * Centralising keys prevents cache invalidation bugs from key typos.
 *
 * Usage:
 *   import QueryKeysCON from "@/constants/QueryKeysCON";
 *   useQuery({ queryKey: QueryKeysCON.DASHBOARD, ... });
 *   queryClient.invalidateQueries({ queryKey: QueryKeysCON.CURRENT_USER });
 */
export default class QueryKeysCON {
  // ── Auth ──────────────────────────────────────────────────────────────────
  public static readonly CURRENT_USER = ["currentUser"] as const;

  // ── Dashboard ─────────────────────────────────────────────────────────────
  public static readonly DASHBOARD = ["dashboard"] as const;

  // ── Interviews ────────────────────────────────────────────────────────────
  /** All interviews for the current user */
  public static readonly INTERVIEWS = ["interviews"] as const;

  /** Single interview session (current question included) */
  public static readonly INTERVIEW = (id: string) =>
    ["interview", id] as const;

  /** Full Q&A + evaluations + report for the report page */
  public static readonly INTERVIEW_DETAILS = (id: string) =>
    ["interview-details", id] as const;

  /** Final report (scores + narrative) */
  public static readonly INTERVIEW_REPORT = (id: string) =>
    ["interview-report", id] as const;

  // ── Resume ────────────────────────────────────────────────────────────────
  // Resume analysis is a one-shot mutation, no persistent cache needed.

  // ── User / Profile ────────────────────────────────────────────────────────
  public static readonly USER_PROFILE = ["userProfile"] as const;
}
