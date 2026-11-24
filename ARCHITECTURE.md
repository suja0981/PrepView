# PrepView — Architecture Reference

> Technical architecture document. Update when adding new modules, routes, or data models.  
> Last updated: November 2026

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENT (Vercel)                         │
│                                                                │
│   React 19 · TypeScript · Vite · Tailwind v4 · Shadcn/ui      │
│   TanStack Query · React Hook Form · Zod · Recharts            │
│   Framer Motion · Lucide Icons                                 │
│                                                                │
│   /api/* ──► Reverse proxied to backend via vercel.json        │
└──────────────────────────┬─────────────────────────────────────┘
                           │ REST (JSON + httpOnly cookies)
┌──────────────────────────▼─────────────────────────────────────┐
│                     SERVER (Render)                            │
│                                                                │
│   Node.js · Express 5 · TypeScript · Pino logging             │
│   Helmet · CORS · Rate Limiting · Cookie-Parser                │
│   Zod validation · JWT auth middleware                         │
└───────┬─────────────┬──────────────┬───────────────────────────┘
        │             │              │
        ▼             ▼              ▼
  MongoDB Atlas   Groq API      Razorpay
  (Free M0)       (Free tier)   (Payments)
                  Llama 3.1 8B
                  Llama 3.3 70B
                  Whisper v3
```

---

## Request Flow — Interview Session

```
User clicks "Start Interview"
        │
        ▼
POST /api/v1/interviews          ← CreateInterviewSchema validated
        │
        ├── Plan enforcement (voice/hard/system_design → premium check)
        ├── Free limit check (3 text/month)
        ├── interviewRepository.create()      → MongoDB
        ├── buildQuestionPrompt()             → Groq (8B, JSON output)
        ├── questionRepository.create()       → MongoDB
        └── return { interview, question }
                │
                ▼
User answers the question
                │
                ▼
POST /api/v1/interviews/:id/answer     ← SubmitAnswerSchema validated
        │
        ├── Ownership check (interview.userId === req.user.userId)
        ├── Idempotency check (no duplicate answer for question)
        ├── answerRepository.create()
        ├── evaluateAnswer()           → Groq (70B planned, 8B currently)
        ├── evaluationRepository.create()
        ├── interview.questionsAsked++
        │
        ├── IF questionsAsked >= MAX_QUESTIONS (10):
        │       ├── generateInterviewReport()   → avg scores (code) + narrative (Groq 70B)
        │       ├── reportRepository.create()
        │       ├── interviewRepository.markCompleted()
        │       └── return { completed: true, report }
        │
        └── ELSE:
                ├── isWeakAnswer? (overallScore < threshold)
                ├── followUpsRemaining > 0?
                ├── buildQuestionPrompt() with follow-up context
                └── return { completed: false, evaluation, nextQuestion, isFollowUp }
```

---

## Module Map — Backend

```
server/src/
├── app.ts                        Express app factory
├── server.ts                     HTTP server entry point
│
├── config/
│   ├── env.ts                    Zod-validated env schema
│   ├── database.ts               Mongoose connect
│   ├── cors.ts                   CORS allowlist
│   └── logger.ts                 Pino logger instance
│
├── ai/
│   ├── services/
│   │   ├── gemini.service.ts     ⚠️ Groq gateway (rename to llm.service.ts)
│   │   ├── evaluation.service.ts Calls buildEvaluationPrompt → callGemini
│   │   ├── report.service.ts     Avg scores (code) + narrative (AI)
│   │   ├── resume.service.ts     Extract → ATS score (code) → feedback (AI)
│   │   ├── ats-score.service.ts  Deterministic skill overlap math
│   │   ├── skill-taxonomy.ts     Skill normalization + alias matching
│   │   └── whisper.service.ts    Groq Whisper audio transcription
│   └── prompts/
│       ├── interview.prompt.ts   Question gen + evaluation prompts
│       ├── report.prompt.ts      Report narrative prompt
│       ├── resume-extraction.prompt.ts  Structured skill extraction
│       └── resume-feedback.prompt.ts    Human-readable feedback
│
├── modules/
│   ├── auth/                     Register, login, logout, /me
│   ├── interview/                Create, get, answer, report, details
│   ├── answer/                   Answer model + repository
│   ├── question/                 Question model + repository
│   ├── evaluation/               Evaluation model + repository
│   ├── report/                   Report model + repository
│   ├── dashboard/                Aggregated stats for dashboard
│   ├── resume/                   PDF/TXT upload + AI analysis
│   ├── payment/                  Razorpay checkout, verify, webhook
│   ├── user/                     User CRUD, profile updates
│   └── health/                   Health check endpoint
│
└── shared/
    ├── middleware/
    │   ├── auth.middleware.ts         JWT cookie verification
    │   ├── validate.ts                Zod body validator
    │   ├── requirePlan.middleware.ts  Premium gate (unused on routes)
    │   ├── rate-limit.middleware.ts   AI, answer, auth rate limits
    │   ├── error-handler.middleware.ts
    │   └── not-found.middleware.ts
    ├── errors/app-error.ts
    └── utils/ (async-handler, jwt, password, json)
```

---

## Module Map — Frontend

```
client/src/
├── App.tsx                       Root — QueryClientProvider + RouterProvider
├── main.tsx                      Vite entry
│
├── api/                          Axios wrappers (typed)
│   ├── axios.ts                  Axios instance (baseURL, withCredentials)
│   ├── auth.api.ts               register, login, logout, getMe
│   ├── interview.api.ts          createInterview, submitAnswer, getInterview, etc.
│   ├── dashboard.api.ts          getDashboardStats
│   ├── resume.api.ts             analyzeResume (FormData)
│   └── payment.api.ts            createCheckoutSession, verifyPayment, createPortalSession
│
├── context/
│   ├── AuthContext.tsx            User state, login/logout handlers
│   └── ThemeContext.tsx           Dark/light mode
│
├── hooks/
│   ├── useAuth.ts                 TanStack Query wrapper for /me
│   ├── useInterviewSession.ts     Voice interview state machine
│   ├── useInterview.ts            TanStack Query for interview CRUD
│   ├── useDashboard.ts            TanStack Query for dashboard stats
│   ├── useSpeechRecognition.ts    Web Speech API (continuous + auto-restart)
│   ├── useAudioRecorder.ts        MediaRecorder for Whisper fallback
│   ├── useSpeechSynthesis.ts      TTS hook (browser speech synthesis)
│   └── useTimer.ts               Per-question response time tracking
│
├── pages/
│   ├── Landing.tsx                Public marketing page
│   ├── Pricing.tsx                Plan comparison + Razorpay checkout
│   ├── Report.tsx                 Final interview report
│   ├── ResumeAnalyzer.tsx         Resume vs JD analysis
│   ├── auth/ (Login, Register)
│   ├── dashboard/ (Dashboard, StatCard, ScoreChart, RecentInterviews)
│   └── interview/
│       ├── PracticePage.tsx        Interview mode selection hub
│       ├── CreateTextInterview.tsx Text interview config form
│       ├── CreateVoiceInterview.tsx Voice interview config form
│       ├── Interview.tsx           Session router (text vs voice)
│       └── TextInterview.tsx       Text interview active session
│
├── routes/
│   ├── index.tsx                  createBrowserRouter config
│   ├── ProtectedRoute.tsx         Auth guard → /login
│   └── PublicRoute.tsx            Redirect logged-in users → /dashboard
│
└── components/
    ├── Navbar.tsx · Sidebar.tsx · LandingNav.tsx
    └── ui/ (Shadcn: button, card, badge, form, select, table, etc.)
```

---

## Data Models (MongoDB)

### User
```typescript
{
  name: string
  email: string (unique, lowercase)
  password: string (bcrypt, select:false)
  role: "ADMIN" | "USER"
  isEmailVerified: boolean         // ⚠️ Never set to true yet
  plan: "free" | "premium"
  razorpayCustomerId: string | null
  razorpaySubscriptionId: string | null
  planExpiresAt: Date | null
  createdAt, updatedAt
}
```

### Interview
```typescript
{
  userId: ObjectId (ref: User)
  role: string                     // e.g. "Frontend Software Engineer"
  type: "technical" | "behavioral" | "system_design" | "mixed"  // ⚠️ "dsa" missing
  mode: "voice" | "text"
  techStacks: string | null        // comma-separated
  difficulty: "easy" | "medium" | "hard"
  status: "pending" | "in_progress" | "completed"
  questionsAsked: number           // 0-10
  followUpsRemaining: number       // starts at 2
  startedAt: Date                  // ⚠️ Never written
  endedAt: Date                    // ⚠️ Never written
  createdAt, updatedAt
}
```

### Question
```typescript
{
  interviewId: ObjectId (ref: Interview)
  question: string
  topic: string                    // short label (e.g. "React hooks")
  difficulty: "easy" | "medium" | "hard"
  order: number                    // 1-indexed question number
  createdAt, updatedAt
}
```

### Answer
```typescript
{
  interviewId: ObjectId (ref: Interview)
  questionId: ObjectId (ref: Question)
  answer: string
  responseTime: number             // seconds
  createdAt, updatedAt
}
```

### Evaluation
```typescript
{
  answerId: ObjectId (ref: Answer, unique)
  interviewId: ObjectId (ref: Interview, indexed)
  technicalAccuracy: 0-10
  reasoning: 0-10
  communication: 0-10
  overallScore: 0-10
  feedback: string                 // 2-3 sentence AI feedback
  weakTopics: string[]             // topics where candidate struggled
  createdAt, updatedAt
}
```

### Report
```typescript
{
  interviewId: ObjectId (ref: Interview, unique)
  overallScore: 0-10              // average of all evaluations (computed in code)
  technicalScore: 0-10
  communicationScore: 0-10
  reasoningScore: 0-10
  strengths: string[]             // AI-generated
  improvements: string[]          // AI-generated
  summary: string                 // AI-generated narrative
  createdAt, updatedAt
}
```

### PaymentLog
```typescript
{
  userId: ObjectId (ref: User, indexed)
  eventId: string (unique)        // idempotency key
  type: string                    // e.g. "payment.captured"
  status: "success" | "failed" | "ignored"
  meta: Mixed                     // extra debug fields
  createdAt, updatedAt
}
```

---

## API Routes

### Auth
```
POST   /api/v1/auth/register      { name, email, password }
POST   /api/v1/auth/login         { email, password }
POST   /api/v1/auth/logout
GET    /api/v1/auth/me            → { user }
GET    /api/v1/auth/google        → redirect (Phase 3)
GET    /api/v1/auth/google/callback → (Phase 3)
```

### Interviews
```
POST   /api/v1/interviews                    Create session + gen Q1
GET    /api/v1/interviews                    List user's interviews
GET    /api/v1/interviews/:id               Get session + current question
POST   /api/v1/interviews/:id/answer        Submit answer, get eval + next Q
GET    /api/v1/interviews/:id/report        Get final report (scores only)
GET    /api/v1/interviews/:id/details       Full Q&A + evaluations + report
POST   /api/v1/interviews/transcribe        Audio → Whisper text (multipart)
```

### Dashboard
```
GET    /api/v1/dashboard          Aggregated stats for the logged-in user
```

### Resume
```
POST   /api/v1/resume/analyze     multipart: { resume: File, jobDescription: string }
```

### Payments
```
POST   /api/v1/payments/checkout  Create Razorpay order/subscription
POST   /api/v1/payments/verify    Verify HMAC signature + upgrade user
POST   /api/v1/payments/portal    Manage/cancel subscription
POST   /api/v1/payments/webhook   Razorpay webhook (raw body)
```

### User (Planned)
```
GET    /api/v1/user/profile
PATCH  /api/v1/user/profile       { name }
POST   /api/v1/user/change-password
DELETE /api/v1/user/account
```

### Health
```
GET    /api/v1/health
```

---

## AI Pipeline Detail

### Question Generation
```
buildQuestionPrompt(role, type, difficulty, techStacks, mode,
                    previousQuestion, previousAnswer, coveredTopics,
                    isFollowUp, weakestDimension)
        │
        ▼
callGroq("llama-3.1-8b-instant", response_format: json_object)
        │
        ▼
{ question: string, topic: string }
```

### Answer Evaluation
```
buildEvaluationPrompt(question, answer, role, type, difficulty, mode)
        │
        ▼
callGroq("llama-3.3-70b-versatile", response_format: json_object)   ← PLANNED
        │
        ▼
{ technicalAccuracy, reasoning, communication, overallScore, feedback, weakTopics }
```

### Report Generation
```
Avg scores = code arithmetic (not AI)  ← deterministic
        │
buildReportNarrativePrompt(role, difficulty, pre-computed scores, all Q&A)
        │
        ▼
callGroq("llama-3.3-70b-versatile", response_format: json_object)   ← PLANNED
        │
        ▼
{ summary, strengths, improvements }

Final report = { avgScores + narrative }
```

### Resume Analysis
```
buildExtractionPrompt(resumeText, jobDescription)
        │
        ▼
callGroq("llama-3.1-8b-instant")
        │
        ▼
ResumeExtraction { candidateSkills, jdRequiredSkills, jdPreferredSkills,
                   inferredRole, seniorityLevel, yearsOfExperience }
        │
calculateAtsScore(extraction)      ← deterministic code, no AI
        │
        ▼
{ score: 0-100, matchedSkills[], missingSkills[] }
        │
buildFeedbackPrompt(extraction, matchedSkills, missingSkills)
        │
        ▼
callGroq("llama-3.1-8b-instant")
        │
        ▼
{ summary, suggestions, talkingPoints, possibleQuestions }
```

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Auth | JWT in `httpOnly; Secure; SameSite=None` cookie |
| CORS | Explicit allowlist (`CORS_ORIGIN` env var) |
| Input validation | Zod schemas on all POST bodies |
| Rate limiting | 10/15min (auth), 20/hr (AI), 30/min (answers) |
| Security headers | Helmet (XSS, HSTS, nosniff, etc.) |
| Payment integrity | HMAC SHA-256 signature verification (Razorpay) |
| SQL injection | N/A — Mongoose ODM |
| Brute force | Rate limit on `/auth/login` and `/auth/register` |

---

## Deployment Architecture

```
┌────────────────────┐     ┌────────────────────┐
│   Vercel (Free)    │     │   Render (Free)     │
│   client/ (React)  │────▶│   server/ (Express) │
│                    │     │   (spins down on    │
│   vercel.json      │     │    inactivity)      │
│   /api/* → proxy   │     └────────┬────────────┘
└────────────────────┘              │
                                    │
                          ┌─────────▼─────────┐
                          │  MongoDB Atlas M0  │
                          │  (512MB, free)     │
                          └───────────────────┘
```

**Docker:** `docker-compose.yml` for local full-stack dev (server + client + MongoDB)

---

## Future Architecture (Phase 4+ — When Budget Allows)

### RAG Question Bank (Deferred — Needs Paid Vector DB)
```
Question Bank (MongoDB)
  { question, topic, type, difficulty, role, tags[], embedding: float[] }

On interview start:
  User profile → build query vector (via HuggingFace/Cohere free embeddings)
  Vector search → retrieve 20 relevant questions
  Filter by: type, difficulty, exclude covered topics
  Top 3-5 injected into LLM prompt as "example questions"

Self-growing: Store generated questions back with source: "generated"
```

**Free Option (Limited):** Cohere free tier (1000 req/month) for embeddings + store in MongoDB as arrays + cosine similarity in JS. Works for demos, not production scale.

**Better Option (When Paid):** MongoDB Atlas Vector Search on M10+ or Pinecone Starter ($70/mo).

> **Current Decision:** Use MongoDB text indexes + tag-based retrieval. Zero cost, good enough for <10K questions. Migrate to vector search when revenue supports it.
