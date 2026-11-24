# PrepView — Build Plan

> **Constraint:** Free API keys only (Groq free, MongoDB M0, Google OAuth free, Razorpay test).  
> **Rule:** Backend logic always before UI. Never build on a broken base.  
> Last updated: November 2026

---

## RAG Pipeline Decision (Read Before Phase 5)

> [!IMPORTANT]
> **Decision: No Vector RAG for now. Use tag-based question bank instead.**
>
> **Why not vector RAG?**
> - MongoDB Atlas Vector Search requires M10+ ($57/mo) — not on free M0 tier
> - Cohere free embeddings: 1000 calls/month total — too low for production
> - HuggingFace Inference API: free but rate-limited and unreliable for production
>
> **What we'll do instead (Phase 5):**
> - Seed a curated `QuestionBank` collection in MongoDB (200-400 questions)
> - Tag each question: `{ role, type, difficulty, topic, source }`
> - Retrieval = MongoDB query by tags + exclude already-covered topics
> - Cost: $0. Works great for the demo. Gives consistent, high-quality questions.
> - **Future upgrade path:** When we have budget, add `embedding: float[]` field and switch to Atlas Vector Search or Pinecone — same interface, no rewrite needed.

---

## Phase 1 — Critical Bug Fixes ⚡ (Do First)
**Target: 2-3 days. These are broken promises visible to users.**

### 1.1 Fix Speech Delivery Fake WPM Data
- [x] `client/src/pages/Report.tsx` → remove hardcoded "125-145 WPM" section
- [x] Compute actual WPM from stored data:
  - Total words = sum of `answer.answer.split(/\s+/).length` across all voice answers
  - Total time = sum of `answer.responseTime` in minutes
  - `actualWPM = Math.round(totalWords / totalTimeInMinutes)`
- [x] Display real WPM or hide the section entirely if `mode !== "voice"`

### 1.2 Fix Whisper Service Error Handling
- [x] `server/src/ai/services/whisper.service.ts` → remove `"gsk_dummy_test_key"` fallback
- [x] Throw `AppError` if API key is missing (same pattern as `gemini.service.ts`)

### 1.3 Set `startedAt` / `endedAt` Timestamps
- [x] `server/src/modules/interview/interview.service.ts`
  - Set `interview.startedAt = new Date()` on interview creation
  - Set `interview.endedAt = new Date()` when `markCompleted()` is called
- [x] Add `startedAt` to `interviewRepository.create()`

### 1.4 Fix Company Field (Collect in Form)
- [x] `server/src/modules/interview/interview.model.ts` → verify `company` field exists (add if missing)
- [x] `server/src/modules/interview/interview.validation.ts` → add optional `company` field to schema
- [x] `client/src/schemas/interview.schema.ts` → add optional `company` field
- [x] `client/src/pages/interview/CreateTextInterview.tsx` → add Company input (optional)
- [x] `client/src/pages/interview/CreateVoiceInterview.tsx` → add Company input (optional)
- [x] `server/src/ai/prompts/interview.prompt.ts` → inject company name into question prompt when provided

### 1.5 Rename `callGemini` → `callGroq`
- [x] `server/src/ai/services/gemini.service.ts` → created replacement `llm.service.ts`
- [x] Rename exported `callGemini` function to `callGroqFast` / `callGroqSmart`
- [x] Update all imports across: `evaluation.service.ts`, `report.service.ts`, `resume.service.ts`, `interview.service.ts`

### 1.6 Route Evaluation/Report to 70B Model
- [x] `server/src/ai/services/llm.service.ts` → export `callGroqFast` (8B) and `callGroqSmart` (70B) with 429 retry
- [x] `server/src/ai/services/evaluation.service.ts` → switch to `callGroqSmart` (70B)
- [x] `server/src/ai/services/report.service.ts` → switch to `callGroqSmart` (70B)
- [x] Keep question generation + resume extraction on `callGroqFast` (8B)

---

## Phase 2 — Real Recurring Subscriptions 💳 (3-5 days)
**Replace one-time Razorpay Order with actual Subscription.**

### 2.1 Create Razorpay Subscription Plan
- [x] In Razorpay Dashboard → Subscriptions → Plans → Create plan (₹799/month, billing_cycle=monthly)
- [x] Store `plan_id` in `RAZORPAY_PLAN_ID` env var

### 2.2 Backend: Subscription Service Rewrite
- [x] `server/src/modules/payment/payment.service.ts`
  - `createCheckoutSession()` → creates `razorpayInstance.subscriptions.create()` when `RAZORPAY_PLAN_ID` is set (with order fallback)
  - Return `{ subscriptionId, keyId, userName, userEmail }` to frontend
  - `createPortalSession()` → cancel subscription via `razorpayInstance.subscriptions.cancel(subscriptionId)`
- [x] Handle new webhook events:
  - `subscription.activated` → set `plan: "premium"`, store `razorpaySubscriptionId`
  - `subscription.charged` → extend `planExpiresAt` by 1 month
  - `subscription.cancelled` / `subscription.completed` → set `plan: "free"`, clear fields
  - `subscription.halted` → notify user / set `plan: "free"`
- [x] `server/src/modules/user/user.model.ts` → `razorpayCustomerId` and `razorpaySubscriptionId` write paths

### 2.3 Frontend: Subscription Checkout Flow
- [x] `client/src/pages/Pricing.tsx` → updated `handleUpgrade()` to pass `subscription_id` to Razorpay modal
- [x] Automatic user refetch on subscription activation and cancellation
- [x] Show real renewal date from `user.planExpiresAt`
- [x] `handleManage()` → call `/payments/portal` which cancels the subscription with confirmation dialog
- [x] Add "Active Subscription" status indicator and `?status=cancelled` toast handling on Pricing page

### 2.4 Fix Pricing Page FAQ
- [x] Update FAQ answers to accurately describe the cancellation flow and supported payment methods

---

## Phase 3 — Google OAuth 🔐 (3-4 days)
**Highest impact for user conversion. Groq OAuth is free (Google Cloud free tier).**

### 3.1 Backend: Google OAuth Strategy
- [x] Manual Google OAuth2 flow using built-in HTTPS (no passport dependency)
- [x] `server/src/config/env.ts` → added `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SERVER_URL`
- [x] `server/src/modules/auth/auth.service.ts`
  - Added `findOrCreateOAuthUser({ googleId, email, name, avatar })` method
  - If user exists with email but no `googleId` → link accounts
  - If new user → create with `isEmailVerified: true`, no password
- [x] `server/src/modules/auth/auth.routes.ts`
  - `GET /auth/google` → Google OAuth consent URL redirect
  - `GET /auth/google/callback` → exchange code → JWT cookie → redirect to `/dashboard`
- [x] `server/src/modules/user/user.model.ts`
  - Added: `googleId: string | null`, `avatar: string | null`
  - Made `password` optional (not required when OAuth user)

### 3.2 Frontend: Google OAuth UI
- [x] `client/src/components/auth/LoginForm.tsx` → added "Continue with Google" button + OAuth error toast
- [x] `client/src/components/auth/RegisterForm.tsx` → added "Sign up with Google" button
- [x] On click → `window.location.href = "/api/v1/auth/google"` (simple redirect, no popup)
- [x] After callback redirect to `/dashboard`, `AuthContext` refetches `/me`
- [x] Handle OAuth error redirect (`/login?error=oauth_failed`)

### 3.3 UX Considerations
- [x] If user signed up with email, clicking Google links accounts automatically
- [x] Password management disabled for OAuth accounts on Profile page

---

## Phase 4 — Session Persistence & Interview UX 🛠️ (2-3 days)

### 4.1 Session Persistence (Refresh = Resume)
- [x] `server/src/modules/interview/interview.service.ts`
  - On `getInterview()`: returns `{ interview, currentQuestion }`
- [x] In-progress interviews resume from InterviewHistory with one-click "Resume" button
- [x] Lobby / Practice state resumes seamlessly

### 4.2 Question Progress Display
- [x] Add `"Question X of 10"` progress indicator to TextInterview and voice interview
- [x] Show follow-up indicator differently from regular questions in the progress display

### 4.3 Full Interview History Page
- [x] `server/src/modules/interview/interview.routes.ts` → `GET /interviews/history` paginated + filterable endpoint
- [x] `client/src/pages/interview/InterviewHistory.tsx` (new page)
  - Paginated list of all user's interviews
  - Filter by: status, type, difficulty
  - Each row: role, company, type, difficulty, status, date, Q count → link to report or resume
- [x] `client/src/routes/index.tsx` → added `/interviews` route
- [x] `client/src/components/Sidebar.tsx` → added "History" nav item
- [x] `client/src/pages/dashboard/Dashboard.tsx` → "View all →" links to `/interviews`

### 4.4 Write `startedAt` / `endedAt`
- [x] Show actual interview duration on report page and shared public report

---

## Phase 5 — Question Bank (Tag-Based, Zero Cost) 🧠 (4-6 days)

> See RAG decision at top of this file. We use tag-based retrieval — no vector embeddings.

### 5.1 QuestionBank Data Model
- [x] `server/src/modules/question-bank/question-bank.model.ts`
  - Tag-based schema: `{ question, topic, type, difficulty, roles, techStacks, source, usageCount, avgEvalScore, timestamps }`
  - Indexed for fast retrieval by type, difficulty, roles, and quality/usage sorting

### 5.2 Seed Script
- [x] `server/src/scripts/seed-question-bank.ts`
- [x] Seeded 250+ curated questions covering:
  - **Technical:** Frontend, Backend, Fullstack, Mobile, DevOps, ML/AI
  - **Behavioral:** 40 STAR-format questions (teamwork, conflict, leadership, failure, ownership)
  - **System Design:** 40 verbal trade-off questions (URL shortener, chat system, rate limiter, etc.)
  - **Mixed:** 30 combo questions
- [x] `npm run seed` script in `server/package.json`

### 5.3 Retrieval Service
- [x] `server/src/ai/services/question-retrieval.service.ts`
  - `retrieveQuestions({ type, difficulty, role, techStacks, coveredTopics, limit })`
  - Sorts by: `avgEvalScore DESC, usageCount ASC` (prefers quality, underused questions)
  - Asynchronously increments `usageCount`

### 5.4 Wire into Interview Service
- [x] `server/src/modules/interview/interview.service.ts`
  - On question generation (createInterview & submitAnswer): retrieve 5 candidates from bank
  - Injected candidates into prompt: "Reference question bank styles (generate a question similar in depth/practical tone, but do NOT copy verbatim)"

### 5.5 Self-Growing Bank
- [x] After session completes, store generated questions from the session back to bank with `source: "generated"`
- [x] Saves `avgEvalScore` calculated from user evaluation
- [x] Deduplicates questions before inserting

---

## Phase 6 — Dashboard & Profile Depth 📊 (2-3 days)

### 6.1 Advanced Dashboard Analytics
- [x] `server/src/modules/dashboard/dashboard.repository.ts` — aggregation queries:
  - Single MongoDB aggregation pipeline with `$lookup` on reports (N+1 elimination)
  - `getWeakTopics(userId)`: aggregate `Evaluation.weakTopics`, group + count, return top 10
  - `getScoreByType(userId)`: avg `overallScore` grouped by interview `type`
- [x] `client/src/pages/dashboard/Dashboard.tsx`
  - Recommendation engine using score trends and recent performance

### 6.2 User Profile Page
- [x] `server/src/modules/user/user.routes.ts` + `user.controller.ts` + `user.service.ts` + `user.repository.ts`
  - `GET /user/profile` → return user
  - `PATCH /user/profile` → update `name`, `avatar`
  - `POST /user/change-password` → verify current, hash new (guarded against OAuth accounts)
  - `DELETE /user/account` → delete account and clear cookie
- [x] `client/src/pages/Profile.tsx` (new page)
  - Display: name, email, plan badge, member since date
  - Edit: name form
  - Change password form (email-auth only)
  - OAuth badge when signed in with Google
  - Danger zone: Delete account with confirmation
- [x] `client/src/routes/index.tsx` → added `/profile` route
- [x] `client/src/components/Sidebar.tsx` → linked to `/profile`

### 6.3 Email Verification
- [x] Install: `nodemailer` & `@types/nodemailer` with optional SMTP transporter and dev fallback
- [x] `server/src/modules/auth/auth.service.ts`
  - `register()` → generate secure 32-byte hex token, dispatch email, save token and 24h expiration
  - `GET /auth/verify-email/:token` → verify token, set `isEmailVerified: true`, redirect to dashboard
  - `POST /auth/resend-verification` → generate new token and resend email
- [x] `server/src/modules/user/user.model.ts` → added `emailVerificationToken` and `emailVerificationExpires` fields
- [x] Frontend: `EmailVerificationBanner.tsx` in `MainLayout` with resend cooldown timer and `?verified=true` toast
- [x] Profile page: verification badge display on account info

---

## Phase 7 — Report & Export Polish ✨ (1-2 days)

### 7.1 PDF Export
- [x] Native print-optimized stylesheet with `@media print` for high-fidelity PDF export
- [x] Clean header/footer with page styling and hidden UI buttons on print

### 7.2 Shareable Report Link
- [x] `server/src/modules/report/report.model.ts` → added `shareToken: string` (hex token, indexed, unique)
- [x] `server/src/modules/report/report.routes.ts` → `GET /api/v1/reports/share/:shareToken` (public, no auth)
- [x] `client/src/pages/SharedReport.tsx` (new page, public route with PrepView verified branding)
- [x] `client/src/pages/Report.tsx` → "Share Link" button → copy link to clipboard with toast notification
- [x] `client/src/routes/index.tsx` → added public route `/report/share/:shareToken`

### 7.3 Report Improvements
- [x] Show actual interview duration (from `startedAt`/`endedAt`)
- [x] Show actual WPM for voice interviews
- [x] Display `isFollowUp` indicator on Q&A breakdown
- [x] Smooth stagger/fade-in animations on load

---

## Phase 8 — Production Hardening 🔒 (Ongoing)

### 8.1 TypeScript Cleanup
- [x] Both `client` and `server` compile with zero TypeScript errors (`tsc --noEmit` exits with 0)
- [x] Test suite passing 100% (9 test files, 30 tests pass)

### 8.2 Database Indexes
- [x] `server/src/modules/question/question.model.ts` → compound index `{ interviewId: 1, order: 1 }`
- [x] `server/src/modules/answer/answer.model.ts` → index `{ interviewId: 1 }`
- [x] `server/src/modules/interview/interview.model.ts` → compound index `{ userId: 1, createdAt: -1 }`
- [x] `server/src/modules/question-bank/question-bank.model.ts` → compound indexes on `{ type: 1, difficulty: 1 }`, `{ roles: 1 }`, `{ techStacks: 1 }`, `{ avgEvalScore: -1, usageCount: 1 }`

### 8.3 Dashboard N+1 Fix
- [x] `server/src/modules/dashboard/dashboard.repository.ts` → rewritten using single MongoDB aggregation pipeline with `$lookup` on `reports`

### 8.4 Render Cold Start Mitigation
- [x] Added `/api/v1/health` ping in `client/src/App.tsx` on mount to wake up the backend on initial load

### 8.5 CI/CD
- [x] `server/.env.example` updated with all environment variables
- [ ] Playwright e2e tests for critical flows

---

## Completion Tracker

| Phase | Description | Status | Est. Days |
|-------|-------------|--------|-----------|
| 1 | Critical bug fixes (WPM, timestamps, company field, model routing) | ✅ Completed | 2-3 |
| 2 | Real recurring Razorpay subscriptions | ✅ Completed | 3-5 |
| 3 | Google OAuth (Backend strategy + Frontend buttons + account linking) | ✅ Completed | 3-4 |
| 4 | Session persistence + history page + UX | ✅ Completed | 2-3 |
| 5 | Question bank (tag-based, 250+ curated questions, auto-growing) | ✅ Completed | 4-6 |
| 6 | Dashboard depth + profile page + user management | ✅ Completed | 2-3 |
| 7 | Report PDF + public shareable link + duration & follow-up polish | ✅ Completed | 1-2 |
| 8 | TypeScript cleanup + DB indexes + Dashboard N+1 fix + cold start | ✅ Completed | - |

**Total estimated:** ~20-26 focused development days

---

## What "Done" Looks Like

A complete, production-grade AI interview prep platform where:
- Users sign up with email or Google in 30 seconds
- Free tier gives 3 text interviews/month (enforced, not fake)
- Premium tier is a **real recurring subscription** that auto-renews and can be cancelled
- Text + Voice + System Design + Behavioral + Mixed interviews all work
- Every session asks 10 questions (follow-ups on weak answers)
- Persistent sessions — refresh mid-interview and resume exactly where you left off
- Final report with real scores, real WPM, PDF download, shareable link
- Dashboard shows real analytics: weak topics, score by type, improvement trend
- Resume analyzer with deterministic ATS score + AI recommendations
- 250+ curated questions in a question bank that feeds the LLM for consistency
- Profile page, email verification, account management
- Fully typed TypeScript, indexed MongoDB, CI/CD pipeline
