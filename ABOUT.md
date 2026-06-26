# DB Explorer — Project Documentary

A complete history of building an interactive database learning platform, from initial concept to final product.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Development Timeline](#development-timeline)
- [Phase 1: Initial Build](#phase-1-initial-build)
- [Phase 2: UI Enhancement & Tutorial Expansion](#phase-2-ui-enhancement--tutorial-expansion)
- [Phase 3: Deep-Dive Language Tutorials](#phase-3-deep-dive-language-tutorials)
- [Phase 4: Full UI Overhaul — Gradient Removal](#phase-4-full-ui-overhaul--gradient-removal)
- [Phase 5: Schema Explorer & Compare Enhancements](#phase-5-schema-explorer--compare-enhancements)
- [Phase 6: Bug Fixes](#phase-6-bug-fixes)
- [Current State](#current-state)
- [Technical Reference](#technical-reference)

---

## Project Overview

**DB Explorer** is a self-contained, interactive learning platform that teaches databases through real queries against real engines. It runs 6 database engines locally, integrates with 2 cloud providers, and provides 30 lessons covering 232 concepts across the entire spectrum of database technology.

**Repository:** https://github.com/Rishideep-Mandavilli/DB-Explorer  
**Stack:** Node.js + Express (backend), React + Vite + Tailwind (frontend)  
**Status:** Complete, fully tested, all features working locally

---

## Development Timeline

| Phase | What Was Done |
|-------|--------------|
| Phase 1 | Initial build — full app with 6 engines, 8 lessons, basic UI |
| Phase 2 | Expanded to 18 lessons, gradient UI, richer content |
| Phase 3 | Added 12 more tutorials (19-30) covering all database topics |
| Phase 4 | Removed all gradients, added search, progress tracking, query history |
| Phase 5 | Rewrote Schema Explorer and Compare with technical depth |
| Phase 6 | Fixed LevelDB bug, cleaned up deployment attempts |

---

## Phase 1: Initial Build

### What Was Built

The entire application architecture from scratch:

**Server (Express.js)**
- REST API with 6 database engine endpoints
- Socket.io for real-time communication
- Auto-seeding with sample data

**6 Database Engines:**

| Engine | Type | Data |
|--------|------|------|
| SQLite | Relational (B-tree) | 5 tables, FK relationships |
| LevelDB | Key-Value (LSM-tree) | 8 entries, prefix groups |
| Graph DB | Property Graph | 10 nodes, 12 edges |
| Time-Series | Metrics | 5 metrics × 168 points |
| Vector | Embeddings | 12 docs, 6-dimensional |
| MongoDB | Document | 3 collections, nested JSON |

**Frontend (React + Vite + Tailwind)**
- 6 page modules: Lessons, LessonDetail, Sandbox, Compare, Explorer, Providers
- 6 components: QueryResult, GraphVisualizer, TimeSeriesChart, CapExplorer, ComparisonView, SchemaViewer

**8 Initial Lessons:**
1. What is a Database?
2. Relational Databases & SQL
3. Key-Value Stores
4. Graph Databases
5. Time-Series Databases
6. Vector Databases & AI
7. CAP Theorem
8. Database Comparison

---

## Phase 2: UI Enhancement & Tutorial Expansion

### Tutorials: 8 → 18

Added 10 lessons:
- SQL Language Deep Dive (DDL/DML/DCL, window functions, CTEs)
- MongoDB & Document Queries (aggregation pipeline)
- Cypher: Graph Query Language (MATCH, patterns)
- Time-Series Query Languages (InfluxQL, PromQL, Flux)
- Redis & Key-Value Patterns (data structures, pub/sub)
- Database Design & Modeling (normalization, ER diagrams)
- Indexing & Query Performance (B-Tree, composite indexes)
- NoSQL Data Modeling (embedding vs referencing)
- Distributed Systems (replication, sharding, consensus)
- Database Comparison Matrix (polyglot persistence)

### New Engine Added: MongoDB

- Full document database simulator
- Aggregation pipeline with $match, $group, $sort, $unwind, $project
- Query operators: $gt, $gte, $in, $ne, $exists, $elemMatch
- Nested field queries with dot notation

### UI Enhancements

- Gradient backgrounds and text effects
- Glassmorphism card design
- Animated glow effects
- SVG graph visualization
- Time-series charts with Recharts
- CAP theorem interactive triangle

---

## Phase 3: Deep-Dive Language Tutorials

### Tutorials: 18 → 30

Added 12 more lessons covering advanced topics:
- SQL Transactions & Concurrency (isolation levels, MVCC, deadlocks)
- PostgreSQL Advanced Features (JSONB, full-text search, materialized views)
- MySQL & Storage Engines (InnoDB vs MyISAM, replication)
- MongoDB Advanced Operations (change streams, sharding, GridFS)
- Cassandra & Column-Family (CQL, tunable consistency, compaction)
- Elasticsearch & Full-Text Search (inverted indexes, BM25 scoring)
- DynamoDB & Cloud-Native (partition design, GSIs, DAX)
- Data Warehousing & Analytics (OLAP vs OLTP, star schemas, ETL)
- Database Security (SQL injection, encryption, RBAC, GDPR)
- Backup, Recovery & Monitoring (WAL, PITR, EXPLAIN ANALYZE)
- Database Migrations & DevOps (expand/contract, blue-green)
- Real-World Architecture (Instagram, Uber, Netflix, Discord, Slack)

### Total: 30 lessons, 232 concepts

---

## Phase 4: Full UI Overhaul — Gradient Removal

### Every Gradient Eliminated (20 instances removed)

All `bg-gradient-to-*`, `text-gradient-*`, `radial-gradient`, `linear-gradient` replaced with solid colors (`bg-blue-600`, `bg-green-600`, etc.).

**CSS reduced:** 37KB → 25KB (32% smaller)

### New Features Added

| Feature | Description |
|---------|-------------|
| **Search** | Filter lessons by title, description, or concept |
| **Progress tracking** | Check/uncheck lessons, progress bar, localStorage |
| **Query history** | Last 20 queries saved, clickable to re-run |
| **Run All** | Button to run all comparison queries sequentially |
| **Timing display** | Duration shown per query result |
| **Performance bars** | Visual bar chart comparing query timings |
| **Decision guides** | "When to choose which" per comparison scenario |

### Compare: 5 → 10 scenarios

Added: Flexible Schema, Complex Aggregation, Graph vs SQL Paths, Multi-Dimensional Filtering, Write Patterns

---

## Phase 5: Schema Explorer & Compare Enhancements

### Schema Explorer — Complete Rewrite

**Per-engine technical details:**
- How Data Is Stored (storage engine internals)
- Schema Pattern (how to model data)
- Access Patterns with Big-O complexity (5 per engine)
- Index Types supported
- When to Use / Avoid (decision guidance)
- Quick Facts (consistency, scaling, max size)
- Real-World Usage (which companies use it)

### SchemaViewer — Fixed LevelDB

**Bug:** LevelDB's schema `{ description: "..." }` crashed the relational handler (tried to `.map()` over a string).

**Fix:** Added `hasRealTables` check — detects non-relational schemas and renders appropriate view.

### Compare — Complete Rewrite

**10 scenarios with:**
- Run All button
- Query timing with visual bars
- Decision guides per scenario
- Query explanations (why this approach)
- Multi-engine comparisons

---

## Phase 6: Bug Fixes

### LevelDB Black Screen

**Problem:** Selecting LevelDB showed a blank screen in Sandbox and Schema Explorer.

**Root cause:** SchemaViewer's relational fallback matched `{ description: "..." }` as a relational schema and crashed trying to render it as tables.

**Fix:** Added `hasRealTables` check to detect non-relational schemas.

### Missing LevelDB Schema Function

**Problem:** `server/engines/level.js` didn't export `schema()`, causing crashes on `/api/engines/level/schema`.

**Fix:** Added `schema()` function returning a description object.

---

## Current State

### What Works

| Feature | Status |
|---------|--------|
| 6 database engines (SQLite, LevelDB, Graph, TimeSeries, Vector, MongoDB) | Working |
| 2 cloud providers (Supabase, Firebase Firestore) | Demo mode |
| 30 interactive lessons | Working |
| Query Sandbox with presets | Working |
| Compare (10 scenarios with timing) | Working |
| Schema Explorer (technical details) | Working |
| Progress tracking | Working |
| Query history | Working |

### How to Run

```bash
cd db-explorer
npm run seed     # Seed all 6 databases
npm run dev      # Server:3001 + Client:5173
```

Open **http://localhost:5173**

### Project Stats

| Metric | Value |
|--------|-------|
| Database engines | 6 |
| Cloud providers | 2 |
| Lessons | 30 |
| Concepts covered | 232 |
| Comparison scenarios | 10 |
| Source files | 39 |
| Total lines of code | 15,500+ |
| Server dependencies | 7 |
| Client dependencies | 6 |

---

## Technical Reference

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/engines` | List all engines |
| GET | `/api/engines/:engine` | Engine info |
| GET | `/api/engines/:engine/schema` | Schema structure |
| POST | `/api/engines/:engine/query` | Execute query |
| POST | `/api/engines/:engine/reset` | Reset to seed data |
| GET | `/api/lessons` | All 30 lessons |
| GET | `/api/lessons/:id` | Single lesson with content |
| GET | `/api/providers` | Cloud providers |
| POST | `/api/providers/:provider/query` | Provider operation |

### Environment Variables (Optional)

```bash
# Cloud providers — app works without these
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
PORT=3001
```

### Project Structure

```
db-explorer/
├── server/
│   ├── index.js              # Express + Socket.io server
│   ├── lessons.js            # 30 lessons (3100+ lines)
│   ├── seed.js               # Database seeder
│   └── engines/              # 6 engines + 2 providers
│       ├── sqlite.js
│       ├── level.js
│       ├── graph.js
│       ├── timeseries.js
│       ├── vector.js
│       ├── mongodb.js
│       ├── supabase.js
│       └── firestore.js
├── client/
│   └── src/
│       ├── modules/          # 6 page components
│       │   ├── Lessons.jsx
│       │   ├── LessonDetail.jsx
│       │   ├── Sandbox.jsx
│       │   ├── Compare.jsx
│       │   ├── Explorer.jsx
│       │   └── Providers.jsx
│       ├── components/       # 6 reusable components
│       │   ├── QueryResult.jsx
│       │   ├── GraphVisualizer.jsx
│       │   ├── TimeSeriesChart.jsx
│       │   ├── CapExplorer.jsx
│       │   ├── ComparisonView.jsx
│       │   └── SchemaViewer.jsx
│       ├── hooks/useDb.js
│       └── utils/api.js
├── ABOUT.md                  # This file
├── README.md                 # Quick start guide
└── package.json              # Server dependencies
```

---

## License

Educational use. Built for learning databases.
