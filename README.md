# DB Explorer — Learn Databases Interactively

A hands-on application for understanding databases through real queries, visual comparisons, and interactive lessons.

## Quick Start

```bash
cd db-explorer
npm run setup    # Install dependencies
npm run seed     # Seed sample data
npm run dev      # Start server + client
```

Open http://localhost:5173

## What's Inside

### 5 Database Engines (run locally)
- **SQLite** — Relational: SQL, JOINs, indexes, ACID
- **LevelDB** — Key-value: O(1) lookups, LSM-trees
- **Graph DB** — Neo4j-style: BFS, shortest path, traversal
- **Time-Series** — InfluxDB-style: range queries, downsampling, aggregation
- **Vector DB** — Embedding search: cosine similarity, semantic search

### 2 Cloud Providers (demo mode, activate with env vars)
- **Supabase** — PostgreSQL + REST API + real-time
- **Firebase Firestore** — Document DB + real-time sync

### 8 Interactive Lessons
1. What is a Database?
2. Relational Databases & SQL
3. Key-Value Stores
4. Graph Databases
5. Time-Series Databases
6. Vector Databases & AI
7. CAP Theorem
8. Database Comparison

### Features
- **Query Sandbox** — Write and run queries against any engine
- **Compare Mode** — Same problem, different databases side-by-side
- **Schema Explorer** — See how data is structured in each type
- **Graph Visualizer** — Interactive node-edge diagrams
- **Time-Series Charts** — Visualize metric trends
- **CAP Theorem Explorer** — Interactive triangle diagram

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
- Backend: Express, SQLite (better-sqlite3), LevelDB
- Frontend: React, Vite, Tailwind CSS, Recharts
- Real-time: Socket.io
