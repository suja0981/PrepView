# PrepView — Project Context

> Living document. Update this whenever a major decision is made or a constraint changes.  
> Last updated: November 2026

---

## What This Project Is

PrepView is a **full-stack AI mock interview platform** that lets candidates practice technical, behavioral, system design, and DSA interviews by voice or text. The AI evaluates every answer, gives per-question feedback, and generates a comprehensive final report. A resume analyzer compares a CV against a job description and returns an ATS score, skill gaps, and likely interview questions.

**Live:** [prepview.vercel.app](https://prepview.vercel.app)  
**Repo:** `d:\PrepView` (monorepo — `client/` + `server/`)

---

## Hard Constraints (Read Before Doing Anything)

| Constraint | Detail |
|-----------|--------|
| **Free API keys only** | Groq (free tier), MongoDB Atlas M0 (free), Google OAuth (free), Razorpay test keys during dev |
| **Groq free tier limits** | ~30 req/min on `llama-3.1-8b-instant`, ~6 req/min on `llama-3.3-70b-versatile`. All AI calls go through Groq. |
| **No paid vector DB** | MongoDB Atlas Vector Search requires M10+ ($57/mo) — NOT available on M0 free tier. This rules out Atlas-native RAG. Use MongoDB Atlas Free + text search or self-manage embeddings in a free alternative. |
| **No paid embedding API** | OpenAI embeddings are paid. Groq has no embedding API. Use **Cohere free tier** (1000 calls/month) or **HuggingFace Inference API** (free, rate-limited) for embeddings. |
| **Deployment: free tiers** | Render free (backend — spins down on inactivity), Vercel hobby (frontend) |
| **No server-side code execution** | No code sandbox (Piston, Judge0) — all DSA questions must be verbal/reasoning only |

---

## Current Status (November 2026)

### ✅ Working & Shipped
- Email/password auth (JWT + httpOnly cookies)
- Text interview engine (10 questions, follow-ups on weak answers, topic deduplication)
- Voice interview engine (Web Speech API + Groq Whisper fallback)
- Per-answer AI evaluation (4 dimensions: Technical, Reasoning, Communication, Overall)
- Feedback panel between each question
- Final report (radial charts, Q&A breakdown, strengths/improvements)
- Resume analyzer (PDF/TXT → ATS score + matched/missing skills + possible questions)
- Dashboard (stats, score history chart, recent interviews)
- Plan enforcement (free: 3 text interviews/month, premium: everything)
- Razorpay one-time payment → premium upgrade (1 month)
- Docker + Vercel + Render deployment
- Rate limiting, Helmet security headers

### 🔴 Broken / Misleading (Must Fix)
- **DSA interview type** — listed in pricing/README but NOT in backend enum
- **Subscription is one-time payment** — no recurring billing, "cancel anytime" is false
- **Billing portal** redirects to `/dashboard` — not a real portal
- **Speech Delivery WPM** in report is hardcoded fake data
- **Whisper service** uses dummy API key fallback instead of throwing a real error
- **Company field** — form never collects it, lobby UI references it, always null

### ⬜ Not Built Yet
- Google OAuth
- Real recurring Razorpay subscriptions
- DSA interview type (verbal, algorithm reasoning, complexity discussion)
- Session persistence (refresh = lost voice interview state)
- Full interview history page
- Email verification
- Profile page (name/password management)
- Real PDF export
- Advanced dashboard analytics (per-type scores, weak topic trends)

---

## Key Design Decisions (Rationale)

### Why Groq over OpenAI/Gemini?
Groq has the fastest free inference on Llama 3 models. The free tier is usable for a demo/MVP. OpenAI costs money; Google Gemini API has a free tier but rate limits are more restrictive for structured JSON output.

### Why One Model for Everything (`llama-3.1-8b-instant`)?
Speed and free tier capacity. 8B instant handles question generation well. Evaluation and reports would benefit from 70B Versatile, but 70B is rate-limited (6 req/min free) and would add latency. Plan: route heavy tasks (evaluation, report) to 70B, light tasks (question gen) to 8B.

### Why Razorpay over Stripe?
Stripe doesn't support INR directly in India without Business verification. Razorpay is the standard Indian payment gateway with free test keys. The current implementation is one-time orders — this needs to be upgraded to Razorpay Subscriptions.

### Why No Vector RAG Right Now?
MongoDB Atlas Vector Search requires M10+ ($57/mo) — not on free tier. Cohere embeddings are free but limited to 1000 calls/month (too few for a production question bank). **Decision: Build a curated question bank with MongoDB text search + tag-based retrieval first (zero cost). Add true vector embeddings later when budget allows or when we find a sustainable free solution.**

### Why No Code Execution for DSA?
No free, reliable, embeddable code sandbox is available without operational overhead. Piston API has rate limits and cold starts. Judge0 self-hosting requires a server. Decision: DSA questions in PrepView will be **verbal/whiteboard style** — algorithm approach, complexity analysis, edge case discussion, pseudocode explanation. This is valuable prep even without code execution.

### Why httpOnly Cookies for JWT?
XSS-resistant auth. Never store JWTs in localStorage. The backend sets `httpOnly; Secure; SameSite=None` cookies — the frontend never touches the token directly.

### Why Deterministic ATS Scoring (not AI)?
AI score for the same input can vary between calls. A candidate refreshing the page would get a different ATS score. Deterministic code (skill overlap math) gives reproducible results. AI is used only for the narrative (summary, suggestions, talking points).

---

## Project Personnel
- **Solo developer:** Sujal Wadhankar
- **Stack:** React 19, TypeScript, Vite, Tailwind v4, Shadcn/ui, TanStack Query, Zustand, Node.js, Express 5, MongoDB, Mongoose, Groq SDK, Razorpay, Docker

---

## Important File Locations

| Path | Purpose |
|------|---------|
| `server/src/ai/services/gemini.service.ts` | **Groq AI gateway** — all LLM calls go through `callGemini()` (rename pending) |
| `server/src/ai/prompts/interview.prompt.ts` | Question generation + evaluation prompts |
| `server/src/modules/interview/interview.service.ts` | Core interview engine (plan enforcement, follow-up logic) |
| `server/src/modules/payment/payment.service.ts` | Razorpay integration |
| `server/src/config/env.ts` | Zod-validated environment schema |
| `client/src/hooks/useInterviewSession.ts` | Voice interview state machine |
| `client/src/pages/interview/TextInterview.tsx` | Text interview UI |
| `ARCHITECTURE.md` | System architecture diagrams and data model |
| `BUILD_PLAN.md` | Active development plan with phases and tasks |

---

## Environment Variables Reference

### `server/.env`
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=minimum-32-character-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
API_PREFIX=/api/v1

# AI
GROQ_API_KEY=gsk_...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAY_PLAN_ID=plan_...     # For recurring subscriptions (Phase 2)

# OAuth (Phase 3)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```env
VITE_API_URL=/api/v1
VITE_GOOGLE_CLIENT_ID=...     # For OAuth (Phase 3)
```

---

## Groq Model Reference (Free Tier)

| Model | Use Case | Rate Limit (free) | Speed |
|-------|----------|-------------------|-------|
| `llama-3.1-8b-instant` | Question generation | ~30 req/min | Very fast |
| `llama-3.3-70b-versatile` | Evaluation, reports | ~6 req/min | Slower |
| `whisper-large-v3-turbo` | Audio transcription | Limited | Medium |

> **Rule:** Use 8B for latency-sensitive paths (question gen). Use 70B for quality-sensitive paths (evaluation, final report narrative). Never call AI for things that can be computed in code (ATS score, aggregate report scores).
