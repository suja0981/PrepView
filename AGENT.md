# AGENT.md — AI Coding Agent Instructions

> This file governs how the AI coding agent (Antigravity / any LLM assistant) must behave when working on this project.
> These rules apply **at all times**, regardless of what the user asks in a prompt. If a user request conflicts with a rule here, flag the conflict and ask for clarification — do NOT silently violate it.

---

## 1. General Conduct

- **Ask before creating any new file.** Describe the file name, its path, and why it is needed. Wait for explicit approval before creating it.
- **Ask before deleting any file.** State the file path and reason. Never auto-delete without confirmation — not even "dead code" or files you think are superseded.
- **Never modify a file you were not explicitly asked to change.** No "while I'm here" edits. If you spot a bug in a file you're passing through, report it — don't fix it without being asked.
- **Complete one task at a time.** Do not start the next task until the current one is confirmed complete and correct by the user.
- **Never skip ahead in the BUILD_PLAN.md phase order.** Work phases in sequence (Phase 1 → Phase 2 → …). Do not begin a later phase task unless the user explicitly says to.

---

## 2. Before Writing Any Code

- Read and cross-reference the following files before touching any code:
  - `d:\PrepView\CONTEXT.md` — project constraints, decisions, free-tier limits
  - `d:\PrepView\ARCHITECTURE.md` — data models, module map, API routes, AI pipeline
  - `d:\PrepView\BUILD_PLAN.md` — phase order and task checklist
  - `d:\PrepView\client\CODING_RULES.md` — frontend coding standards
  - `d:\PrepView\server\CODING_RULES.md` — backend coding standards
- If anything in these files is ambiguous or contradicts the user's request, **ask for clarification first**.
- For **multi-file changes**: show a clear plan listing every file you will touch and what you will do to each one. Wait for the user's "go ahead" before writing any of it.

---

## 3. Code Changes

- **Never hardcode** route strings, query keys, colors, spacing values, or localStorage key strings in components. Use the established constants files:
  - Routes → `src/constants/AppRoutesCON.ts`
  - Query keys → `src/constants/QueryKeysCON.ts`
  - Colors → `src/constants/ColorTokensCON.ts`
  - Interview config → `src/constants/InterviewCON.ts`
  - Storage keys → `src/constants/StorageCON.ts`
- **Follow coding rules strictly.** Refer to `client/CODING_RULES.md` and `server/CODING_RULES.md`. If a rule makes it impossible to implement something the way the user asked, flag it and suggest an alternative.
- **No silent API key fallbacks.** If a required env var is missing, throw an `AppError` immediately — never use a dummy/fallback value.
- **Respect the free-tier constraint.** Never introduce a dependency or suggest a service that requires a paid plan. Flag any borderline case and wait for approval.
- **DSA questions are verbal/whiteboard only.** No code editor, no code execution, no code sandbox. If asked to add a code runner, flag it and decline until discussed.

---

## 4. Breaking Changes

- If a change is **breaking** (renames a DB field, changes an API contract, removes an endpoint, alters auth flow), you must:
  1. Explicitly label it as a **BREAKING CHANGE**.
  2. Describe the before/after impact.
  3. Wait for explicit confirmation before proceeding.
- Never rename a file/module that is imported in many places without first listing every import site and getting approval.

---

## 5. What to Do When Stuck or Uncertain

- If you are unsure about the right approach, **ask** — do not guess and implement.
- If the user's request is ambiguous, list your interpretations and ask which one is intended.
- If a dependency or tool you need isn't installed, ask the user before running `npm install` / `pnpm add`.
- If you encounter an error you cannot resolve in two attempts, stop, report the full error, and ask for guidance.

---

## 6. Session Discipline

- At the start of each working session, briefly recap: what was done last session, what is in progress, and what is next per BUILD_PLAN.md.
- After completing each task from BUILD_PLAN.md, check it off and ask the user to confirm before moving to the next.
- Keep responses concise. Prefer showing diffs or file snippets over re-printing entire files.
- If the conversation context is getting long, recommend `/compact` to summarize it.

---

## 7. Things You Must Never Do (Hard No)

| Action | Reason |
|---|---|
| Create a file without asking | Preserves project structure control |
| Delete a file without confirmation | Prevents accidental data loss |
| Edit a file not in scope of current task | Prevents unreviewed side effects |
| Introduce a paid API / service | Free-tier constraint |
| Add a code execution environment for DSA | Out of scope, flagged as risk |
| Use `any` in TypeScript (backend catch blocks) | Type safety requirement |
| Hardcode colors, spacing, routes, query keys | Breaks constants system |
| Skip a BUILD_PLAN phase without approval | Breaks project discipline |
| Silently fix bugs while working on something else | Requires explicit approval |
| Run `npm install` / `pnpm add` without asking | Prevents unwanted dependency changes |

---

> **Last updated:** Session 2 · November 2026
> **Maintained by:** Project owner (Sujal)
