# PrepView

> An AI-powered mock interview platform with voice & text modes, real-time evaluation, and comprehensive performance reporting.

**Live Demo:** [prepview.vercel.app](https://prepview.vercel.app)

---

## Features

**AI Interview Engine**

- Voice and Text interview modes
- Adaptive 10-question sessions — questions generated fresh every session
- Context-aware follow-up questions triggered on weak answers
- 5 interview types: Technical, Behavioral, DSA, System Design, Mixed
- 3 difficulty levels: Easy, Medium, Hard
- Company-specific targeting and tech stack focus

**AI Evaluation & Reporting**

- Per-question feedback panel after every answer (voice & text)
- Silent evaluation on 4 dimensions: Technical Accuracy, Reasoning, Communication, Problem Solving
- Final comprehensive report with Overall score, strengths and areas to improve
- Full Q&A transcript review with per-question competency breakdown

**Resume Analyzer**

- Upload a PDF or TXT resume
- Paste a job description
- AI-generated match analysis, skill gap breakdown, and improvement suggestions

**Voice Interview**

- Real-time speech-to-text transcription (Web Speech API)
- Minimum word guard (5+ words) before submission
- Auto-restart on silence (Chrome/Edge compatible)
- Text-to-Speech (TTS) toggle — AI reads questions aloud hands-free
- Feedback panel between each question

**Premium Subscription (Stripe)**

- Free plan: 3 text interviews/month, 10 resume analyses/day, technical & behavioral types, easy/medium difficulty
- Premium plan ($9/month): Unlimited interviews, voice mode, DSA, System Design, hard difficulty, unlimited resume analyses
- Stripe Checkout + Customer Portal for subscription management
- Webhook-driven plan activation (checkout.session.completed, invoice renewal, cancellation)

**Dashboard**

- Total, Completed, and Pending interview counts
- Average score across all sessions
- Performance history chart
- Recent interviews list
- Plan badge (Free / Premium) with upgrade CTA

---

## Tech Stack

| Layer        | Technologies                                        |
| ------------ | --------------------------------------------------- |
| Frontend     | React 19, TypeScript, Vite, Tailwind CSS v4         |
| State / Data | TanStack Query, Zustand, React Hook Form, Zod       |
| Backend      | Node.js, Express, TypeScript                        |
| Database     | MongoDB (Atlas), Mongoose                           |
| Auth         | JWT, httpOnly Cookies, bcrypt                       |
| AI           | Groq (Llama 3.1 8B Instant / 70B Versatile)        |
| Payments     | Razorpay (Subscriptions, Orders, Webhooks)           |
| Infra        | Docker, Render (API), Vercel (Frontend)             |

---

## Project Structure

```
PrepView/
├── client/                   # React SPA (Vite)
│   ├── src/
│   │   ├── api/              # Axios API functions (auth, interview, payment, resume)
│   │   ├── components/       # Shared UI components (shadcn/ui, Navbar)
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── hooks/            # useInterviewSession, useSpeechRecognition, useDashboard, useAuth
│   │   ├── pages/            # Route-level pages (Dashboard, Interview, Report, Pricing, etc.)
│   │   ├── routes/           # Protected & public route guards
│   │   ├── schemas/          # Zod form validation schemas
│   │   └── types/            # TypeScript interfaces
│   ├── vercel.json           # Vercel reverse proxy config
│   └── Dockerfile
│
├── server/                   # Express API
│   ├── src/
│   │   ├── ai/
│   │   │   ├── prompts/      # LLM prompt builders (interview, evaluation, report, resume)
│   │   │   └── services/     # gemini, evaluation, report, resume services
│   │   ├── config/           # env, db, cors, logger
│   │   ├── modules/          # auth, interview, question, answer, evaluation, report, dashboard, resume, payment, user
│   │   └── shared/           # middleware (auth, validate, requirePlan), utils, errors
│   └── Dockerfile
│
├── docker-compose.yml        # Local full-stack orchestration
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Groq API key (free at [console.groq.com](https://console.groq.com))
- Stripe account (free test keys at [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys))

### Option A — Standard (npm)

```bash
# Backend
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

### Option B — Docker (recommended)

```bash
# Copy and fill in environment variables
cp server/.env.example server/.env

# Build and start all services (Backend + Frontend + MongoDB)
docker-compose up --build -d

# Stop everything
docker-compose down
```

### Environment Variables

Create `server/.env`:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
API_PREFIX=/api/v1

# AI
GROQ_API_KEY=gsk_your_groq_api_key

# Stripe — get from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_price_id

# Frontend URL (used for Stripe checkout redirects)
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=/api/v1
```

### Testing Stripe Webhooks Locally

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:4000/api/v1/payments/webhook
```

---

## API Overview

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

POST   /api/v1/interviews
GET    /api/v1/interviews
GET    /api/v1/interviews/:id
POST   /api/v1/interviews/:id/answer
GET    /api/v1/interviews/:id/report
GET    /api/v1/interviews/:id/details

GET    /api/v1/dashboard

POST   /api/v1/resume/analyze

POST   /api/v1/payments/checkout   # Returns Stripe Checkout URL
POST   /api/v1/payments/portal     # Returns Stripe Customer Portal URL
POST   /api/v1/payments/webhook    # Stripe webhook (raw body)
```

---

## Deployment

- **Frontend:** Vercel — root directory set to `/client`. `vercel.json` rewrites `/api/*` to the backend.
- **Backend:** Render — root directory set to `/server`. All environment variables configured in Render Dashboard.
- **Database:** MongoDB Atlas (shared across environments via `MONGODB_URI`).
- **Payments:** Stripe webhook endpoint must be registered in Stripe Dashboard pointing to `https://your-api.onrender.com/api/v1/payments/webhook`.

---

## Roadmap

- [x] AI question generation and evaluation (Groq LLM)
- [x] Voice and text interview modes
- [x] Per-question feedback panel
- [x] Comprehensive performance reports with Q&A breakdown
- [x] Resume analyzer with skill gap analysis
- [x] Dashboard with performance history
- [x] Premium subscription via Stripe
- [x] Plan enforcement (free limits, premium gates)
- [x] Docker setup
- [x] Deployed on Vercel + Render
- [ ] OAuth (Google / GitHub)
- [ ] LinkedIn profile integration
- [ ] Domain-specific Mastery Series

---

## License

MIT © Sujal Wadhankar
