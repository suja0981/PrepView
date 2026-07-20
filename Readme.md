# PrepView

> An AI-powered mock interview platform with voice & text modes, real-time evaluation, and comprehensive performance reporting.

**Live Demo:** [prepview.vercel.app](https://prepview.vercel.app)

---

## Features

**AI Interview Engine**

- Voice and Text interview modes
- 10-question adaptive sessions powered by Google Gemini 2.5 Flash
- Context-aware follow-up questions based on your previous answers
- Technical and Behavioral interview types
- Easy / Medium / Hard difficulty levels
- Company-specific targeting and tech stack focus

**AI Evaluation & Reporting**

- Per-question silent evaluation (Technical Accuracy, Reasoning, Communication)
- Final comprehensive report with Overall, Technical, Communication, and Problem Solving scores
- Strengths and Areas to Improve breakdown
- Full Q&A transcript review

**Resume Analyzer**

- Upload a PDF or TXT resume
- Paste a job description
- Receive AI-generated match analysis and improvement suggestions

**Dashboard**

- Total, Completed, and Pending interview counts
- Average score across all sessions
- Performance history chart
- Recent interviews list

---

## Tech Stack

| Layer        | Technologies                                  |
| ------------ | --------------------------------------------- |
| Frontend     | React 19, TypeScript, Vite, Tailwind CSS v4   |
| State / Data | TanStack Query, Zustand, React Hook Form, Zod |
| Backend      | Node.js, Express, TypeScript                  |
| Database     | MongoDB (Atlas), Mongoose                     |
| Auth         | JWT, httpOnly Cookies, bcrypt                 |
| AI           | Google Gemini 2.5 Flash (`@google/genai`)     |
| Infra        | Docker, Render (API), Vercel (Frontend)       |

---

## Project Structure

```
PrepView/
├── client/                   # React SPA (Vite)
│   ├── src/
│   │   ├── api/              # Axios API functions
│   │   ├── components/       # Shared UI components (shadcn/ui)
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # useInterviewSession, useDashboard, useAuth, etc.
│   │   ├── pages/            # Route-level pages
│   │   ├── routes/           # Protected & public route guards
│   │   ├── schemas/          # Zod form validation schemas
│   │   └── types/            # TypeScript interfaces
│   ├── vercel.json           # Vercel reverse proxy config
│   └── Dockerfile
│
├── server/                   # Express API
│   ├── src/
│   │   ├── ai/
│   │   │   ├── prompts/      # Gemini prompt builders
│   │   │   └── services/     # gemini, evaluation, report, resume services
│   │   ├── config/           # env, db, cors, logger
│   │   ├── modules/          # auth, interview, question, answer, evaluation, report, dashboard, resume
│   │   └── shared/           # middleware (auth, validate, rate-limit), utils, errors
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
- Google Gemini API key

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
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=http://localhost:5173
API_PREFIX=/api/v1
```

Create `client/.env`:

```env
VITE_API_URL=/api/v1
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
```

---

## Deployment

- **Frontend:** Vercel — root directory set to `/client`. `vercel.json` rewrites `/api/*` to the backend.
- **Backend:** Render — root directory set to `/server`. Environment variables configured in dashboard.
- **Database:** MongoDB Atlas (shared across environments via `MONGODB_URI`).

---

## Roadmap

- [x] AI question generation and evaluation (Gemini 2.5 Flash)
- [x] Voice and text interview modes
- [x] Comprehensive performance reports
- [x] Resume analyzer
- [x] Dashboard with performance history
- [x] Docker setup
- [x] Deployed on Vercel + Render
- [ ] LinkedIn profile integration
- [ ] Full voice mode (TTS output + real-time STT)
- [ ] OAuth (Google/GitHub)
- [ ] Domain-specific Mastery Series

---

## License

MIT © Sujal Wadhankar
