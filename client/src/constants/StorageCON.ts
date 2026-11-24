/**
 * StorageCON.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All browser storage key strings in one place.
 * Keys MUST be in ALL_CAPS. Never hardcode these strings in components.
 *
 * Note: PrepView uses httpOnly cookies for JWT auth (server-managed).
 * This file is for client-side preferences only (theme, etc.)
 *
 * Usage:
 *   import StorageCON from "@/constants/StorageCON";
 *   localStorage.setItem(StorageCON.THEME, "dark");
 */
export default class StorageCON {
  // ── Theme preference (ThemeContext) ────────────────────────────────────────
  public static readonly THEME = "PREPVIEW_THEME" as const;

  // ── Interview session recovery (Phase 4) ───────────────────────────────────
  // Stores the last active interviewId so user can resume after refresh
  public static readonly LAST_INTERVIEW_ID = "PREPVIEW_LAST_INTERVIEW_ID" as const;
}
