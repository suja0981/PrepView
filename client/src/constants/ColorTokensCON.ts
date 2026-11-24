/**
 * ColorTokensCON.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Typed references to PrepView's Tailwind CSS design token classes.
 * Defined in `src/index.css` as CSS custom properties (oklch values).
 *
 * Rules:
 *  - Never hardcode hex/rgb/oklch color values in components.
 *  - Use these constants for DYNAMIC class selection (computed at runtime).
 *  - For static Tailwind classes in JSX, write them directly (e.g. "bg-primary").
 *  - To add a new color: (1) add to :root + .dark in index.css, (2) add here.
 *
 * Usage:
 *   import ColorTokensCON from "@/constants/ColorTokensCON";
 *
 *   // Dynamic score color
 *   const colorClass = ColorTokensCON.Score.text(score);
 *   <span className={colorClass}>...</span>
 *
 *   // Plan badge
 *   const bg = ColorTokensCON.Plan.badge(user.plan);
 */
export default class ColorTokensCON {
  // ── Text colors ───────────────────────────────────────────────────────────
  public static readonly TEXT = {
    FOREGROUND:         "text-foreground",
    MUTED:              "text-muted-foreground",
    PRIMARY:            "text-primary",
    DESTRUCTIVE:        "text-destructive",
    BRAND_VIOLET:       "text-brand-violet",
    BRAND_MINT:         "text-brand-mint",
    EMERALD:            "text-emerald-500",
    AMBER:              "text-amber-500",
    RED:                "text-red-400",
    AMBER_DARK:         "text-amber-600 dark:text-amber-400",
    EMERALD_DARK:       "text-emerald-600 dark:text-emerald-400",
  } as const;

  // ── Background colors ─────────────────────────────────────────────────────
  public static readonly BG = {
    BACKGROUND:         "bg-background",
    CARD:               "bg-card",
    PRIMARY:            "bg-primary",
    SECONDARY:          "bg-secondary",
    PRIMARY_SUBTLE:     "bg-primary/5",
    PRIMARY_LIGHT:      "bg-primary/10",
    EMERALD_SUBTLE:     "bg-emerald-500/5",
    EMERALD_LIGHT:      "bg-emerald-500/10",
    AMBER_SUBTLE:       "bg-amber-500/5",
    AMBER_LIGHT:        "bg-amber-500/10",
    RED_SUBTLE:         "bg-red-500/5",
  } as const;

  // ── Border colors ─────────────────────────────────────────────────────────
  public static readonly BORDER = {
    DEFAULT:            "border-border",
    PRIMARY:            "border-primary",
    PRIMARY_SUBTLE:     "border-primary/20",
    EMERALD:            "border-emerald-500/20",
    AMBER:              "border-amber-500/20",
    RED:                "border-red-500/20",
  } as const;

  // ── Computed helpers (dynamic class selection based on value) ─────────────

  /**
   * Score-based color helpers.
   * PrepView uses a consistent 3-tier color system: green ≥70%, amber ≥50%, red <50%.
   * Input: raw score 0–10 (stored in DB) OR percentage 0–100.
   */
  public static readonly Score = {
    /** Returns a text color class based on 0–10 score */
    text: (score: number): string => {
      const pct = score <= 10 ? Math.round(score * 10) : score;
      if (pct >= 70) return ColorTokensCON.TEXT.EMERALD;
      if (pct >= 50) return ColorTokensCON.TEXT.AMBER;
      return ColorTokensCON.TEXT.RED;
    },

    /** Returns a border color class based on 0–10 score */
    border: (score: number): string => {
      const pct = score <= 10 ? Math.round(score * 10) : score;
      if (pct >= 70) return ColorTokensCON.BORDER.EMERALD;
      if (pct >= 50) return ColorTokensCON.BORDER.AMBER;
      return ColorTokensCON.BORDER.RED;
    },

    /** Returns a background color class based on 0–10 score */
    bg: (score: number): string => {
      const pct = score <= 10 ? Math.round(score * 10) : score;
      if (pct >= 70) return ColorTokensCON.BG.EMERALD_SUBTLE;
      if (pct >= 50) return ColorTokensCON.BG.AMBER_SUBTLE;
      return ColorTokensCON.BG.RED_SUBTLE;
    },

    /** Returns a human-readable label based on score */
    label: (score: number): string => {
      const pct = score <= 10 ? Math.round(score * 10) : score;
      if (pct >= 70) return "Good";
      if (pct >= 50) return "Decent";
      return "Needs work";
    },
  };

  /**
   * Plan badge styling.
   * Returns the appropriate text + background class combination for a plan tier.
   */
  public static readonly Plan = {
    badge: (plan: "free" | "premium"): string =>
      plan === "premium"
        ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
        : "bg-secondary border-border text-muted-foreground",

    text: (plan: "free" | "premium"): string =>
      plan === "premium"
        ? ColorTokensCON.TEXT.AMBER
        : ColorTokensCON.TEXT.MUTED,
  };

  /**
   * ATS score color (Resume Analyzer).
   * Threshold differs from interview scores: good ≥75, mid ≥50.
   */
  public static readonly AtsScore = {
    text: (score: number): string => {
      if (score >= 75) return ColorTokensCON.TEXT.EMERALD;
      if (score >= 50) return ColorTokensCON.TEXT.AMBER;
      return ColorTokensCON.TEXT.RED;
    },

    label: (score: number): string => {
      if (score >= 75) return "Strong match";
      if (score >= 50) return "Partial match";
      return "Weak match";
    },
  };
}
