# PrepView — Project Profile & CV Reference

> **Purpose:** Master project profile for resume / CV bullet points.  
> **Target roles:** Full-Stack AI Engineer · Backend Node.js Engineer · Full-Stack MERN Engineer · AI + MERN Engineer  
> **Live:** [prepview.vercel.app](https://prepview.vercel.app) | **Stack:** MERN + AI (Groq/LLaMA/Whisper) | **Solo project**

---

## What PrepView Is

PrepView is a **production-deployed, full-stack AI mock interview platform** that lets candidates practice technical, behavioral, system design, and mixed interviews — by voice or text. The platform uses a dual-LLM routing strategy (fast 8B for question generation, smart 70B for evaluation), applies deterministic ATS scoring for resume analysis, and enforces a freemium model with Razorpay payment integration.

---

## Final Vision (Complete Platform — Including Planned Phases)

> This section reflects the **fully-shipped + fully-planned** product, as it would exist at the end of all build phases. Use this to describe the project in a resume context.

A complete, production-grade AI interview prep platform where:

- Users sign up with **email/password or Google OAuth** in under 30 seconds
- **Free tier:** 3 text interviews/month (enforced server-side, not client-side)
- **Premium tier:** real recurring Razorpay subscription (₹799/month), auto-renewing, cancellable via billing portal
- **5 interview modes:** Technical, Behavioral, System Design, Mixed, DSA (verbal/whiteboard style)
- **2 delivery modes:** Text and Voice (browser Speech API + Groq Whisper fallback)
- Each session asks exactly **10 questions** with up to 2 AI-triggered follow-ups on weak answers
- Every answer is evaluated on **4 AI-scored dimensions:** Technical Accuracy, Reasoning, Communication, Overall (0–10)
- **Session persistence:** refresh mid-interview and resume exactly where you left off
- Final report with real scores, radial charts, real WPM (voice), downloadable **PDF**, and a **shareable public link**
- **Dashboard analytics:** score trends over time, weak topic breakdown, score-by-type breakdown
- **Resume Analyzer:** PDF/TXT upload → deterministic ATS score + AI narrative → matched/missing skills + likely interview questions
- A self-growing **Question Bank** (250+ curated questions) that feeds LLM prompts for consistency
- **Profile page**, email verification, and account management
- Fully typed TypeScript, indexed MongoDB collections, CI/CD with GitHub Actions

---

## Current Status (November 2026)

| Feature                                                     | Status     |
| ----------------------------------------------------------- | ---------- |
| Email/password auth (JWT + httpOnly cookies)                | ✅ Shipped |
| Text interview engine (10 Q's + follow-ups)                 | ✅ Shipped |
| Voice interview engine (Browser STT + Whisper fallback)     | ✅ Shipped |
| Per-answer AI evaluation (4-dimension)                      | ✅ Shipped |
| Per-question feedback panel                                 | ✅ Shipped |
| Final report with radial charts + Q&A breakdown             | ✅ Shipped |
| Resume Analyzer (ATS score + AI recommendations)            | ✅ Shipped |
| Dashboard (score history, stats, recent interviews)         | ✅ Shipped |
| Freemium plan enforcement (3 text/month free)               | ✅ Shipped |
| Razorpay payment integration (checkout + webhook)           | ✅ Shipped |
| Docker + Vercel + Render deployment                         | ✅ Shipped |
| Rate limiting + Helmet security headers                     | ✅ Shipped |
| Company-targeted question generation                        | ✅ Shipped |
| Dual-model LLM routing (8B fast / 70B smart)                | ✅ Shipped |
| Real WPM calculation (voice interviews)                     | ✅ Shipped |
| Skill taxonomy + fuzzy ATS matching                         | ✅ Shipped |
| Google OAuth                                                | 🔲 Planned |
| Real recurring Razorpay subscriptions                       | 🔲 Planned |
| Session persistence (refresh = resume)                      | 🔲 Planned |
| Full interview history page (paginated + filterable)        | 🔲 Planned |
| Question Bank (250+ curated questions, tag-based retrieval) | 🔲 Planned |
| Advanced dashboard analytics (weak topics, score-by-type)   | 🔲 Planned |
| PDF export + shareable report link                          | 🔲 Planned |
| Profile page + email verification                           | 🔲 Planned |
| CI/CD pipeline (GitHub Actions)                             | 🔲 Planned |

---

## Tech Stack (Complete Reference)

### Frontend

| Layer        | Technology                                                         |
| ------------ | ------------------------------------------------------------------ |
| Framework    | React 19, TypeScript, Vite                                         |
| Styling      | Tailwind CSS v4, Shadcn/ui, Radix UI                               |
| State / Data | TanStack Query v5, Zustand, React Hook Form                        |
| Validation   | Zod (shared schemas)                                               |
| Charts       | Recharts                                                           |
| Animation    | Framer Motion                                                      |
| HTTP         | Axios (typed wrappers per module)                                  |
| Voice        | Web Speech API (SpeechRecognition, SpeechSynthesis), MediaRecorder |
| Routing      | React Router v7 (file-based, createBrowserRouter)                  |
| Testing      | Vitest, Testing Library, Playwright (e2e)                          |
| Deployment   | Vercel (Hobby) — `/api/*` reverse-proxied to backend               |

### Backend

| Layer         | Technology                                                                    |
| ------------- | ----------------------------------------------------------------------------- |
| Runtime       | Node.js, Express 5, TypeScript                                                |
| Database      | MongoDB (Mongoose ODM), MongoDB Atlas M0                                      |
| Auth          | JWT (httpOnly + Secure + SameSite=None cookies), bcrypt                       |
| AI            | Groq SDK — Llama 3.1 8B (fast), Llama 3.3 70B (smart), Whisper Large v3 Turbo |
| Payments      | Razorpay (orders, webhooks, HMAC verification)                                |
| File handling | Multer (PDF/audio upload), pdf-parse                                          |
| Logging       | Pino + pino-http                                                              |
| Security      | Helmet, CORS allowlist, express-rate-limit, Zod validation                    |
| Testing       | Vitest, Supertest                                                             |
| Deployment    | Render (Free tier)                                                            |
| Containers    | Docker + docker-compose (local dev)                                           |
| CI/CD         | GitHub Actions (lint + typecheck + test)                                      |

---

## Architecture Overview

```
Client (Vercel)                 Server (Render)
React 19 / TypeScript ──REST──► Node.js / Express 5 / TypeScript
Vite / Tailwind v4             Pino logging / Helmet / CORS
TanStack Query                 JWT httpOnly cookies
Recharts / Framer Motion       Zod validation
                                    │
                        ┌───────────┼───────────┐
                        ▼           ▼           ▼
                  MongoDB Atlas  Groq API   Razorpay
                  (Free M0)      Llama 8B   (Payments)
                                 Llama 70B
                                 Whisper v3
```

### Core Interview Flow (Backend)

```
POST /interviews  → Plan check → Free limit check → Create session
                 → Groq 8B: generate Q1 (JSON output) → Return question

POST /interviews/:id/answer
  → Ownership check → Idempotency guard → Save answer
  → Groq 70B: evaluate (4 dimensions, JSON output) → Save evaluation
  → questionsAsked >= 10?
      YES → Groq 70B: narrative report → markCompleted → return report
      NO  → isWeakAnswer? → 2 follow-up budget? → Groq 8B: next Q
          → Track covered topics (deduplication) → return next question
```

### AI Pipeline

| Task                    | Model                  | Routing Rationale                                            |
| ----------------------- | ---------------------- | ------------------------------------------------------------ |
| Question generation     | Llama 3.1 8B           | Low latency, high volume (1 per answer cycle)                |
| Answer evaluation       | Llama 3.3 70B          | Quality-sensitive: 4-dim scores + feedback                   |
| Final report narrative  | Llama 3.3 70B          | Quality-sensitive: strengths/improvements summary            |
| Resume skill extraction | Llama 3.1 8B           | Structured JSON extraction, speed matters                    |
| Resume feedback         | Llama 3.1 8B           | Narrative suggestions, low stakes                            |
| Voice transcription     | Whisper Large v3 Turbo | Audio → text, used as fallback if browser STT < 20 words     |
| ATS scoring             | Deterministic code     | Reproducibility — same input = same score, no AI variability |

---

## Key Engineering Decisions

### 1. Dual-Model LLM Routing

Two Groq models serve different quality/latency trade-offs:

- `llama-3.1-8b-instant` → question generation, resume extraction (low latency, high volume)
- `llama-3.3-70b-versatile` → answer evaluation, report narrative (highest quality, used sparingly)

Both share a single gateway (`llm.service.ts`) with 429 retry logic and JSON fence-stripping.

### 2. Deterministic ATS Scoring (not AI)

AI-based scoring is non-deterministic — the same resume refreshed twice gives different scores, breaking UX trust. PrepView's ATS scorer is pure code:

- Skill taxonomy layer normalizes aliases (`ReactJS` → `React`, `nodejs` → `Node.js`)
- Token containment matching handles phrase variants
- Weighted formula: Required skills = 80%, Preferred = 20%
- AI is used only for the narrative (suggestions, talking points, interview questions)

### 3. httpOnly Cookie JWT Auth

JWTs stored in `httpOnly; Secure; SameSite=None` cookies. The frontend never touches the token. This eliminates the entire XSS-via-localStorage attack class.

### 4. Follow-Up Engine

Every answer triggers a weak-answer check (`overallScore < threshold`). If weak and follow-up budget remains (2 per session), the system asks a targeted follow-up probing the specific weakest dimension (Technical Accuracy, Reasoning, or Communication) rather than a generic re-ask.

### 5. Topic Deduplication

The backend tracks all covered topics per session (`coveredTopics[]`) and injects them into every subsequent question prompt, preventing the LLM from repeating topics across a 10-question session.

### 6. Voice with Whisper Fallback

Primary voice input = Web Speech API (SpeechRecognition). If browser STT produces < 20 words (mic gaps, technical terms), audio blob is uploaded to Groq Whisper for a higher-accuracy transcript — longer transcript wins.

### 7. Plan Enforcement on the Backend (Not Client)

Free/premium gates are enforced server-side:

- Voice mode → premium only
- System Design → premium only
- Hard difficulty → premium only
- 3 text interviews/month → enforced with MongoDB calendar-month count query

Client-side checks exist only for UX — they can be bypassed; the backend cannot.

### 8. Tag-Based Question Bank (Phase 5)

MongoDB Atlas Vector Search requires a paid M10+ tier ($57/mo). Instead: a curated `QuestionBank` collection (250+ questions) with `{ role, type, difficulty, topic, source }` tags. Retrieval = MongoDB query by tags + topic exclusion. Future upgrade path: add `embedding: float[]` field and switch to vector search with zero rewrite needed.

---

## Security Architecture

| Layer             | Implementation                                                          |
| ----------------- | ----------------------------------------------------------------------- |
| Auth tokens       | JWT in `httpOnly; Secure; SameSite=None` cookies                        |
| CORS              | Explicit allowlist via `CORS_ORIGIN` env var                            |
| Input validation  | Zod schemas on all POST bodies (server-side)                            |
| Rate limiting     | 10 req/15min (auth), 20 req/hr (AI), 30 req/min (answers)               |
| Security headers  | Helmet (XSS, HSTS, nosniff, referrer, etc.)                             |
| Payment integrity | HMAC-SHA256 signature verification (Razorpay)                           |
| Brute force       | Rate limit on `/auth/login` + `/auth/register`                          |
| Idempotency       | Duplicate answer submission blocked at DB level (409 guard)             |
| Ownership         | Every interview operation checks `interview.userId === req.user.userId` |

---

## Data Models (MongoDB)

6 core collections: **User, Interview, Question, Answer, Evaluation, Report** + PaymentLog

```
User ──< Interview ──< Question
                 ──< Answer ──< Evaluation
                 ──< Report
```

**Evaluation schema** (what AI returns per answer):

```typescript
{ technicalAccuracy: 0-10, reasoning: 0-10, communication: 0-10,
  overallScore: 0-10, feedback: string, weakTopics: string[] }
```

**Report schema** (final, generated after Q10):

```typescript
{ overallScore: 0-10, technicalScore: 0-10, communicationScore: 0-10,
  reasoningScore: 0-10, strengths: string[], improvements: string[], summary: string }
```

---

## Resume Bullet Points (Resume-Ready)

> These are crafted for **Full-Stack AI Engineer**, **Backend Node.js**, and **MERN + AI** roles.  
> Pick 4–6 that best match the JD. Mix technical depth with measurable impact.

---

### 🏗️ Architecture & System Design

- Architected a **production full-stack AI interview SaaS** (MERN + Groq LLMs) with freemium monetization, deployed on Vercel + Render with Docker local dev; serves end-to-end interview sessions from auth through AI evaluation to final PDF-ready report
- Designed a **dual-LLM routing strategy** routing latency-sensitive paths (question generation) to Llama 3.1 8B and quality-sensitive paths (answer evaluation, report narrative) to Llama 3.3 70B Versatile, reducing per-session AI costs while maintaining evaluation quality
- Engineered a **multi-collection MongoDB document model** (6 collections: User, Interview, Question, Answer, Evaluation, Report) with compound indexes and in-memory O(1) lookup maps for join-heavy interview detail queries, eliminating N+1 patterns in report generation
- Built a **modular Express 5 backend** in TypeScript with clean separation of AI services, domain modules, shared middleware, and config layers — each module independently testable with Vitest + Supertest integration tests

---

### 🤖 AI / LLM Engineering

- Implemented a **multi-stage AI interview pipeline** using Groq SDK: context-aware question generation (role, difficulty, company, covered topics) → per-answer 4-dimension evaluation → final report narrative synthesis — all with structured JSON output and automatic retry on 429 rate limits
- Built a **follow-up targeting engine**: detects weak answers (score below threshold), identifies the lowest-scoring dimension (Technical Accuracy vs. Reasoning vs. Communication), and generates a dimension-specific follow-up question rather than a generic re-ask, improving learning signal per session
- Designed topic deduplication across a 10-question session by tracking `coveredTopics[]` and injecting exclusion lists into every subsequent LLM prompt, preventing repeated questions over a full session
- Implemented **Groq Whisper voice transcription** as a fallback: primary path uses browser Web Speech API; if STT word count falls below 20 (technical term dropout), audio blob is uploaded to Whisper Large v3 Turbo and the longer, higher-accuracy transcript wins
- Built a **deterministic ATS scoring engine** (0–100) using weighted skill-overlap math (required skills 80%, preferred 20%) with a skill taxonomy layer normalizing aliases (`ReactJS → React`, `nodejs → Node.js`, `restful api → rest api`); AI is used only for narrative feedback, ensuring reproducible scores on page refresh
- Engineered **prompt engineering patterns** for 5 interview types (Technical, Behavioral, System Design, Mixed, DSA), role-specific depth hints (ML, DevOps, QA, Mobile, etc.), and difficulty calibration (junior/mid/senior engineer bars)

---

### 🎙️ Voice & Real-Time Features

- Implemented a **browser-native voice interview state machine** (`useInterviewSession` hook) with 5 states (idle → listening → submitting → feedback → completed), MediaRecorder audio capture, Web Speech API live transcript, per-question response timer, and Whisper cloud fallback — all orchestrated without any third-party real-time SDK
- Built dual speech input strategy: **Web Speech API** for low-latency live transcript + **MediaRecorder** blob capture for Groq Whisper fallback; transcript quality guard selects the longer/more accurate of the two before submission

---

### 🔐 Auth & Security

- Implemented **XSS-resistant JWT authentication** using `httpOnly; Secure; SameSite=None` cookies, eliminating the localStorage token exposure attack class; frontend never touches the JWT
- Enforced **server-side plan gating** for all premium features (voice mode, system design, hard difficulty, monthly interview quotas) with typed `AppError` responses — client-side checks are UX-only and cannot be bypassed
- Applied layered API security: Helmet security headers (XSS, HSTS, nosniff), CORS allowlist, three-tier rate limiting (auth: 10/15min, AI: 20/hr, answers: 30/min), Zod schema validation on all POST bodies, and Razorpay HMAC-SHA256 webhook signature verification

---

### 💳 Payments

- Integrated **Razorpay payment gateway** with server-side order creation (₹799/month), client-side checkout modal, HMAC-SHA256 signature verification on return, idempotent payment log writes, and webhook handler for `payment.captured` / `order.paid` events — premium plan activated only after server-side verification, never on client trust

---

### 📊 Frontend Engineering

- Built a **10-module typed React frontend** (React 19 + TypeScript) with TanStack Query for server-state management, React Hook Form + Zod for form validation, Recharts for dashboard score visualizations, and Framer Motion for UI transitions — all behind a custom `ProtectedRoute` / `PublicRoute` auth guard
- Implemented custom React hooks for interview session orchestration (`useInterviewSession`), speech recognition (`useSpeechRecognition`), audio recording (`useAudioRecorder`), speech synthesis (`useSpeechSynthesis`), and per-question timers (`useTimer`) — keeping voice interview logic fully encapsulated and testable
- Designed a **proxy-based API architecture** on Vercel: all `/api/*` calls are reverse-proxied to the Render backend via `vercel.json`, eliminating CORS complexity in production while keeping the same `axios` base URL in all environments

---

### 🚀 DevOps & Deployment

- Containerized the **full monorepo** (client + server + MongoDB) with Docker and docker-compose for reproducible local development; production deploys client to Vercel and server to Render with environment-specific configs
- Set up **GitHub Actions CI/CD** pipeline running lint + TypeScript type-check + Vitest unit tests on every PR, with separate workflows for client and server
- Configured **Nginx** in the client Docker container for SPA routing (all paths → `index.html`) and static asset caching, production-ready for self-hosted deployment

---

## One-Liner Project Description (for Resume Header / Project Section)

> **PrepView** — Full-stack AI mock interview platform (MERN + Groq LLMs) with dual-model routing (Llama 8B/70B), voice interviews via browser STT + Whisper fallback, deterministic ATS resume scoring, Razorpay freemium monetization, and production deployment on Vercel + Render.

---

## Two-Line Summary (for LinkedIn / Portfolio)

> Built a production AI interview prep SaaS from scratch — React 19 + Node.js + MongoDB + Groq (Llama 3.1 8B / 3.3 70B / Whisper). Features dual-model LLM routing, a follow-up targeting engine, voice interview state machine, deterministic ATS scoring with skill taxonomy, and Razorpay freemium billing — deployed on Vercel + Render.

---

## Role-Specific Framing

### For Full-Stack AI Engineer JDs

Lead with:

- Dual-LLM routing strategy (architecture, not just "used an API")
- Follow-up targeting engine and topic deduplication (prompt engineering depth)
- Deterministic ATS scoring vs AI-scored distinction (knowing when NOT to use AI)
- Voice pipeline with Whisper fallback (multimodal AI integration)

### For Backend Node.js Engineer JDs

Lead with:

- Modular Express 5 architecture with clean layer separation
- JWT httpOnly auth security decisions
- Server-side plan enforcement (not client-side)
- Idempotency patterns (duplicate answer guard, payment log uniqueness)
- Rate limiting strategy (3-tier)
- MongoDB index design and N+1 elimination

### For Full-Stack MERN Engineer JDs

Lead with:

- End-to-end monorepo ownership (client + server + DB + deployment)
- TanStack Query + React Hook Form + Zod (modern React data layer)
- Custom hook abstractions for voice session orchestration
- Vercel proxy architecture for CORS-free production setup
- Recharts dashboard with real aggregation pipeline

### For AI + MERN Engineer JDs

Lead with:

- Multi-stage AI pipeline (question gen → evaluation → report)
- Groq SDK integration with structured JSON output and 429 retry
- Whisper audio transcription integration
- Prompt engineering for 5 interview types + difficulty calibration
- Skill taxonomy normalization layer
- Tag-based question bank architecture (and planned vector upgrade path)

---

## Metrics & Impact Statements

> Use these in bullet points when asked for measurable outcomes. Be honest about what is current vs. projected.

| Metric                   | Value                                                       | Context                         |
| ------------------------ | ----------------------------------------------------------- | ------------------------------- |
| Questions per session    | 10 (+ up to 2 follow-ups)                                   | Fixed, enforced server-side     |
| AI evaluation dimensions | 4 (Technical, Reasoning, Communication, Overall)            | Per answer                      |
| LLM models integrated    | 3 (Llama 8B, Llama 70B, Whisper v3)                         | Via Groq SDK                    |
| Interview types          | 5 (Technical, Behavioral, System Design, Mixed, DSA)        | Fully prompted                  |
| API endpoints            | 20+ (Auth, Interviews, Dashboard, Resume, Payments, Health) | RESTful, JWT-protected          |
| DB collections           | 6 (User, Interview, Question, Answer, Evaluation, Report)   | Indexed                         |
| Rate limit tiers         | 3 (auth, AI, answers)                                       | express-rate-limit              |
| ATS scoring              | Deterministic 0–100                                         | Reproducible, no AI variability |
| Skill aliases            | 60+ in taxonomy layer                                       | Fuzzy match normalization       |
| Planned question bank    | 250+ curated questions                                      | Tag-based, self-growing         |
| Deployment               | Vercel (client) + Render (server) + MongoDB Atlas           | Production live                 |

---

## Stack Tags (for ATS / Keyword Matching)

`React` `React 19` `TypeScript` `Node.js` `Express.js` `MongoDB` `Mongoose` `REST API` `Groq` `LLaMA` `Whisper` `AI/ML` `LLM` `Prompt Engineering` `Vite` `TanStack Query` `Zod` `Tailwind CSS` `Shadcn/ui` `Recharts` `Framer Motion` `JWT` `bcrypt` `Razorpay` `Docker` `docker-compose` `Nginx` `Vercel` `Render` `GitHub Actions` `Vitest` `Supertest` `Playwright` `Pino` `Helmet` `MERN Stack` `Full Stack` `AI Engineering` `Voice AI` `Speech-to-Text` `Freemium SaaS`
