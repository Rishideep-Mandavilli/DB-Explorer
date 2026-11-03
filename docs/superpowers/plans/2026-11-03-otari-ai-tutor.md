# DB Explorer AI Tutor Implementation Plan (Mozilla Otari Hackathon)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, interactive AI Tutor for DB Explorer embedded across all 30 lessons and the multi-engine Sandbox, routed exclusively through Mozilla Otari's OpenAI-compatible gateway with open-weight models to score 95+/100.

**Architecture:** A new modular backend `server/ai/` (`otariClient.js`, `tutor.js`, `routes.js`, `guardrails.js`, `mcp.js`) mounts at `/api/tutor/*`. A client-side Tutor panel (`client/src/components/TutorPanel.jsx`, `TutorDebugDrawer.jsx`, `TutorCreditMeter.jsx`) embeds into Lesson pages and the Sandbox. Every request passes a persistent anonymous learner ID in the OpenAI `user` field for per-user Otari budget tracking. It leverages 2 distinct open-weight models (Gemma Explainer + Qwen/Llama SQL Coder) and exercises all 6 hackathon Otari features (role routing, fallback policies, code execution, web fetch doc citation, prompt injection/destructive query guardrails, and per-user budgets) plus workspace limits and MCP backups.

**Tech Stack:** Node 20, Express, `openai` npm SDK, `dotenv`, React 18, Vite, Tailwind CSS, Lucide icons.

**Spec:** User hackathon brief for Mozilla Otari Hackathon (Target 95+/100).

## Global Constraints

- All LLM traffic must go through the hosted Otari gateway (`OTARI_BASE_URL`, default `https://api.otari.ai/v1`). Never call a model provider directly.
- Secrets (`OTARI_API_KEY`, `OTARI_BASE_URL`, `OTARI_BUDGET_ID`, `OTARI_ROUTING_POLICY`) must stay in `.env`, with `.env.example` committed.
- Both primary models must be open-weight models from the Otari catalog (e.g. `google/gemma-2-9b-it` and `qwen/qwen-2.5-coder-32b-instruct`).
- Add MIT license on `main` branch first; all hackathon work goes on branch `otari-hackathon`.
- The first Otari commit must be small and clearly named (`feat: route tutor through Otari gateway`).
- Local simulation/mock mode must be provided when `OTARI_API_KEY` is not yet configured, allowing end-to-end verification without blocking on keys.

## Review Focus

1. **Missing or invalid `OTARI_API_KEY`:** Graceful fallback to mock tutor simulation mode with clear UI warning, preventing server crashes.
2. **Destructive SQL attempts in Tutor chat:** Prompt injections and SQL statements like `DROP TABLE`, `TRUNCATE`, or unconstrained `DELETE` blocked before execution with an informative guardrail alert.
3. **Per-user budget exhaustion (HTTP 403 `budget_exceeded`):** Tutor UI parses `Retry-After` / reset time and displays a friendly daily limit message instead of a generic error.
4. **Network or gateway failure during code execution/web fetch:** Returns fallback guidance with captured Otari retry/fallback headers (`Otari-Fallback: true`).
5. **State persistence across lesson/sandbox switches:** Learner ID preserved in `localStorage`, maintaining continuity for credit limits and container sessions.

---

### Task 1: License, Branching, and Environment Scaffolding

**Files:**
- Create: `LICENSE` (MIT License on `main`)
- Create: `.env.example`
- Create: `.env` (gitignored)
- Modify: `.gitignore`

**Interfaces:**
- Produces: `otari-hackathon` branch from `main`, valid MIT license, gitignored `.env` file.

- [ ] **Step 1: Create MIT License on main branch and commit**
- [ ] **Step 2: Create and checkout branch `otari-hackathon`**
- [ ] **Step 3: Update `.gitignore` to ensure `.env` and `.env.local` are ignored**
- [ ] **Step 4: Create `.env.example` with documented Otari configuration keys**
- [ ] **Step 5: Verify git branch status and commit scaffolding**

---

### Task 2: Small Initial Otari Commit (`feat: route tutor through Otari gateway`)

**Files:**
- Create: `server/ai/otariClient.js`
- Create: `server/ai/routes.js`
- Modify: `server/index.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `POST /api/tutor/chat` minimal ping/gateway route using `openai` SDK with `baseURL: process.env.OTARI_BASE_URL`.
- Requirement: Must be a small, cleanly scoped commit with the exact commit message: `feat: route tutor through Otari gateway`.

- [ ] **Step 1: Install `openai` and `dotenv` in backend dependencies**
- [ ] **Step 2: Implement minimal `server/ai/otariClient.js` configured with `baseURL` and `apiKey`**
- [ ] **Step 3: Implement minimal `server/ai/routes.js` with health and basic completion endpoint**
- [ ] **Step 4: Mount `/api/tutor` in `server/index.js` and test endpoint via curl**
- [ ] **Step 5: Commit with message `feat: route tutor through Otari gateway`**

---

### Task 3: Core AI Module — Model Router, Roles & Guardrails

**Files:**
- Create: `server/ai/guardrails.js`
- Create: `server/ai/tutor.js`
- Modify: `server/ai/otariClient.js`
- Modify: `server/ai/routes.js`

**Interfaces:**
- Consumes: `otariClient.js`
- Produces:
  - `detectIntent(message)` -> `'explain' | 'sql_coder' | 'check_answer'`
  - `checkGuardrails(message, sql)` -> `{ allowed: boolean, reason?: string, type?: 'injection' | 'destructive_sql' }`
  - `handleTutorChat({ message, context, user, modelOverride, simulateFallback })` -> `{ reply, model, toolCalls, sources, headers }`
  - `handleCheckAnswer({ userSql, solutionSql, lessonId, user })` -> `{ passed, feedback, details, toolCalls, model }`

- [ ] **Step 1: Implement `server/ai/guardrails.js` for destructive query filter and injection rules**
- [ ] **Step 2: Implement role routing in `server/ai/tutor.js` (Gemma for explanations, Qwen/Llama or policy `tutor-sql` for SQL coding)**
- [ ] **Step 3: Add Otari tool definitions (`otari_code_execution` and `otari_web_fetch` with domain restrictions)**
- [ ] **Step 4: Enhance `server/ai/otariClient.js` to extract Otari response headers (`Otari-Model`, `Otari-Fallback`, `Otari-Attempt-Count`) and support high-fidelity local simulation**
- [ ] **Step 5: Verify routing, guardrails, and tools via automated unit/integration tests**
- [ ] **Step 6: Commit changes: `feat(ai): role-based router, guardrails, and Otari tool definitions`**

---

### Task 4: Per-User Budget Management & MCP Backup Engine

**Files:**
- Create: `server/ai/budget.js`
- Create: `server/ai/mcp.js`
- Modify: `server/ai/routes.js`

**Interfaces:**
- Produces:
  - `GET /api/tutor/budget?user=<id>` -> `{ remainingCredits, totalBudget, currency, resetTime, rpmLimit, rpmRemaining }`
  - `POST /api/tutor/mcp/run_query` & `GET /api/tutor/mcp/describe_schema` (public lightweight MCP interface over DB Explorer engines)

- [ ] **Step 1: Implement `server/ai/budget.js` for end-user budget queries and local credit tracking fallback**
- [ ] **Step 2: Implement `server/ai/mcp.js` exposing read-only queries and schema inspection for MCP backup points**
- [ ] **Step 3: Wire `/api/tutor/budget` and `/api/tutor/mcp` routes in `server/ai/routes.js`**
- [ ] **Step 4: Test budget exhaustion handling (403 `budget_exceeded` simulation with `Retry-After`)**
- [ ] **Step 5: Commit: `feat(ai): per-user budget enforcement and MCP backup integration`**

---

### Task 5: Client AI Tutor UI Components

**Files:**
- Create: `client/src/utils/tutorApi.js`
- Create: `client/src/components/TutorPanel.jsx`
- Create: `client/src/components/TutorDebugDrawer.jsx`
- Create: `client/src/components/TutorCreditMeter.jsx`
- Create: `client/src/components/TutorToolCallBadge.jsx`

**Interfaces:**
- Produces:
  - Anonymous persistent user ID in `localStorage` (`db_explorer_learner_id`)
  - Floating or docked Tutor side drawer with Chat, Model Badge, Tool Activity, Source Citations, Guardrail Warnings, Credit Meter, and Debug Telemetry Drawer.

- [ ] **Step 1: Implement `client/src/utils/tutorApi.js` with client fetchers and anonymous learner ID manager**
- [ ] **Step 2: Implement `TutorCreditMeter.jsx` with daily progress bar and reset countdown**
- [ ] **Step 3: Implement `TutorToolCallBadge.jsx` showing `otari_tool_calls` execution, searches, and doc citations**
- [ ] **Step 4: Implement `TutorDebugDrawer.jsx` displaying live Otari gateway headers (`Otari-Model`, `Otari-Fallback`, `Otari-Attempt-Count`)**
- [ ] **Step 5: Implement `TutorPanel.jsx` combining chat interface, quick actions ("Explain", "Fix query", "Check answer"), tool cards, and guardrail alerts**
- [ ] **Step 6: Commit: `feat(ui): interactive AI Tutor panel with tool activity and telemetry drawer`**

---

### Task 6: Integrate Tutor Panel into Lessons & Sandbox

**Files:**
- Modify: `client/src/modules/LessonDetail.jsx`
- Modify: `client/src/modules/Sandbox.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Embeds Tutor button / panel in `LessonDetail.jsx` passing `lessonId`, engine, and current query.
- Embeds Tutor button / panel in `Sandbox.jsx` passing current engine, active SQL query, and schema.

- [ ] **Step 1: Integrate Tutor toggle and drawer into `LessonDetail.jsx` with contextual prompt buttons**
- [ ] **Step 2: Integrate Tutor toggle and drawer into `Sandbox.jsx` with "Check my answer" and query optimization hooks**
- [ ] **Step 3: Add global Tutor launcher in navigation (`App.jsx`)**
- [ ] **Step 4: Verify UI responsiveness, chat interactions, and code sync**
- [ ] **Step 5: Commit: `feat(ui): embed AI Tutor across lessons and sandbox modules`**

---

### Task 7: Hackathon User Flows Verification & Test Suite

**Files:**
- Create: `server/test/tutor.test.js`
- Test: Flow A: Lesson "SQL Deep Dive" Gemma explanation with SQLite doc citations
- Test: Flow B: Sandbox Qwen query generation and "Check my answer" code execution
- Test: Flow C: Injection block and destructive `DROP TABLE` guardrail block
- Test: Flow D: Forced fallback showing backup model and `Otari-Fallback: true`
- Test: Flow E: Daily credit exhaustion and 403 limit message with reset time

- [ ] **Step 1: Write automated end-to-end integration tests covering Flows A–E**
- [ ] **Step 2: Run test suite to verify all flows pass**
- [ ] **Step 3: Verify client build (`npm run build`) and server startup without errors**
- [ ] **Step 4: Commit: `test: add end-to-end test suite for Otari hackathon user flows A-E`**

---

### Task 8: Documentation, Submission Package, and Otari Issue Draft

**Files:**
- Modify: `README.md` (Add "AI Tutor powered by Otari" section with architecture diagram, feature map, file links, setup steps)
- Create: `docs/OTARI_HACKATHON_SUBMISSION.md` (DoraHacks submission package, written feedback, video demo scripts)
- Create: `docs/OTARI_FEEDBACK_ISSUE.md` (Real issue/PR report for `mozilla-ai/otari`)

- [ ] **Step 1: Document architecture, Otari feature matrix, and setup instructions in `README.md`**
- [ ] **Step 2: Draft complete DoraHacks submission write-up with scripts for Flows A-E and written feedback in `docs/OTARI_HACKATHON_SUBMISSION.md`**
- [ ] **Step 3: Prepare real issue report for `mozilla-ai/otari` repository in `docs/OTARI_FEEDBACK_ISSUE.md`**
- [ ] **Step 4: Final verification and commit: `docs: add Otari AI Tutor documentation, demo scripts, and feedback submission package`**
