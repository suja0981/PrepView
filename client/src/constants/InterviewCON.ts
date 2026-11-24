/**
 * InterviewCON.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All static interview configuration — types, difficulties, role presets,
 * UI labels, limits. Replaces the scattered constants in component files.
 *
 * Usage:
 *   import InterviewCON from "@/constants/InterviewCON";
 *   InterviewCON.TYPES          // array of type config objects
 *   InterviewCON.MAX_QUESTIONS  // 10
 */
import { Code2, Users, Server, Shuffle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Type Config ───────────────────────────────────────────────────────────────
export interface InterviewTypeConfig {
  readonly value: "technical" | "behavioral" | "system_design" | "mixed";
  readonly label: string;
  readonly desc: string;
  readonly icon: LucideIcon;
  readonly requiresPremium: boolean;
}

// ── Difficulty Config ──────────────────────────────────────────────────────────
export interface InterviewDifficultyConfig {
  readonly value: "easy" | "medium" | "hard";
  readonly label: string;
  readonly desc: string;
  readonly requiresPremium: boolean;
}

// ── Role Preset Config ────────────────────────────────────────────────────────
export interface RolePreset {
  readonly label: string;
  readonly role: string;
  readonly techStacks: string;
  readonly type: InterviewTypeConfig["value"];
}

export default class InterviewCON {
  // ── Session limits ──────────────────────────────────────────────────────────
  public static readonly MAX_QUESTIONS = 10 as const;
  public static readonly FREE_MONTHLY_LIMIT = 3 as const;
  public static readonly MAX_FOLLOW_UPS = 2 as const;
  public static readonly WEAK_ANSWER_THRESHOLD = 5 as const;

  // ── Answer requirements ──────────────────────────────────────────────────────
  /** Minimum words for a text interview answer to be submittable */
  public static readonly MIN_TEXT_WORDS = 10 as const;
  /** Minimum words for a voice interview answer to be submittable */
  public static readonly MIN_VOICE_WORDS = 5 as const;
  /** Words below which Whisper fallback is triggered */
  public static readonly WHISPER_FALLBACK_THRESHOLD = 20 as const;

  // ── Interview types ──────────────────────────────────────────────────────────
  public static readonly TYPES: readonly InterviewTypeConfig[] = [
    {
      value: "technical",
      label: "Technical",
      desc: "Concepts & real-world problems",
      icon: Code2,
      requiresPremium: false,
    },
    {
      value: "behavioral",
      label: "Behavioral",
      desc: "STAR format & soft skills",
      icon: Users,
      requiresPremium: false,
    },
    {
      value: "system_design",
      label: "System Design",
      desc: "Architecture & trade-offs",
      icon: Server,
      requiresPremium: true,
    },
    {
      value: "mixed",
      label: "Mixed",
      desc: "All domains combined",
      icon: Shuffle,
      requiresPremium: false,
    },
  ] as const;

  // ── Difficulties ─────────────────────────────────────────────────────────────
  public static readonly DIFFICULTIES: readonly InterviewDifficultyConfig[] = [
    { value: "easy",   label: "Easy",   desc: "0–1 yr · Fundamentals",       requiresPremium: false },
    { value: "medium", label: "Medium", desc: "1–3 yr · Industry standard",  requiresPremium: false },
    { value: "hard",   label: "Hard",   desc: "4+ yr · Senior level",        requiresPremium: true  },
  ] as const;

  // ── Role presets ──────────────────────────────────────────────────────────────
  public static readonly ROLE_PRESETS: readonly RolePreset[] = [
    { label: "Frontend Dev",     role: "Frontend Software Engineer",     techStacks: "React, TypeScript, JavaScript, CSS, Browser APIs",       type: "technical" },
    { label: "Backend Dev",      role: "Backend Software Engineer",      techStacks: "Node.js, REST APIs, SQL, MongoDB, Redis, Docker",         type: "technical" },
    { label: "Fullstack Dev",    role: "Fullstack Software Engineer",    techStacks: "React, Node.js, TypeScript, PostgreSQL, REST APIs",       type: "technical" },
    { label: "Mobile Dev",       role: "Mobile Software Engineer",       techStacks: "React Native, Swift, Kotlin, State Management, REST",     type: "technical" },
    { label: "DevOps / SRE",     role: "DevOps / SRE Engineer",         techStacks: "Docker, Kubernetes, CI/CD, Terraform, Monitoring",        type: "technical" },
    { label: "QA / Automation",  role: "QA Automation Engineer",        techStacks: "Selenium, Cypress, Playwright, Jest, Test Strategy",      type: "technical" },
    { label: "Data Engineer",    role: "Data Engineer",                  techStacks: "Python, Spark, Airflow, Kafka, BigQuery, Snowflake",      type: "technical" },
    { label: "Data Analyst",     role: "Data Analyst",                   techStacks: "SQL, Python, Tableau, A/B Testing, Data Modelling",      type: "technical" },
    { label: "AI / ML Engineer", role: "ML Engineer",                    techStacks: "Python, PyTorch, scikit-learn, MLOps, Model Deployment", type: "technical" },
    { label: "System Design",    role: "Software Engineer",              techStacks: "",                                                        type: "system_design" },
    { label: "Behavioral",       role: "Software Engineer",              techStacks: "",                                                        type: "behavioral" },
    { label: "Custom",           role: "",                               techStacks: "",                                                        type: "technical" },
  ] as const;

  // ── UI loading step messages ───────────────────────────────────────────────
  public static readonly SUBMIT_LOADING_STEPS = [
    "Evaluating your answer...",
    "Analysing depth & accuracy...",
    "Generating next question...",
  ] as const;

  public static readonly RESUME_SCAN_STEPS = [
    "Extracting text & parsing document structure...",
    "Analyzing job description requirements & skill taxonomy...",
    "Cross-referencing experience against missing keywords...",
    "Calculating deterministic ATS score & generating report...",
  ] as const;

  // ── Helper methods ────────────────────────────────────────────────────────
  /** Returns the config object for a given interview type value */
  public static getTypeConfig(
    value: InterviewTypeConfig["value"],
  ): InterviewTypeConfig | undefined {
    return InterviewCON.TYPES.find((t) => t.value === value);
  }

  /** Returns the config object for a given difficulty value */
  public static getDifficultyConfig(
    value: InterviewDifficultyConfig["value"],
  ): InterviewDifficultyConfig | undefined {
    return InterviewCON.DIFFICULTIES.find((d) => d.value === value);
  }

  /** Human-readable type label — safe fallback */
  public static typeLabel(value: string): string {
    return InterviewCON.getTypeConfig(
      value as InterviewTypeConfig["value"],
    )?.label ?? value.replace(/_/g, " ");
  }
}
