# DB Explorer — Learn Databases Interactively

A hands-on application for understanding databases through real queries, visual comparisons, and interactive lessons.

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
