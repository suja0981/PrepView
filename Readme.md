# 🎙️ InterviewIQ

> **An AI-powered Voice Interview Platform that simulates real technical interviews through natural conversations.**

InterviewIQ is designed to replicate the experience of a real technical interview. Instead of typing answers into a chatbot, candidates interact with an AI interviewer using their voice. The AI asks questions, listens to spoken responses, maintains conversational context, generates intelligent follow-up questions, and provides a comprehensive interview report after the interview ends.

> 🚧 **Status:** Under Active Development

---

# ✨ Features

## 🎤 AI Voice Interview

- Natural voice conversations with an AI interviewer
- AI-generated technical interview questions
- Context-aware follow-up questions
- Technical, Behavioral, and Mixed interview modes
- Multiple difficulty levels
- Real interview-like conversational flow

---

## 🧠 AI-Powered Evaluation

During the interview, the AI continuously evaluates responses internally to understand the candidate's performance and generate better follow-up questions.

**Individual question scores are NOT shown to the user.**

After the interview ends, InterviewIQ generates a comprehensive AI report including:

- Overall Interview Score
- Technical Performance
- Communication Assessment
- Problem Solving Analysis
- Key Strengths
- Areas for Improvement
- AI-generated Interview Summary

---

## 📊 Dashboard

- Recent Interviews
- Total Interviews
- Average Interview Score
- Completed Interviews
- Interview History

---

## 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- HTTP-only Cookie Authentication
- Protected Routes

---

# 🚀 Upcoming Features (V2)

- Resume-based Interview Generation
- Personalized Learning Roadmaps
- Company-specific Interview Modes
- Adaptive Interviewing
- AI Interview Analytics
- Coding Interview Mode
- HR Interview Mode
- Mock System Design Interviews

---

# 💡 What Makes InterviewIQ Different?

Unlike traditional interview platforms where users type responses or answer predefined questions, InterviewIQ conducts a natural voice conversation.

The AI interviewer:

- Speaks using Text-to-Speech
- Listens using Speech-to-Text
- Understands conversational context
- Asks intelligent follow-up questions
- Conducts interviews similar to a human interviewer
- Generates a complete evaluation only after the interview is finished

The goal is to create an interview experience that feels as close as possible to a real technical interview.

---

# 🏗️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- Axios
- React Hook Form
- Zod

---

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Cookie Parser
- bcrypt
- Zod Validation

---

## AI

- Google Gemini
- Speech-to-Text _(In Progress)_
- Text-to-Speech _(In Progress)_

---

# 📂 Project Structure

```text
InterviewIQ/

├── client/
│   ├── src/
│   │
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── interview/
│   │
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   └── types/
│
├── server/
│   ├── src/
│   │
│   ├── ai/
│   │   ├── prompts/
│   │   └── services/
│   │
│   ├── common/
│   ├── config/
│   ├── middleware/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── interview/
│   │   ├── question/
│   │   ├── answer/
│   │   ├── evaluation/
│   │   ├── report/
│   │   └── dashboard/
│   │
│   └── server.ts
│
└── README.md
```

---

# 🏛️ Backend Architecture

The backend follows a modular architecture with clear separation of responsibilities.

```text
Client Request

        │

        ▼

Routes

        │

        ▼

Validation Middleware

        │

        ▼

Authentication Middleware

        │

        ▼

Controller

        │

        ▼

Service

        │

        ▼

Repository

        │

        ▼

MongoDB

        │

        ▼

Response
```

Each feature follows the same architecture:

```text
module/

├── model
├── repository
├── service
├── controller
├── routes
├── validation
└── index
```

---

# 🤖 AI Interview Flow

## Start Interview

```text
Candidate

        │

        ▼

Create Interview

        │

        ▼

Gemini Generates First Question

        │

        ▼

AI Speaks Question (TTS)

        │

        ▼

Candidate Responds (Voice)
```

---

## Interview Loop

```text
Candidate Speaks

        │

        ▼

Speech-to-Text

        │

        ▼

LLM Understands Response

        │

        ▼

Internal Evaluation

        │

        ▼

Generate Follow-up Question

        │

        ▼

Text-to-Speech

        │

        ▼

Candidate Hears Next Question

        │

        ▼

Repeat Until Interview Ends
```

---

## Interview Completion

```text
All Questions

        +

All Answers

        +

Internal Evaluations

        │

        ▼

Gemini

        │

        ▼

Generate Final Interview Report

        │

        ▼

Store Report

        │

        ▼

Display Report to Candidate
```

---

# 🗄️ Database Design

Collections

- Users
- Interviews
- Questions
- Answers
- Evaluations
- Reports

Relationships

```text
User
│
└── Interviews
      │
      ├── Questions
      ├── Answers
      └── Report
             │
             └── Evaluations
```

---

# 🔐 Authentication

- JWT Authentication
- HTTP-only Cookies
- Password Hashing using bcrypt
- Protected API Routes
- Global Error Handling
- Zod Request Validation

---

# 🌐 API Overview

## Authentication

```http
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

---

## Interviews

```http
POST   /api/v1/interviews
GET    /api/v1/interviews
GET    /api/v1/interviews/:id
POST   /api/v1/interviews/:id/answer
GET    /api/v1/interviews/:id/report
```

---

## Dashboard

```http
GET    /api/v1/dashboard
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/your-username/InterviewIQ.git

cd InterviewIQ
```

---

## Backend

```bash
cd server

pnpm install

pnpm dev
```

---

## Frontend

```bash
cd client

pnpm install

pnpm dev
```

---

# 🔑 Environment Variables

### Server

```env
PORT=

NODE_ENV=

MONGODB_URI=

JWT_SECRET=

JWT_EXPIRES_IN=

GEMINI_API_KEY=
```

---

# 📌 Development Roadmap

## Phase 1

- [x] Backend Foundation
- [x] Authentication
- [x] MongoDB Integration

---

## Phase 2

- [x] AI Interview Engine
- [x] AI Question Generation
- [x] AI Answer Evaluation
- [x] Final Interview Report

---

## Phase 3

- [ ] React Frontend
- [ ] Authentication UI
- [ ] Dashboard
- [ ] Voice Interview Screen
- [ ] Interview Report UI

---

## Phase 4

- [ ] Speech-to-Text Integration
- [ ] Text-to-Speech Integration
- [ ] Voice Streaming
- [ ] Interview History Improvements

---

## Phase 5

- [ ] Resume-based Interviews
- [ ] Personalized Learning Roadmaps
- [ ] Adaptive Interviews
- [ ] AI Analytics
- [ ] Company-specific Interview Modes

---

# 🤝 Contributing

Contributions, suggestions, and issue reports are welcome.

Feel free to fork the repository, create a feature branch, and submit a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Sujal**

Built with ❤️ using **React, Express, MongoDB, TypeScript, and Google Gemini AI**.
