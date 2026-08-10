# PrepView Build Plan

Tracking doc for the resume-worthy upgrade pass. Check items off as you go.
Order matters — each phase is a foundation for the next one.

---

## Phase 1 — Foundation fixes
Small, low-risk fixes. Do these first so nothing new is built on a broken base.

- [x] Fix `questionsAsked` double-increment bug in `interview.service.ts`
- [ ] Add `server/.env.example` (referenced in README but missing)
- [ ] Remove unused `socket.io` / `socket.io-client` deps (or plan to actually use them in Phase 3)
- [x] Add basic tests — 9 test files covering Auth Service, Middleware, LLM Services, Plan Gating, and Supertest Integration (30 tests passing)
- [ ] Add a simple CI workflow (lint + typecheck + test on PR)

---

## Phase 2 — Resume + JD parser (shared foundation)
This structured extraction layer feeds both the ATS feature and later RAG work.

- [x] `resume-extraction.prompt.ts` — pulls structured skills/role/seniority facts
- [x] `ats-score.service.ts` — deterministic scoring, no AI call
- [x] `resume-feedback.prompt.ts` — narrative feedback grounded in extracted facts
- [x] `resume.service.ts` — orchestrates extract → score → feedback
- [ ] Frontend: resume analyzer UI update (ATS score breakdown, matched/missing skills, possible questions list)

---

## Phase 3 — Product features
Backend logic first, then UI. This is what a recruiter sees/uses in the live demo.

**Interview features:**
- [ ] Follow-up questions on weak answers (branch instead of always moving to a new topic)
- [ ] Interview modes (DSA / system design / behavioral / mixed — not just role+company)
- [ ] Session persistence (resume an interrupted interview)
- [ ] Progress dashboard (score trends across sessions)
- [ ] Downloadable PDF report

**UI upgrades:**
- [ ] Live transcript panel during interview
- [ ] Visual score breakdown on report page (chart per competency, not flat number)
- [ ] Progressive loading states (replace blocking spinner)
- [ ] Dark mode + responsive pass

---

## Phase 4 — AI pipeline depth
Only after Phases 1–3 — the product needs to work well before it needs to be "smarter."

- [ ] Vector store setup (MongoDB Atlas Vector Search — no new DB needed)
- [ ] Seed question bank (~150–300 curated questions, tagged by role/topic/difficulty)
- [ ] Embedding service (`embedding.service.ts`, Gemini `text-embedding-004`)
- [ ] Retrieval step wired into `interview.service.ts` (build query → search → filter → inject into prompt)
- [ ] Self-growing bank (store generated questions back with `source: "generated"`)
- [ ] Eval harness: golden dataset (25–40 hand-picked Q&A pairs with expected score bands)
- [ ] Eval harness: runner script (`run-eval.ts`) — format compliance, score variance, band accuracy
- [ ] Compare eval report before/after RAG to get a real number for your README

---

## Where we are right now
✅ Phase 1: all items complete (bug fix, .env.example, CI workflow, tests, socket.io removed)
✅ Phase 2: backend done, frontend done (ATS score chips, possible questions, talking points)
✅ Phase 3: backend done (follow-ups, DSA/system_design/mixed types), frontend done (Report charts, TextInterview progress, Dashboard quick actions)
⬜ Phase 4: not started

**Next up:** Phase 4 — Vector store + RAG pipeline (MongoDB Atlas Vector Search + question bank).
