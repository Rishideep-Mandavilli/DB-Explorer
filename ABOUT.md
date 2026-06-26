# DB Explorer — Learn Databases Interactively

A comprehensive, hands-on learning platform for understanding databases through real queries, live engines, and interactive visualizations. From SQL basics to distributed systems architecture, this application teaches everything you need to know about databases.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Database Engines](#database-engines)
- [Cloud Providers](#cloud-providers)
- [Complete Curriculum (30 Lessons)](#complete-curriculum)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Development](#development)

---

## Overview

DB Explorer is a self-contained educational application that runs 6 database engines locally and integrates with 2 cloud providers. It provides 30 interactive lessons covering 232 concepts across the entire spectrum of database technology.

### What You'll Learn

| Domain | Topics |
|--------|--------|
| **Relational Databases** | SQL (DDL/DML/DCL/TCL), JOINs, window functions, CTEs, subqueries, indexing, normalization |
| **Document Databases** | MongoDB CRUD, aggregation pipeline, schema design, change streams, sharding |
| **Key-Value Stores** | Redis data structures, LevelDB LSM-trees, caching patterns, pub/sub |
| **Graph Databases** | Neo4j Cypher, BFS/DFS traversal, shortest path, pattern matching |
| **Time-Series Databases** | InfluxQL, PromQL, Flux, downsampling, retention policies |
| **Vector Databases** | Embeddings, cosine similarity, HNSW indexes, RAG |
| **Cloud Databases** | Supabase (PostgreSQL), Firebase Firestore, DynamoDB |
| **Database Design** | Normalization, ER diagrams, schema patterns, anti-patterns |
| **Transactions** | ACID, isolation levels, MVCC, deadlocks, locking strategies |
| **Advanced SQL** | PostgreSQL JSONB, MySQL InnoDB, full-text search, materialized views |
| **Distributed Systems** | Replication, sharding, CAP theorem, consensus protocols |
| **Security** | SQL injection, encryption, RBAC, row-level security |
| **Operations** | Backup/recovery, WAL, monitoring, migrations, DevOps |
| **Real-World Architecture** | Instagram, Uber, Netflix, Discord, Slack case studies |

---

## Quick Start

```bash
# Clone and setup
cd db-explorer
npm run setup       # Install all dependencies

# Seed sample data
npm run seed        # Populate all 6 engines with test data

# Start development server
npm run dev         # Starts server (port 3001) + client (port 5173)
```

Open **http://localhost:5173** in your browser.

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+
- No database installation required — all engines run embedded

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  Lessons • Sandbox • Compare • Schema • Cloud       │
├─────────────────────────────────────────────────────┤
│                  Vite Dev Server                    │
│              Proxy /api → localhost:3001             │
├─────────────────────────────────────────────────────┤
│                   Backend (Express)                  │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  SQLite  │ │ LevelDB  │ │  Graph   │           │
│  │ (relat.) │ │ (KV)     │ │ (Neo4j)  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  TimeS.  │ │  Vector  │ │ MongoDB  │           │
│  │(InfluxDB)│ │(embed.)  │ │(document)│           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  ┌──────────┐ ┌──────────┐                         │
│  │ Supabase │ │Firebase  │  (Cloud providers)      │
│  └──────────┘ └──────────┘                         │
└─────────────────────────────────────────────────────┘
```

### Request Flow

1. User clicks "Run" on a query in the frontend
2. Frontend sends POST `/api/engines/{engine}/query` with `{ operation, params }`
3. Express routes to the appropriate engine module
4. Engine executes against its embedded data store
5. Result returned with timing metadata
6. Frontend renders in tables, charts, or graph visualizations

---

## Database Engines

### SQLite (Relational)
- **Type:** SQL, ACID, B-tree indexed
- **Data:** Users, products, categories, orders, order_items
- **Supports:** Full SQL — JOINs, subqueries, window functions, CTEs, recursive queries
- **File:** `server/data/sqlite.db`

### LevelDB (Key-Value)
- **Type:** LSM-tree, ordered key-value, persistent
- **Data:** Users, sessions, cache entries, counters, config
- **Supports:** get, put, del, list (prefix scan), count, batch
- **File:** `server/data/leveldb/`

### Graph Database (Neo4j-style)
- **Type:** In-memory property graph
- **Data:** Persons, projects, cities, skills with 12 relationships
- **Supports:** BFS, DFS, shortest path, neighbors, text search
- **File:** `server/data/graph.json`

### Time-Series Database (InfluxDB-style)
- **Type:** Timestamped metrics with tags
- **Data:** 5 metrics × 168 data points (7 days hourly) — CPU, memory, requests, errors, latency
- **Supports:** Range queries, aggregations (avg/sum/min/max/count), downsampling, writes
- **File:** `server/data/timeseries.json`

### Vector Database
- **Type:** Embedding storage with similarity search
- **Data:** 12 documents with 6-dimensional embeddings
- **Supports:** Text search, vector similarity (cosine), insert, delete
- **File:** `server/data/vectors.json`

### MongoDB (Document)
- **Type:** JSON document store with aggregation pipeline
- **Data:** Users (5), orders (6), products (5) — nested objects, arrays
- **Supports:** find, findOne, aggregate ($match, $group, $sort, $unwind, $project, $limit), insertOne, updateOne, deleteOne
- **File:** `server/data/mongodb.json`

---

## Cloud Providers

### Supabase
- **Database:** PostgreSQL
- **Integration:** REST API via PostgREST, real-time via WebSocket
- **SDK:** `@supabase/supabase-js`
- **Operations shown:** SELECT, INSERT, real-time subscriptions
- **Setup:** Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables

### Firebase Firestore
- **Database:** Google's document database
- **Integration:** gRPC/WebSocket, offline-first SDK
- **SDK:** `firebase/firestore`
- **Operations shown:** getDocs, queries with filters, addDoc, onSnapshot (real-time)
- **Setup:** Set `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT` environment variables

Both providers run in **demo mode** by default, showing the exact API code and explaining how each call works under the hood.

---

## Complete Curriculum

### Foundations (Lessons 1–8)

| # | Lesson | Description |
|---|--------|-------------|
| 1 | **What is a Database?** | Evolution from flat files, CRUD operations, ACID properties, index types (B-Tree, Hash, LSM, GIN), database type overview |
| 2 | **Relational Databases & SQL** | Tables, schemas, primary/foreign keys, JOINs (INNER, LEFT, RIGHT), GROUP BY, HAVING, WHERE, subqueries |
| 3 | **Key-Value Stores** | LSM-tree internals, key naming conventions, get/put/del, prefix scans, batch operations, tombstone deletes |
| 4 | **Graph Databases** | Nodes/edges/properties, BFS/DFS, shortest path, Cypher/Gremlin syntax, real-world use cases |
| 5 | **Time-Series Databases** | Data model (measurement + timestamp + tags), why not SQL, compression, downsampling |
| 6 | **Vector Databases & AI** | Embedding creation, cosine similarity, HNSW/IVF/PQ indexes, RAG workflow |
| 7 | **CAP Theorem** | Consistency/Availability/Partition tolerance, PACELC, CP vs AP systems |
| 8 | **Database Comparison** | Same problem solved by different databases — user lookup, social graph, metrics, semantic search |

### Query Languages (Lessons 9–13)

| # | Lesson | Description |
|---|--------|-------------|
| 9 | **SQL Language Deep Dive** | DDL (CREATE/ALTER/DROP), DML (SELECT/INSERT/UPDATE/DELETE), DCL (GRANT/REVOKE), Window Functions (ROW_NUMBER, RANK, LAG, SUM OVER), CTEs, Set Operations, CASE/PIVOT |
| 10 | **MongoDB & Document Queries** | Document model, CRUD, Aggregation pipeline ($match→$group→$sort→$project→$unwind), dot notation, array queries, operators ($gt, $in, $elemMatch) |
| 11 | **Cypher: Graph Query Language** | MATCH patterns `(a)-[:KNOWS]->(b)`, variable-length paths `*1..3`, shortestPath(), CREATE/MERGE, pattern comprehension |
| 12 | **Time-Series Query Languages** | InfluxQL, PromQL, Flux comparison, GROUP BY time(), rate(), histogram_quantile() |
| 13 | **Redis & Key-Value Patterns** | Data structures (Strings, Lists, Hashes, Sets, Sorted Sets, Streams), rate limiting, sessions, leaderboards, pub/sub, Lua scripting |

### Design & Performance (Lessons 14–18)

| # | Lesson | Description |
|---|--------|-------------|
| 14 | **Database Design & Modeling** | Normalization (1NF→BCNF), ER diagrams, cardinality, surrogate vs natural keys, soft deletes, tree patterns, EAV, anti-patterns |
| 15 | **Indexing & Query Performance** | B-Tree/Hash/GIN/GiST indexes, composite indexes, covering indexes, query planner, EXPLAIN, partial indexes, pivot patterns |
| 16 | **NoSQL Data Modeling** | Embedding vs referencing, bucket pattern, outbox pattern, schema versioning, computed documents, materialized views |
| 17 | **Distributed Systems** | Master-slave/multi-master replication, sharding (hash/range/consistent hashing), consensus (Raft/Paxos), consistency models |
| 18 | **Database Comparison Matrix** | Polyglot persistence for e-commerce, social media, IoT, chat — which databases work together |

### Advanced Database Topics (Lessons 19–23)

| # | Lesson | Description |
|---|--------|-------------|
| 19 | **SQL Transactions & Concurrency** | Isolation levels (Read Uncommitted→Serializable), MVCC, pessimistic/optimistic locking, deadlocks, savepoints |
| 20 | **PostgreSQL Advanced Features** | JSONB operations, array columns, full-text search (tsvector/tsquery), materialized views, recursive CTEs, LATERAL joins, FILTER clause |
| 21 | **MySQL & Storage Engines** | InnoDB vs MyISAM, buffer pool, redo/undo logs, binary logging, replication (async/semi-sync/GTID), partitioning, clustered indexes |
| 22 | **MongoDB Advanced Operations** | Multi-document transactions, change streams, sharding strategy, schema validation, GridFS, read/write concern, read preference |
| 23 | **Cassandra & Column-Family** | Partition keys, clustering columns, CQL syntax, replication factor, tunable consistency, compaction (SizeTiered/Leveled/TimeWindow), data modeling |

### Search & Cloud (Lessons 24–26)

| # | Lesson | Description |
|---|--------|-------------|
| 24 | **Elasticsearch & Full-Text Search** | Inverted indexes, analyzers (standard/simple/custom), mappings (text vs keyword), Query DSL, bool queries, BM25 scoring, fuzzy search, aggregations |
| 25 | **DynamoDB & Cloud-Native** | Partition key design, sort keys, GSIs/LSIs, DAX caching, DynamoDB Streams, single-table design, on-demand vs provisioned capacity |
| 26 | **Data Warehousing & Analytics** | OLAP vs OLTP, star/snowflake schemas, fact/dimension tables, ETL vs ELT, columnar storage, data lake vs warehouse, dbt |

### Operations & Security (Lessons 27–29)

| # | Lesson | Description |
|---|--------|-------------|
| 27 | **Database Security** | SQL injection, prepared statements, encryption (at rest/in transit), RBAC, row-level security, audit logging, GDPR/HIPAA compliance |
| 28 | **Backup, Recovery & Monitoring** | WAL, physical vs logical backups, PITR, EXPLAIN ANALYZE, slow query logs, connection pooling (PgBouncer), Prometheus/Grafana metrics |
| 29 | **Database Migrations & DevOps** | Schema migrations (Flyway/Liquibase/Alembic), zero-downtime (expand/contract), blue-green deploys, batched updates, rollback patterns |

### Architecture (Lesson 30)

| # | Lesson | Description |
|---|--------|-------------|
| 30 | **Real-World Database Architecture** | Instagram (PostgreSQL sharding), Uber (Schemaless/MySQL), Netflix (Cassandra + EVCache), Discord (MongoDB→Cassandra→ScyllaDB), Slack (Vitess), CQRS, Event Sourcing, Data Mesh |

---

## Tech Stack

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | Express 4.x | HTTP server, routing |
| SQLite | better-sqlite3 | Embedded relational DB |
| LevelDB | level | Embedded KV store |
| Real-time | Socket.io | WebSocket communication |
| Cloud | @supabase/supabase-js | Supabase integration |
| Cloud | firebase-admin | Firestore integration |

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 | UI components |
| Bundler | Vite 5 | Build tool, dev server |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| Routing | React Router 6 | Client-side routing |
| Charts | Recharts | Time-series visualization |
| Icons | Lucide React | Icon library |

### Build Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| PostCSS | CSS processing |
| Autoprefixer | Vendor prefixes |
| Concurrently | Run server + client |

---

## Project Structure

```
db-explorer/
├── package.json              # Root package (server deps)
├── README.md                 # This file
├── .gitignore
│
├── server/
│   ├── index.js              # Express server, routes, Socket.io
│   ├── seed.js               # Seed all databases with sample data
│   ├── lessons.js            # 30 lessons with full educational content
│   │
│   ├── engines/
│   │   ├── sqlite.js         # SQLite relational engine
│   │   ├── level.js          # LevelDB key-value engine
│   │   ├── graph.js          # In-memory graph engine
│   │   ├── timeseries.js     # Time-series engine
│   │   ├── vector.js         # Vector similarity engine
│   │   ├── mongodb.js        # MongoDB document engine
│   │   ├── supabase.js       # Supabase cloud provider
│   │   └── firestore.js      # Firebase Firestore provider
│   │
│   └── data/                 # Persistent data (auto-created)
│       ├── sqlite.db
│       ├── leveldb/
│       ├── graph.json
│       ├── timeseries.json
│       ├── vectors.json
│       └── mongodb.json
│
└── client/
    ├── package.json          # Client dependencies
    ├── index.html            # Entry HTML
    ├── vite.config.js        # Vite configuration
    ├── tailwind.config.js    # Tailwind configuration
    ├── postcss.config.js     # PostCSS configuration
    │
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Router, nav, layout
        ├── index.css         # Global styles, animations
        │
        ├── modules/
        │   ├── Lessons.jsx       # Lesson catalog with filters
        │   ├── LessonDetail.jsx  # Lesson content + runnable queries
        │   ├── Sandbox.jsx       # Free-form query editor
        │   ├── Compare.jsx       # Side-by-side comparisons
        │   ├── Explorer.jsx      # Schema visualization
        │   └── Providers.jsx     # Cloud provider integrations
        │
        ├── components/
        │   ├── QueryResult.jsx       # Result table/stats
        │   ├── GraphVisualizer.jsx   # SVG graph diagrams
        │   ├── TimeSeriesChart.jsx   # Recharts line charts
        │   ├── CapExplorer.jsx       # CAP theorem triangle
        │   ├── ComparisonView.jsx    # Side-by-side results
        │   └── SchemaViewer.jsx      # Schema display per engine
        │
        ├── hooks/
        │   └── useDb.js          # Custom hooks for DB operations
        │
        └── utils/
            └── api.js            # API client functions
```

---

## API Reference

### Engines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/engines` | List all available engines |
| GET | `/api/engines/:engine` | Get engine info (name, type, strengths, use cases) |
| GET | `/api/engines/:engine/schema` | Get schema/structure |
| POST | `/api/engines/:engine/query` | Execute a query |
| POST | `/api/engines/:engine/reset` | Reset engine to seed data |

### Query Format

```json
POST /api/engines/:engine/query
{
  "operation": "find",
  "query": "SELECT * FROM users",
  "params": { "collection": "users", "filter": { "age": { "$gte": 30 } } }
}
```

The `query` field is used for SQL engines (SQLite). The `operation` field is used for NoSQL engines (MongoDB, LevelDB, Graph, TimeSeries, Vector).

### Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | List cloud providers with connection status |
| GET | `/api/providers/:provider` | Get provider info and setup instructions |
| POST | `/api/providers/:provider/query` | Execute operation on provider |

### Lessons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lessons` | List all 30 lessons |
| GET | `/api/lessons/:id` | Get lesson with full content |

---

## Configuration

### Environment Variables

```bash
# Cloud providers (optional — app works without them)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Server
PORT=3001
```

### Vite Proxy

The Vite dev server proxies API requests to the Express backend:

```js
// client/vite.config.js
proxy: {
  '/api': 'http://localhost:3001',
  '/socket.io': { target: 'http://localhost:3001', ws: true },
}
```

---

## Development

### Available Scripts

```bash
npm run setup     # Install server + client dependencies
npm run seed      # Seed all databases with sample data
npm run dev       # Start server (3001) + client (5173) concurrently
npm run server    # Start server only
npm run client    # Start client only
```

### Adding a New Engine

1. Create `server/engines/myengine.js` exporting `{ info, schema, query, reset, seed }`
2. Add to `server/index.js` engines object
3. Add presets to `client/src/modules/Sandbox.jsx` ENGINE_PRESETS
4. Add category style to `client/src/modules/Lessons.jsx` CATEGORY_STYLES

### Adding a New Lesson

1. Add lesson object to `server/lessons.js` array
2. The frontend auto-discovers lessons from the API
3. If using a new demo type, add renderer to `LessonDetail.jsx`

### Data Persistence

All embedded databases store data in `server/data/`. Run `npm run seed` to reset. The `.gitignore` excludes this directory.

---

## License

Educational use. Built with ❤️ for learning databases.
