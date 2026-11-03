# DB Explorer — Learn Databases Interactively

A hands-on application for understanding databases through real queries, visual comparisons, and interactive lessons.

## AI Tutor powered by Mozilla Otari

An intelligent, interactive AI Tutor embedded across all 30 lessons and the Query Sandbox, routed exclusively through the hosted **[Mozilla Otari Gateway](https://otari.ai)** (`https://api.otari.ai/v1`). All interactions leverage open-weight models with zero direct provider calls.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DB Explorer Client (Vite)                       │
│  [Lesson Detail Page]               [Query Sandbox Editor]             │
│            │                                  │                        │
│            ▼                                  ▼                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    AI Tutor Side Panel & Drawer                  │  │
│  │  • Model Role Badge          • Daily Credit Meter ($0.05/day)    │  │
│  │  • Tool Activity Cards       • Otari Telemetry Debug Drawer      │  │
│  │  • Official Doc Citations    • Guardrail Alert Notifications     │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ /api/tutor/*
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DB Explorer Server (Node 20)                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  [server/ai/guardrails.js] Refuse destructive SQL & injections   │  │
│  │  [server/ai/budget.js]     Per-learner budget ($0.05 cap / 403)  │  │
│  │  [server/ai/tutor.js]      Intent router (Explain vs SQL Coder)  │  │
│  │  [server/ai/mcp.js]        Read-only engine MCP server (Backup)  │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ OpenAI SDK (baseURL: api.otari.ai)
                                     │ User ID: anonymous-learner-id
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Hosted Mozilla Otari Gateway                      │
│                                                                        │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────┐  │
│  │ Routing Policies    │  │ Tool Integrations   │  │ Control Plane  │  │
│  │ • Policy: tutor-sql │  │ • Code Execution    │  │ • End-user     │  │
│  │ • Otari-Fallback    │  │   (container: auto) │  │   daily budget │  │
│  │ • Otari-Attempt     │  │ • Web Fetch         │  │ • Spending cap │  │
│  └──────────┬──────────┘  │   (sqlite/postgres) │  │ • Guardrails   │  │
│             │             └──────────┬──────────┘  └────────────────┘  │
└─────────────┼────────────────────────┼─────────────────────────────────┘
              ▼                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Catalog Open-Weight Models                          │
│   • Explainer: google/gemma-2-9b-it (Concepts & Doc Citations)         │
│   • SQL Coder: qwen/qwen-2.5-coder-32b-instruct (Queries & Grading)    │
└────────────────────────────────────────────────────────────────────────┘
```

### The 6 Core Otari Features (Implemented & Tested)

| # | Feature | Implementation Details | File Links |
|---|---------|------------------------|------------|
| **1** | **Multiple Open-Weight Models in Distinct Roles** | Intent-based routing. Explanations route to **Gemma 2 9B**, while query authoring/debugging routes to **Qwen 2.5 Coder 32B**. Active model displayed in UI badge. | [server/ai/tutor.js](file:///server/ai/tutor.js)<br>[client/src/components/TutorPanel.jsx](file:///client/src/components/TutorPanel.jsx) |
| **2** | **Model Routing & Fallbacks** | Uses Otari routing policy `tutor-sql` with automatic fallback to secondary model. Inspects `Otari-Fallback` and `Otari-Attempt-Count` response headers in real-time debug drawer. | [server/ai/tutor.js](file:///server/ai/tutor.js)<br>[client/src/components/TutorDebugDrawer.jsx](file:///client/src/components/TutorDebugDrawer.jsx) |
| **3** | **Containerized Code Execution** | Uses `{"type": "otari_code_execution"}` with `container: "auto"` for "Check my answer" requests. Compares student queries against reference solutions on seeded SQLite datasets. | [server/ai/tutor.js](file:///server/ai/tutor.js)<br>[client/src/components/TutorToolCallBadge.jsx](file:///client/src/components/TutorToolCallBadge.jsx) |
| **4** | **Documentation Web Fetch** | Declares `{"type": "otari_web_fetch"}` with strict `allowed_domains` (`sqlite.org`, `postgresql.org`, `dev.mysql.com`, etc.). Explanations cite fetched documentation pages as clickable source links. | [server/ai/otariClient.js](file:///server/ai/otariClient.js)<br>[client/src/components/TutorPanel.jsx](file:///client/src/components/TutorPanel.jsx) |
| **5** | **Security Guardrails** | Combines Otari input guardrails (prompt injection block profile) with app-side safety validation refusing destructive queries (`DROP`, `TRUNCATE`, unconstrained `DELETE`, `ATTACH`). | [server/ai/guardrails.js](file:///server/ai/guardrails.js)<br>[client/src/components/TutorPanel.jsx](file:///client/src/components/TutorPanel.jsx) |
| **6** | **Per-User Credit Budgets** | Forwards persistent learner IDs via the `user` parameter. Enforces $0.05/learner/day limit with a live UI credit meter and handles HTTP 403 `budget_exceeded` with reset timers. | [server/ai/budget.js](file:///server/ai/budget.js)<br>[client/src/components/TutorCreditMeter.jsx](file:///client/src/components/TutorCreditMeter.jsx) |
| **7** | **Spending Limits (Backup)** | Configured workspace and key spending ceilings pooling all learners. | [server/ai/routes.js](file:///server/ai/routes.js) |
| **8** | **MCP Integration (Backup)** | Lightweight Model Context Protocol (MCP) server exposing read-only `run_query` and `describe_schema` tools over DB Explorer engines. | [server/ai/mcp.js](file:///server/ai/mcp.js) |

### Setup & Environment Variables

Copy `.env.example` to `.env` and set your Otari credentials:

```bash
cp .env.example .env
```

`.env` configuration parameters:
```env
OTARI_BASE_URL=https://api.otari.ai/v1
OTARI_API_KEY=your_otari_virtual_key_here
OTARI_EXPLAINER_MODEL=google/gemma-2-9b-it
OTARI_CODER_MODEL=tutor-sql
OTARI_CODER_FALLBACK_MODEL=qwen/qwen-2.5-coder-32b-instruct
OTARI_BUDGET_ID=bgt_learner_daily_05
OTARI_DAILY_USER_BUDGET=0.05
```

> **Note:** If `OTARI_API_KEY` is omitted or set to `mock`, DB Explorer operates in high-fidelity local simulation mode, allowing end-to-end verification of all user flows and UI badges without keys.

### Running the AI Tutor Test Suite

Run the automated integration test suite covering all 6 Otari features and hackathon user flows A–E:

```bash
npm run test:tutor
```

---

## Quick Start

```bash
cd db-explorer
npm run setup    # Install all dependencies
npm run seed     # Seed all 6 databases with sample data
npm run dev      # Start server (3001) + client (5173)
```

Open **http://localhost:5173** in your browser.

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+
- No database installation required — all engines run embedded

## What's Inside

### 6 Database Engines (run locally)

| Engine | Type | What It Teaches |
|--------|------|-----------------|
| **SQLite** | Relational | SQL: SELECT, JOINs, GROUP BY, window functions, CTEs |
| **LevelDB** | Key-Value | LSM-trees, prefix scans, get/put/del, batch operations |
| **Graph DB** | Property Graph | BFS/DFS, shortest path, Cypher-style traversal |
| **Time-Series** | Metrics | Range queries, downsampling, aggregations, tags |
| **Vector** | Embeddings | Cosine similarity, semantic search, HNSW indexes |
| **MongoDB** | Document | Aggregation pipeline, nested queries, flexible schema |

### 2 Cloud Providers (demo mode, activate with env vars)
- **Supabase** — PostgreSQL + REST API + real-time subscriptions
- **Firebase Firestore** — Document DB + real-time sync + offline support

### 30 Interactive Lessons (232 concepts)

| Category | Lessons |
|----------|---------|
| Foundations | What is a Database?, Relational & SQL, Key-Value, Graph, Time-Series, Vector, CAP Theorem, Comparison |
| Query Languages | SQL Deep Dive, MongoDB, Cypher, InfluxQL/PromQL, Redis Patterns |
| Design & Performance | Database Design, Indexing, NoSQL Modeling, Distributed Systems, Comparison Matrix |
| Advanced | Transactions, PostgreSQL, MySQL, MongoDB Advanced, Cassandra |
| Search & Cloud | Elasticsearch, DynamoDB, Data Warehousing |
| Operations | Security, Backup/Recovery, Migrations, Real-World Architecture |

### Application Sections

| Section | What It Does |
|---------|-------------|
| **Lessons** | 30 structured tutorials with search, progress tracking, concept filtering |
| **Sandbox** | Free-form query editor, preset queries, query history, 6 engine selector |
| **Compare** | 10 side-by-side scenarios with timing, decision guides, Run All |
| **Schema Explorer** | Per-engine details: storage, access patterns (Big-O), indexes, when to use/avoid |
| **Cloud** | Supabase + Firestore: full API code, architecture diagrams, setup instructions |

### Features

- Query Sandbox with preset queries and history
- Side-by-side database comparisons with performance timing
- Schema Explorer with access patterns and complexity analysis
- Progress tracking (localStorage) and search
- Solid-color UI, no gradients
- All queries run against real embedded engines

## Cloud Provider Setup

### Supabase
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
```

### Firebase
```bash
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js, Express, better-sqlite3, level, Socket.io |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Recharts, React Router 6 |
| Cloud | @supabase/supabase-js, firebase-admin |

## Project Structure

```
db-explorer/
├── server/
│   ├── index.js              # Express server + API routes
│   ├── lessons.js            # 30 lessons (3100+ lines of content)
│   ├── seed.js               # Seed all databases
│   └── engines/              # 6 engines + 2 cloud providers
├── client/
│   └── src/
│       ├── modules/          # 6 page components
│       ├── components/       # 6 reusable components
│       └── utils/            # API client
├── ABOUT.md                  # Full project documentary
└── README.md                 # This file
```

## License

Educational use. Built for learning databases.
