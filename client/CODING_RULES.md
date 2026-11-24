# PrepView Frontend — Coding Rules

> Rules for the **React 19 + TypeScript + Vite + Tailwind v4 + Shadcn/ui** web client.
> Every rule is enforced when writing new code. Existing code is refactored toward these rules incrementally.
>
> **Stack note:** These rules are adapted from a React Native/Expo ruleset.
> All RN-specific concepts (NativeWind, StyleSheet, expo-router, haptics) are replaced with
> their web equivalents for this codebase.

---

## 1. General TypeScript Rules

- **Never use `any`.** Every value, prop, function parameter, and return type must be explicitly typed.
- **Never use non-null assertion (`!`)** except in tests. Prefer optional chaining (`?.`) and proper null-checks.
- **Fully type every React component** return type as `React.JSX.Element` or `React.ReactNode`:

  ```typescript
  // ✅ Correct
  export default function Dashboard(): React.JSX.Element {
    return <div />;
  }

  // ❌ Wrong — implicit return type
  export default function Dashboard() {
    return <div />;
  }
  ```

- **Singleton pattern** for all non-component utility/helper/service classes:

  ```typescript
  // ✅ Definition
  export default class InterviewHelper {
    public static readonly current = new InterviewHelper();

    public formatScore(score: number): string {
      return `${Math.round(score * 10)}%`;
    }
  }

  // ✅ Usage
  InterviewHelper.current.formatScore(7.5);
  ```

- **Always use `interface` over `type` for object shapes.** Use `type` only for unions, intersections, and primitives.
- **Enable `strict` mode** in `tsconfig.app.json`. Never disable it.
- Use `const` over `let`. Never use `var`.
- Prefer `async/await` over raw `.then()` chains.
- Maximum function length: **50 lines**. Split longer functions.

---

## 2. Component Rules

### One Component Per File
Each file exports exactly **one** React component as the `default export`. No helper components, no second exports inside the same file — except small purely-presentational sub-components that are **only used in that single file** (see `static` components below).

### Component Types

| Type | Suffix | Location | Description |
|------|--------|----------|-------------|
| Page / Screen | `Page` or `Screen` | `src/pages/` | Route-level, owns page state |
| Feature controller | `Controller` | `src/features/<Feature>/Controllers/` | Orchestrates a logical section, composes multiple components |
| Reusable UI component | `Component` | `src/features/<Feature>/Components/shared/` or `src/components/` | Used in >1 place, presentational |
| Local-only component | `StaticComponent` | `src/features/<Feature>/Components/static/` | Used only by one parent file |
| Layout | `Layout` | `src/layouts/` | Wraps routes with nav/sidebar |
| Hook | `use*` | `src/hooks/` or `src/features/<Feature>/hooks/` | Custom React hook |

### Naming Rules

```
// Page (route-level)
src/pages/dashboard/DashboardPage.tsx → export default function DashboardPage()

// Feature controller (owns section state, composes components)
src/features/Interview/Controllers/InterviewSessionController.tsx → export default function InterviewSessionController()

// Shared component (used in >1 place)
src/features/Interview/Components/shared/QuestionCardComponent.tsx → export default function QuestionCardComponent()

// Static component (single-use, internal to one feature)
src/features/Report/Components/static/ReportCompetencyRingStaticComponent.tsx → export default function ReportCompetencyRingStaticComponent()
```

### Props

- Always define a `Props` interface in the same file for component props:

  ```typescript
  interface Props {
    score: number;
    label: string;
    onClick?: () => void;
  }

  export default function ScoreBadgeComponent({ score, label, onClick }: Props): React.JSX.Element {
    return <div />;
  }
  ```

- Never use `React.FC` or `React.FunctionComponent`. Use plain function syntax with explicit return type.

---

## 3. Styling Rules — Tailwind v4

### No Hardcoded Color Values
PrepView's design system lives in `client/src/index.css` as CSS custom properties (oklch tokens). **Never hardcode hex, rgb, hsl, or oklch values in component code.** Always use Tailwind CSS token classes.

```typescript
// ❌ Wrong — hardcoded color
<div style={{ backgroundColor: "#4F7CFF" }} />
<div className="bg-[#4F7CFF]" />

// ✅ Correct — use token class
<div className="bg-primary" />
<div className="text-muted-foreground" />
<div className="border-border" />
```

**Available PrepView design tokens:**

| Token Class | Purpose |
|-------------|---------|
| `bg-background` / `text-foreground` | Page canvas + main text |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `bg-primary` / `text-primary` / `text-primary-foreground` | Brand blue (#4F7CFF) |
| `bg-secondary` / `text-secondary-foreground` | Subtle surfaces |
| `text-muted-foreground` | Secondary/hint text |
| `border-border` | Standard borders |
| `text-destructive` | Error states |
| `text-brand-violet` | Violet accent (reports, analytics) |
| `text-brand-mint` | Mint accent (completion, success) |
| `bg-emerald-500/10` `text-emerald-500` | Success indicators (match inline Tailwind) |
| `bg-amber-500/10` `text-amber-500` | Warning / premium indicators |
| `bg-red-400` | Error indicators |

If you need a new persistent color token, **add it to `index.css` under `:root` and `.dark`**, not inline in a component.

### No Hardcoded Arbitrary Spacing
Use Tailwind's spacing scale (`p-4`, `px-6`, `mt-3`, `gap-2`, etc.). Avoid arbitrary values like `p-[14px]` or `mt-[22px]` unless there is a documented reason.

```typescript
// ❌ Wrong
<div style={{ padding: 16, marginTop: 24 }} />
<div className="p-[16px] mt-[24px]" />

// ✅ Correct
<div className="p-4 mt-6" />
```

### No Inline Styles — Except Motion
The only place inline styles are acceptable is **Framer Motion** `animate`/`initial` props and SVG `strokeDashoffset` computations (like in the ATS score meter). Everything else uses Tailwind classes.

### Dark Mode
All new components must look correct in **both light and dark modes**. Use `dark:` variants when Tailwind tokens aren't sufficient. The theme is toggled via `ThemeContext` by adding/removing the `dark` class on `<html>`.

```typescript
// ✅ Correct — works in both modes via CSS variables
<div className="bg-card border-border text-foreground" />

// ✅ Correct — explicit dark variant when needed
<div className="bg-white dark:bg-zinc-900" />

// ❌ Wrong — no dark variant
<div className="bg-white" />
```

### Class Name Merging
Use `cn()` from `src/lib/utils.ts` (wraps `clsx` + `tailwind-merge`) when combining conditional classes:

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-xl border bg-card p-4",
  isActive && "border-primary bg-primary/5",
  className,
)} />
```

---

## 4. File Structure

### Migration Strategy
Existing pages in `src/pages/` are **migrated to `src/features/` as we touch them**. When you open a file to make changes, migrate that file's related components into the feature structure at the same time. Do not migrate files you aren't actively editing.

### Current Structure (maintain and extend):

```
client/src/
├── api/                    Axios API functions — one file per domain
├── components/
│   └── ui/                 Shadcn/ui primitives (do not edit directly)
├── constants/              Global constants (CON files — see naming rules)
├── context/                React Context providers (AuthContext, ThemeContext)
├── features/               Feature-based modules (new code goes here)
│   └── <FeatureName>/
│       ├── <FeatureName>Controller.tsx   Root controller for the feature
│       ├── Components/
│       │   ├── static/     Single-use components for this feature only
│       │   └── shared/     Reusable within this feature or exported globally
│       ├── Controllers/    Sub-controllers (complex sub-sections)
│       ├── hooks/          Feature-specific custom hooks
│       ├── models/         TypeScript interfaces, enums, types for this feature
│       └── constants/      Feature-scoped constants (CON files)
├── hooks/                  Global custom hooks (useAuth, useDashboard, etc.)
├── layouts/                Route layout wrappers
├── lib/                    Utilities (cn, queryClient)
├── pages/                  Route-level page components (legacy + new)
├── routes/                 React Router config + route guards
├── schemas/                Zod validation schemas (form inputs)
├── types/                  Global TypeScript types (*Type.ts files)
└── utils/                  Global utility classes (*Utility.ts files)
```

### Foundation CON Files (already created — use these)

| File | Purpose |
|------|---------|
| `src/constants/AppRoutesCON.ts` | All client route paths |
| `src/constants/QueryKeysCON.ts` | All TanStack Query cache keys |
| `src/constants/ColorTokensCON.ts` | Dynamic color class selection + score/plan helpers |
| `src/constants/InterviewCON.ts` | Interview types, difficulties, role presets, limits, loading steps |
| `src/constants/StorageCON.ts` | localStorage key strings |

### Rules:
- New feature work → goes in `src/features/<FeatureName>/`
- If a component is only used in one page → `static/` subfolder
- If a component is used in >1 feature → `src/components/` or `shared/`
- Pages in `src/pages/` are legacy — keep them, but new feature logic goes in `src/features/`

---

## 5. Constants — CON Files

All static configuration, arrays, strings, and route keys must live in a constants file ending with `*CON.ts`.

```typescript
// ✅ src/constants/InterviewCON.ts
export default class InterviewCON {
  public static readonly MAX_QUESTIONS = 10;
  public static readonly MIN_ANSWER_WORDS = 10;
  public static readonly MIN_VOICE_WORDS = 5;
  public static readonly WEAK_ANSWER_THRESHOLD = 5;

  public static readonly TYPES = [
    { value: "technical",    label: "Technical",    desc: "Concepts & real-world problems" },
    { value: "behavioral",   label: "Behavioral",   desc: "STAR format & soft skills" },
    { value: "system_design",label: "System Design",desc: "Architecture & trade-offs" },
    { value: "dsa",          label: "DSA",          desc: "Algorithm reasoning & complexity" },
    { value: "mixed",        label: "Mixed",        desc: "All domains combined" },
  ] as const;

  public static readonly DIFFICULTIES = [
    { value: "easy",   label: "Easy",   desc: "0–1 yr · Fundamentals" },
    { value: "medium", label: "Medium", desc: "1–3 yr · Industry standard" },
    { value: "hard",   label: "Hard",   desc: "4+ yr · Senior level" },
  ] as const;
}
```

**Strict rules:**
- No static config arrays inside component or controller files. Always CON.
- All TanStack Query keys → `src/constants/QueryKeysCON.ts`
- All route path strings → `src/constants/AppRoutesCON.ts`
- All localStorage / cookie key strings → `src/constants/StorageCON.ts` (values in ALL_CAPS)

```typescript
// ✅ src/constants/AppRoutesCON.ts
export default class AppRoutesCON {
  public static readonly DASHBOARD = "/dashboard";
  public static readonly INTERVIEW_CREATE = "/interview/create";
  public static readonly INTERVIEW_SESSION = (id: string) => `/interview/${id}`;
  public static readonly INTERVIEW_REPORT = (id: string) => `/interview/${id}/report`;
  public static readonly RESUME = "/resume";
  public static readonly PRICING = "/pricing";
  public static readonly PROFILE = "/profile";
}
```

```typescript
// ✅ src/constants/QueryKeysCON.ts
export default class QueryKeysCON {
  public static readonly CURRENT_USER = ["currentUser"] as const;
  public static readonly DASHBOARD = ["dashboard"] as const;
  public static readonly INTERVIEW = (id: string) => ["interview", id] as const;
  public static readonly INTERVIEW_DETAILS = (id: string) => ["interview-details", id] as const;
  public static readonly INTERVIEWS = ["interviews"] as const;
}
```

---

## 6. Types — Global Types

All global TypeScript types, interfaces, enums must live in `src/types/`. Every file must end with `*Type.ts`.

```
src/types/
├── AuthType.ts          User, LoginRequest, RegisterRequest, AuthResponse
├── InterviewType.ts     Interview, Question, Answer, Evaluation, Report
├── DashboardType.ts     DashboardStats, PerformanceHistory, StatCard
├── ResumeType.ts        ResumeAnalysisResult, SkillMatch
└── PaymentType.ts       CheckoutSession, PaymentVerification
```

**Rules:**
- No single monolithic `types.ts`
- No inline interface definitions inside hooks or API files for shared shapes
- Enums for finite sets of options:

  ```typescript
  // ✅ src/types/InterviewType.ts
  export enum InterviewType {
    Technical = "technical",
    Behavioral = "behavioral",
    SystemDesign = "system_design",
    DSA = "dsa",
    Mixed = "mixed",
  }

  export enum InterviewDifficulty {
    Easy = "easy",
    Medium = "medium",
    Hard = "hard",
  }

  export enum InterviewStatus {
    Pending = "pending",
    InProgress = "in_progress",
    Completed = "completed",
  }

  export interface Interview {
    _id: string;
    userId: string;
    role: string;
    type: InterviewType;
    mode: "voice" | "text";
    difficulty: InterviewDifficulty;
    status: InterviewStatus;
    techStacks?: string;
    company?: string;
    questionsAsked: number;
    followUpsRemaining: number;
    startedAt?: string;
    endedAt?: string;
    createdAt: string;
    updatedAt: string;
  }
  ```

---

## 7. Navigation — Route Constants

**Never hardcode route strings in components.** Always import from `AppRoutesCON`.

```typescript
// ❌ Wrong
navigate("/interview/create");
<Link to="/pricing">Upgrade</Link>

// ✅ Correct
import AppRoutesCON from "@/constants/AppRoutesCON";

navigate(AppRoutesCON.INTERVIEW_CREATE);
<Link to={AppRoutesCON.PRICING}>Upgrade</Link>
navigate(AppRoutesCON.INTERVIEW_SESSION(id));
```

---

## 8. Data Fetching — TanStack Query

- All server state goes through **TanStack Query**. No `useEffect` + `useState` for fetching.
- All query keys come from `QueryKeysCON`.
- Hooks live in `src/hooks/` or `src/features/<Feature>/hooks/`.
- Mutations: use `useMutation` with `onSuccess` cache invalidation. Never manually update cache state.
- Error handling: surface errors from `error.response?.data?.message` via `toast.error()`.

```typescript
// ✅ Pattern for a data-fetching hook
import { useQuery } from "@tanstack/react-query";
import { getInterviewDetails } from "@/api/interview.api";
import QueryKeysCON from "@/constants/QueryKeysCON";

export function useInterviewDetails(id: string) {
  return useQuery({
    queryKey: QueryKeysCON.INTERVIEW_DETAILS(id),
    queryFn: () => getInterviewDetails(id),
    enabled: !!id,
  });
}
```

---

## 9. API Layer

- One file per domain: `auth.api.ts`, `interview.api.ts`, `resume.api.ts`, etc.
- All functions are **typed**: explicit request and response types.
- Never call `axios` directly in a component — always through an `api/` function.
- The Axios instance lives in `src/api/axios.ts` only.

```typescript
// ✅ Typed API function
import type { CreateInterviewRequest, CreateInterviewResponse } from "@/types/InterviewType";
import api from "./axios";

export async function createInterview(
  data: CreateInterviewRequest,
): Promise<CreateInterviewResponse> {
  const res = await api.post<CreateInterviewResponse>("/interviews", data);
  return res.data;
}
```

---

## 10. Utility & Helper Classes

| Type | Suffix | Location | Description |
|------|--------|----------|-------------|
| Helper | `*Helper` | `src/helpers/` | Domain-specific logic (e.g., score formatting) |
| Utility | `*Utility` | `src/utils/` | Generic, reusable logic (e.g., text, date, math) |

Both must be singletons:

```typescript
// ✅ src/helpers/ScoreHelper.ts
export default class ScoreHelper {
  public static readonly current = new ScoreHelper();

  public toPercent(score: number): number {
    return Math.round(score * 10);
  }

  public toColor(score: number): string {
    const pct = this.toPercent(score);
    if (pct >= 70) return "text-emerald-500";
    if (pct >= 50) return "text-amber-500";
    return "text-red-400";
  }

  public toLabel(score: number): string {
    const pct = this.toPercent(score);
    if (pct >= 70) return "Good answer!";
    if (pct >= 50) return "Decent answer";
    return "Needs improvement";
  }
}

// ✅ Usage anywhere
import ScoreHelper from "@/helpers/ScoreHelper";
const color = ScoreHelper.current.toColor(evaluation.overallScore);
```

---

## 11. Schemas — Zod Form Validation

- All form validation schemas → `src/schemas/` or `src/features/<Feature>/schemas/`
- File names end with `*.schema.ts`
- Always export the inferred TypeScript type alongside the schema:

  ```typescript
  // ✅ src/schemas/interview.schema.ts
  import { z } from "zod";

  export const createInterviewSchema = z.object({
    role: z.string().min(2, "Role is required"),
    techStacks: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    type: z.enum(["technical", "behavioral", "system_design", "dsa", "mixed"]),
    mode: z.enum(["voice", "text"]),
    company: z.string().optional(),
  });

  export type CreateInterviewSchema = z.infer<typeof createInterviewSchema>;
  ```

---

## 12. Motion & Animation

- All animation primitives (FadeIn, StaggerContainer, StaggerItem, ScaleIn) live in `src/components/ui/motion.tsx`.
- Do not use raw `<motion.div>` with `initial`/`animate` in page/feature files. Always compose via motion primitives.
- Exception: Framer Motion `AnimatePresence` + `exit` props for conditional renders (toast, modals).

```typescript
// ✅ Correct — use motion primitives
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

<StaggerContainer stagger={0.08}>
  <StaggerItem><StatCard /></StaggerItem>
  <StaggerItem><StatCard /></StaggerItem>
</StaggerContainer>

// ❌ Wrong — raw motion.div in page file
import { motion } from "framer-motion";
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
```

---

## 13. Error Handling

- Use `toast.error()` from `sonner` for user-facing errors.
- Never show raw error objects or stack traces to the user.
- Standard error extraction pattern:

  ```typescript
  // ✅
  catch (err: unknown) {
    const message = err instanceof Error
      ? err.message
      : (err as any)?.response?.data?.message ?? "Something went wrong";
    toast.error(message);
  }
  ```

- Loading states: use Shadcn `<Skeleton>` for content placeholders, `<Loader2 className="animate-spin">` for inline loaders.

---

## 14. Accessibility

- All interactive elements must have an `aria-label` if they don't have visible text (icon buttons).
- Images must have `alt` attributes.
- Form fields must use `<label>` (via Shadcn `FormLabel`) properly linked to their input.
- Keyboard navigation must work: buttons via `Enter`, modals via `Escape`.

---

## 15. What NOT to Do

| Anti-pattern | Why |
|-------------|-----|
| `any` type | Breaks type safety silently |
| Hardcoded hex/rgb colors | Breaks dark mode + design system |
| Raw route strings like `"/dashboard"` | Hard to refactor, easy to typo |
| Hardcoded query key strings | Cache invalidation bugs |
| `useEffect` for data fetching | Use TanStack Query instead |
| Static config arrays inside component files | Must live in CON files |
| `export { X }` + `export default Y` from same file | One export per component file |
| `React.FC` type | Deprecated pattern, use plain function |
| Inline `style={{}}` (except motion/SVG math) | Use Tailwind classes |
| `localStorage` access outside of a service | Centralise in `StorageCON` + a service |
