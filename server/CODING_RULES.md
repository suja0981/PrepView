# PrepView Backend — Coding Rules

> Rules for the **Node.js + Express 5 + TypeScript + MongoDB (Mongoose) + Zod** API server.
> Written to be reusable for any TypeScript Express project with minor modifications.
> Replace PrepView-specific references (module names, env vars) for other projects.
>
> Last updated: November 2026

---

## 1. General TypeScript Rules

- **Never use `any` for declared types.** Every variable, parameter, and return type must be explicitly typed. The only exceptions are:
  - `catch (err: unknown)` — always use `unknown` in catch blocks, never `any`
  - AI/LLM service response parsing (intentionally loose — documented below in §8)

- **Never use non-null assertion (`!`)** except in test files. Guard with optional chaining (`?.`) or an explicit null check instead.

- **Fully type every function** — parameters and return types:
  ```typescript
  // ✅ Correct
  async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 12);
  }

  // ❌ Wrong — missing return type
  async function hashPassword(plain: string) {
    return bcrypt.hash(plain, 12);
  }
  ```

- Use `interface` for object shapes. Use `type` only for unions, intersections, and primitives.

- Use `const` over `let`. Never use `var`.

- Prefer `async/await` over raw `.then()` chains. Never mix the two in the same function.

- Maximum function length: **40 lines**. Split longer functions into helpers.

- Enable `strict: true` in `tsconfig.json`. Never disable it.

- **No barrel re-exports (`index.ts`) that re-export everything blindly.** Each `index.ts` should re-export only the public surface of a module (router + types), not every internal file.

---

## 2. Project Structure

Each domain area is a **module** under `src/modules/`. Every module follows the same internal layout:

```
src/
├── ai/
│   ├── prompts/            LLM prompt builder functions (* .prompt.ts)
│   └── services/           AI service calls (llm.service.ts, evaluation, report, resume, whisper)
│
├── config/
│   ├── env.ts              Zod-validated environment schema — single source of truth
│   ├── database.ts         Mongoose connect/disconnect
│   ├── cors.ts             CORS config
│   └── logger.ts           Pino logger instance
│
├── modules/
│   └── <moduleName>/
│       ├── <module>.model.ts          Mongoose schema + model
│       ├── <module>.repository.ts     DB access layer (queries only, no business logic)
│       ├── <module>.service.ts        Business logic layer (orchestrates repo + AI + other modules)
│       ├── <module>.controller.ts     HTTP layer (parse req → call service → format res)
│       ├── <module>.routes.ts         Express Router (middleware wiring + route definitions)
│       ├── <module>.validation.ts     Zod schemas for request bodies
│       └── index.ts                   Public re-export: router + types
│
├── shared/
│   ├── constants/          App-wide constants (e.g., MAX_QUESTIONS)
│   ├── errors/             AppError class
│   ├── middleware/         Auth, validate, requirePlan, rate-limit, error-handler, not-found
│   └── utils/              asyncHandler, jwt, password, json helpers
│
├── types/
│   └── express.d.ts        Module augmentation (req.user, etc.)
│
├── app.ts                  Express app factory (createApp function)
└── server.ts               HTTP server entry point
```

**Rules:**
- One model per file. One service per file. One controller per file.
- No cross-module imports except through a module's `index.ts`.
- `app.ts` only: middleware wiring, route mounting. No business logic.
- `server.ts` only: `createApp()` call + `server.listen()`. No logic.

---

## 3. Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Module folder | `kebab-case` | `interview/`, `payment/` |
| File | `<module>.<layer>.ts` | `interview.service.ts` |
| Class | `PascalCase` | `InterviewService` |
| Exported instance | `camelCase` | `export const interviewService = new InterviewService()` |
| Mongoose model | `PascalCase` | `InterviewModel`, `User` |
| Interface | `PascalCase` | `CreateInterviewInput` |
| Zod schema | `PascalCase` + `Schema` suffix | `CreateInterviewSchema` |
| Inferred Zod type | `PascalCase` + `Input` suffix | `type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>` |
| Controller function | `camelCase` verb | `createInterview`, `submitAnswer` |
| Route file export | `camelCase` + `Router` suffix | `export { interviewRouter }` |
| Middleware | `camelCase` + `Middleware` suffix | `authenticate`, `errorHandlerMiddleware` |
| Constant file | `kebab-case` | `src/shared/constants/interview.ts` |
| Constant value | `SCREAMING_SNAKE_CASE` | `export const MAX_QUESTIONS = 10` |

---

## 4. Controller Layer

Controllers are **thin HTTP adapters only**. They:
1. Extract data from `req` (params, body, user)
2. Call the service
3. Send a formatted response

No business logic, no DB calls, no AI calls in controllers.

```typescript
// ✅ Correct — thin controller
export const createInterview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const interview = await interviewService.createInterview(
      req.user!.userId,
      req.body as CreateInterviewInput,
    );
    res.status(201).json({ success: true, data: interview });
  },
);

// ❌ Wrong — business logic in controller
export const createInterview = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.userId); // ← belongs in service
  if (user?.plan !== "premium") {                     // ← belongs in service
    throw new AppError("Premium required", 403);
  }
  // ...
});
```

**Response format** — always use this shape:
```typescript
// Success
res.status(200).json({ success: true, data: result });
res.status(201).json({ success: true, message: "Created.", data: result });

// Error (handled by errorHandlerMiddleware — don't send manually)
throw new AppError("Not found.", 404);
```

---

## 5. Service Layer

Services contain all **business logic**. They:
- Enforce business rules (plan checks, ownership guards, idempotency)
- Orchestrate repositories and AI services
- Throw `AppError` for domain errors
- Never touch `req`/`res` — no Express types here

```typescript
// ✅ Correct service structure
class InterviewService {
  async createInterview(userId: string, data: CreateInterviewInput): Promise<CreateInterviewResult> {
    // 1. Business rule: plan check
    const user = await User.findById(userId).select("plan");
    if (data.mode === "voice" && user?.plan !== "premium") {
      throw new AppError("Voice interviews require Premium.", 403, true);
    }

    // 2. Orchestrate repos + AI
    const interview = await interviewRepository.create(userId, data);
    const questionData = await callGroq(buildQuestionPrompt({ ... }));
    const question = await questionRepository.create({ ... });

    return { interview, question };
  }
}

export const interviewService = new InterviewService();
```

**Rules:**
- Services are classes with a single exported instance: `export const xService = new XService()`
- Never `import` a controller from a service (no circular dependency)
- If a service needs another service → inject it via constructor or import the other service's exported instance

---

## 6. Repository Layer

Repositories contain **database access only**. They:
- Run Mongoose queries
- Return Mongoose documents or plain objects
- Have no business logic and no AI calls
- Throw nothing — let the service handle missing data

```typescript
// ✅ Correct repository
class InterviewRepository {
  async create(userId: string, data: CreateInterviewInput): Promise<InterviewDocument> {
    return InterviewModel.create({ userId, ...data });
  }

  async findById(id: string): Promise<InterviewDocument | null> {
    return InterviewModel.findById(id);
  }

  async findByUser(userId: string): Promise<InterviewDocument[]> {
    return InterviewModel.find({ userId }).sort({ createdAt: -1 });
  }

  async markCompleted(id: string): Promise<void> {
    await InterviewModel.findByIdAndUpdate(id, {
      status: "completed",
      endedAt: new Date(),
    });
  }
}

export const interviewRepository = new InterviewRepository();
```

**Rules:**
- Repositories are classes with a single exported instance: `export const xRepository = new XRepository()`
- No `AppError` throws in repositories
- No business logic — just the query. If you find yourself writing `if/else` based on data values, it belongs in the service layer.
- Prefer specific query methods over generic `findOne({ ...someFilter })` exposed to the service.

---

## 7. Model Layer (Mongoose)

```typescript
// ✅ Standard model file structure
import { Schema, Types, model, type InferSchemaType } from "mongoose";

const interviewSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    role:   { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["technical", "behavioral", "system_design", "dsa", "mixed"],
      default: "technical",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Always export the inferred type alongside the model
export type Interview = InferSchemaType<typeof interviewSchema>;
export const InterviewModel = model("Interview", interviewSchema);
```

**Rules:**
- Always use `timestamps: true` on every schema.
- Always add `index: true` to fields used in `find({ fieldName: ... })` queries.
- For foreign keys: always add `ref: "ModelName"` on ObjectId fields.
- Always export both the inferred `type` and the `model`.
- Enum values are defined in the model schema **and** mirrored in a `src/shared/constants/` file — never duplicated in validation or service manually.

**Index guidelines:**
```typescript
// Single field — add index on the field definition
userId: { type: Types.ObjectId, ref: "User", required: true, index: true }

// Compound index — add after schema definition
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ interviewId: 1, order: 1 });
```

---

## 8. Validation Layer (Zod)

All request bodies are validated with Zod **before** reaching the controller.

```typescript
// ✅ src/modules/interview/interview.validation.ts
import { z } from "zod";

export const CreateInterviewSchema = z.object({
  role:        z.string().min(2, "Role is required").max(100),
  techStacks:  z.string().max(300).optional(),
  difficulty:  z.enum(["easy", "medium", "hard"]),
  type:        z.enum(["technical", "behavioral", "system_design", "dsa", "mixed"]),
  mode:        z.enum(["voice", "text"]),
  company:     z.string().max(100).optional(),
});

export const SubmitAnswerSchema = z.object({
  questionId:   z.string().min(1),
  answer:       z.string().min(1, "Answer cannot be empty").max(10000),
  responseTime: z.number().int().nonneg(),
});

// Always export the inferred type
export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
export type SubmitAnswerInput    = z.infer<typeof SubmitAnswerSchema>;
```

**Rules:**
- Zod schemas are only in `*.validation.ts` files — never inline in controllers.
- Routes use the shared `validate(Schema)` middleware to trigger validation.
- Always export the `z.infer<typeof Schema>` type alongside every schema.
- For constants used in both Zod and prompt logic (e.g., enum values), define them in `src/shared/constants/` and reference them in Zod with `z.enum([...CONSTANT_ARRAY])`.

---

## 9. Error Handling

### AppError
Use `AppError` for all domain and HTTP errors. Never `throw new Error()` in services or controllers.

```typescript
// ✅ src/shared/errors/app-error.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public upgradeRequired: boolean = false,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ✅ Usage in services
throw new AppError("Interview not found.", 404);
throw new AppError("Voice interviews require Premium.", 403, true);
throw new AppError("This question has already been answered.", 409);
```

### asyncHandler
Every async controller function **must** be wrapped in `asyncHandler` — never use try/catch in controllers:

```typescript
// ✅ Correct
export const createInterview = asyncHandler(async (req, res) => {
  const result = await interviewService.createInterview(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: result });
});

// ❌ Wrong — manual try/catch in controller
export const createInterview = async (req: Request, res: Response) => {
  try {
    const result = await interviewService.createInterview(...);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
```

### catch blocks — always `unknown`

```typescript
// ✅ Correct — unknown is safer
} catch (err: unknown) {
  const message = err instanceof AppError
    ? err.message
    : err instanceof Error
    ? err.message
    : "An unexpected error occurred";
  throw new AppError(message, 500);
}

// ❌ Wrong — any bypasses type checking
} catch (err: any) {
  throw new AppError(err.message, 500);
}
```

---

## 10. Routes Layer

```typescript
// ✅ Standard route file structure
import { Router } from "express";
import { authenticate }    from "../../shared/middleware/auth.middleware";
import { validate }        from "../../shared/middleware/validate";
import { aiRateLimit }     from "../../shared/middleware/rate-limit.middleware";
import { createInterview, submitAnswer, getInterview } from "./interview.controller";
import { CreateInterviewSchema, SubmitAnswerSchema }    from "./interview.validation";

const interviewRouter = Router();

// Apply auth to all routes in this router
interviewRouter.use(authenticate);

// Route definitions — middleware first, then controller
interviewRouter.post(  "/",             aiRateLimit, validate(CreateInterviewSchema), createInterview);
interviewRouter.get(   "/",             getUserInterviews);
interviewRouter.get(   "/:id",          getInterview);
interviewRouter.post(  "/:id/answer",   answerRateLimit, validate(SubmitAnswerSchema), submitAnswer);

export { interviewRouter };
```

**Rules:**
- Route files only wire middleware and map HTTP verbs to controllers. No logic.
- Apply authentication middleware at the router level (`.use(authenticate)`) not per-route, unless some routes in the same router are public.
- Rate limiting middleware goes **before** validation, which goes **before** the controller.
- Never define inline arrow functions as route handlers — always import from the controller file.

---

## 11. Middleware

```typescript
// ✅ Standard middleware signature
import { Request, Response, NextFunction } from "express";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // ...
  next();
}

// ✅ Middleware factory (for parameterized middleware)
export function requirePlan(required: "premium") {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // ...
    next();
  };
}
```

**Rules:**
- Middleware lives in `src/shared/middleware/`.
- Each middleware is in its own file: `auth.middleware.ts`, `validate.ts`, etc.
- Always call `next()` or `next(err)` — never leave the request hanging.
- Never throw inside middleware — always use `next(new AppError(...))`.

---

## 12. Environment Configuration

All environment variables are **Zod-validated at startup** in `src/config/env.ts`. The app crashes immediately if a required env var is missing or invalid — no silent failures.

```typescript
// ✅ src/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV:            z.enum(["development", "test", "production"]).default("development"),
  PORT:                z.coerce.number().int().positive().default(4000),
  MONGODB_URI:         z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET:          z.string().min(32, "JWT_SECRET must be at least 32 chars"),
  JWT_EXPIRES_IN:      z.string().default("7d"),
  CORS_ORIGIN:         z.string().min(1).default("http://localhost:5173"),
  API_PREFIX:          z.string().default("/api/v1"),
  GROQ_API_KEY:        z.string().optional(),
  CLIENT_URL:          z.string().default("http://localhost:5173"),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error("❌ Invalid environment:", result.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = result.data;
```

**Rules:**
- Every new environment variable must be added to `env.ts` before being used anywhere.
- Access env vars only through `import { env } from "@/config/env"` — never use `process.env.X` directly in service or controller files.
- Sensitive keys (API keys, secrets) must have `.optional()` with a runtime guard in the service that uses them, not a hard `z.string().min(1)` that breaks the entire server on deploy without that key.
- Never commit `.env` files. Always maintain `server/.env.example`.

---

## 13. AI / LLM Service Rules

The AI service layer is intentionally loosely typed because LLM response shapes vary. These are the controlled exceptions to the strict typing rules.

```typescript
// ✅ src/ai/services/llm.service.ts
// Return type is Promise<any> — intentional, documented exception
export async function callGroqFast(prompt: string): Promise<any> { ... }
export async function callGroqSmart(prompt: string): Promise<any> { ... }
```

**Rules:**
- `callGroqFast` → `llama-3.1-8b-instant` — use for question generation, resume extraction (latency-sensitive)
- `callGroqSmart` → `llama-3.3-70b-versatile` — use for evaluation, report narrative (quality-sensitive)
- Always use `response_format: { type: "json_object" }` for structured outputs
- Always implement one retry with reduced temperature on JSON parse failure
- After calling the AI, **immediately validate and sanitise** the response before using it:
  ```typescript
  // ✅ Sanitise AI response before trusting it
  const raw = await callGroqFast(prompt);
  const question = typeof raw?.question === "string" ? raw.question : "";
  const topic    = typeof raw?.topic    === "string" ? raw.topic    : "General";
  ```
- **Never let AI compute numbers that should be computed in code** (averages, totals, ATS scores). AI computes narratives; code computes math.

---

## 14. Prompt Engineering Rules

All prompt builders live in `src/ai/prompts/` as `*.prompt.ts` files.

```typescript
// ✅ Pattern: builder function, typed input, string output
interface QuestionPromptInput {
  role: string;
  type: string;
  difficulty: string;
  techStacks?: string;
  // ...
}

export function buildQuestionPrompt(data: QuestionPromptInput): string {
  return `You are a professional interviewer...
  
  Respond ONLY with valid JSON: { "question": "...", "topic": "..." }`;
}
```

**Rules:**
- Prompt builder functions are pure functions (no side effects, no AI calls).
- Input interfaces are defined in the same file.
- Always end every prompt with the exact JSON schema the AI must return.
- Never call the AI inside a prompt builder — builders just return strings.
- If a prompt needs domain logic (e.g., `getDifficultyContext()`), use private helper functions in the same file.

---

## 15. Security Rules

- **JWT**: always store in `httpOnly; Secure; SameSite=None` cookies — never in response body for client storage.
- **Passwords**: always hash with `bcrypt` (min rounds: 12). Never log or return passwords.
- **Webhook signatures**: always verify HMAC signatures before processing webhook events.
- **Ownership guards**: always verify `resource.userId.toString() === req.user.userId` before allowing mutations.
- **Input validation**: every POST/PATCH body goes through Zod `validate()` middleware before the controller.
- **Rate limiting**: all auth routes → `authRateLimit`. All AI-calling routes → `aiRateLimit`. Answer submission → `answerRateLimit`.
- **Helmet**: always enabled on the Express app.
- **CORS**: always use an explicit allowlist from `env.CORS_ORIGIN`, never `*` in production.
- **No secrets in code**: API keys, secrets, and connection strings live only in `.env` files, accessed only through `env.ts`.

---

## 16. Logging

Use `Pino` (via `src/config/logger.ts`) for all server-side logging. Never use `console.log` in production code.

```typescript
// ✅ Correct
import { logger } from "@/config/logger";

logger.info({ userId, interviewId }, "Interview created");
logger.error({ err }, "Failed to call Groq API");

// ❌ Wrong
console.log("Interview created:", interviewId);
console.error(err);
```

**Rules:**
- `logger.info` for normal operations (created, completed, etc.)
- `logger.warn` for recoverable issues (rate limit hit, retrying)
- `logger.error` for failures (AI call failed, DB write failed)
- Always pass structured data as the first argument, message as the second.
- Never log passwords, tokens, API keys, or full request/response bodies.

---

## 17. Testing

Test files live in `__tests__/` folders inside each module:
```
src/modules/auth/__tests__/auth.service.test.ts
src/modules/auth/__tests__/auth.routes.test.ts
src/ai/services/__tests__/evaluation.service.test.ts
```

**Rules:**
- Use **Vitest** as the test runner.
- Use **Supertest** for route integration tests.
- Mock external services (Groq, Razorpay, MongoDB) in unit tests — never call real APIs in tests.
- Test file naming: `<module>.<layer>.test.ts`
- Minimum coverage targets:
  - Services: test every business rule branch (plan checks, ownership guards, error paths)
  - Routes: test success, auth failure (401), validation failure (400), plan gate (403)
  - AI services: test with mocked `callGroq` returning valid and invalid JSON

```typescript
// ✅ Vitest + Supertest integration test pattern
import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

describe("POST /api/v1/auth/register", () => {
  it("returns 201 and sets a cookie on success", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "Password123!" });

    expect(res.status).toBe(201);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.body.success).toBe(true);
  });
});
```

---

## 18. What NOT to Do

| Anti-pattern | Why | Rule |
|-------------|-----|------|
| `any` on declared types | Breaks type safety silently | Use explicit types everywhere |
| `catch (err: any)` | Unsafe — use `unknown` | Always `catch (err: unknown)` |
| Business logic in controller | Untestable, violates SRP | Move to service |
| DB queries in controller or service | Breaks layering | Move to repository |
| `process.env.X` directly in services | Bypasses validation | Always use `env.X` from `env.ts` |
| `console.log` in production code | Not structured, not queryable | Use `logger.*` from Pino |
| Throwing `new Error()` in services | Loses HTTP status context | Use `new AppError(msg, status)` |
| Inline route handler arrow functions | Untestable, unreadable | Always import from controller |
| Sharing a service's internal methods across modules | Tight coupling | Expose only via the service's public API |
| Storing secrets in code or git | Security breach | Only in `.env`, accessed via `env.ts` |
| AI computing averages or totals | Non-deterministic | Compute in code, use AI for narrative only |
| Mutating `req.body` or `req.params` directly | Unsafe | Destructure into typed locals first |
| Long service methods (>40 lines) | Hard to test, hard to read | Extract private helper methods |
