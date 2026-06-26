module.exports = [
  {
    id: '1',
    title: 'What is a Database?',
    category: 'fundamentals',
    description: 'From flat files to organized systems — why databases exist and how they changed everything.',
    concepts: ['Data persistence', 'Structured storage', 'Query languages', 'CRUD', 'ACID', 'Indexes', 'Schema design'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'explanation',
      sections: [
        {
          heading: 'Why Databases Exist',
          content: `Before databases, developers stored data in flat text files, CSV spreadsheets, or binary files. This worked until it didn't — files got corrupted, two users writing at the same time destroyed data, and searching through millions of records meant reading every single line.

A **database** is an organized collection of data that provides:
• **Structured storage** — Data follows a schema (types, constraints, relationships)
• **Efficient access** — Query languages let you ask questions without reading everything
• **Concurrent access** — Multiple users can read/write simultaneously without corruption
• **Durability** — Data survives crashes, power losses, and hardware failures
• **Security** — Access control, encryption, and auditing built in`,
        },
        {
          heading: 'The Evolution of Databases',
          content: `**1960s — Hierarchical (IMS)**
Data organized as a tree. Parent-child relationships only. IBM mainframes. Fast but rigid — no many-to-many relationships.

**1970s — Relational (Oracle, PostgreSQL)**
Ted Codd's relational model. Data in tables with rows and columns. SQL as the query language. ACID transactions. This model dominates today.

**1990s — Object-Oriented (db4o, ObjectDB)**
Store objects directly. No impedance mismatch with code. Didn't replace relational — the impedance mismatch was manageable.

**2000s — NoSQL Revolution (MongoDB, Redis, Cassandra)**
Web scale demanded flexibility. Document stores, key-value pairs, column families. Eventual consistency over ACID. Horizontal scaling.

**2010s — NewSQL (CockroachDB, TiDB)**
ACID + horizontal scaling. Distributed SQL. The best of both worlds.

**2020s — Vector & AI-native (Pinecone, Weaviate)**
Embeddings, semantic search, RAG. Databases designed for AI workloads.`,
        },
        {
          heading: 'CRUD — The Four Operations',
          content: `Every database operation is some combination of four primitives:

| Operation | What it does | SQL | REST API |
|-----------|-------------|-----|----------|
| **Create** | Add new data | INSERT | POST |
| **Read** | Retrieve data | SELECT | GET |
| **Update** | Modify existing data | UPDATE | PUT/PATCH |
| **Delete** | Remove data | DELETE | DELETE |

These four operations are the foundation of every application. Social media (create posts, read feeds, update profiles, delete comments), e-commerce (add items, view catalog, update cart, remove products) — all CRUD.`,
        },
        {
          heading: 'ACID Properties',
          content: `When a transaction is ACID-compliant, the database guarantees:

**Atomicity** — All or nothing. If a bank transfer has two steps (debit + credit), both succeed or both fail. No half-transfers.

**Consistency** — Data always follows rules. If you have a CHECK constraint that age > 0, no transaction can violate it. The database is always in a valid state.

**Isolation** — Concurrent transactions don't interfere. Two people buying the last item simultaneously — one succeeds, one gets an error. No double-selling.

**Durability** — Once committed, data survives. Even if the power goes out right after a COMMIT, the data is on disk and recoverable.

ACID matters most for financial systems, healthcare, and any domain where data correctness is critical. It has a performance cost — that's why NoSQL systems often sacrifice it for speed.`,
        },
        {
          heading: 'Indexes — The Secret to Speed',
          content: `Without an index, finding a row means scanning every row (O(n)). With an index, it's O(log n) or even O(1).

Think of it like a book index. Instead of reading every page to find "PostgreSQL", you check the index, find page 347, go there directly.

**B-Tree Index** (most common) — Balanced tree structure. Great for range queries (WHERE age > 25). Used by PostgreSQL, MySQL InnoDB, SQLite.

**Hash Index** — Perfect for equality lookups (WHERE id = 123). O(1) but can't do ranges. Used by Redis, Memcached.

**LSM-Tree** — Write-optimized. Batches writes in memory, periodically flushes to disk. Used by LevelDB, Cassandra, InfluxDB.

**GIN/Full-text** — Indexes on arrays, text search. Used by PostgreSQL's full-text search.

Trade-off: Indexes speed up reads but slow down writes (each write must update the index too).`,
        },
        {
          heading: 'Types of Databases',
          content: `Not all databases are the same. The major types:

| Type | Model | Best For | Examples |
|------|-------|----------|----------|
| **Relational** | Tables with rows/columns | Structured data, complex queries | PostgreSQL, MySQL, SQLite |
| **Document** | JSON/BSON documents | Flexible schemas, nested data | MongoDB, CouchDB |
| **Key-Value** | Simple key→value map | Caching, sessions, counters | Redis, LevelDB, DynamoDB |
| **Graph** | Nodes + edges | Relationships, social networks | Neo4j, Amazon Neptune |
| **Time-Series** | Timestamped metrics | Monitoring, IoT, analytics | InfluxDB, TimescaleDB |
| **Column-Family** | Sparse columns per row | Large-scale analytics | Cassandra, HBase |
| **Vector** | High-dimensional vectors | AI/ML, similarity search | Pinecone, Weaviate, Milvus |

This app lets you explore all of these interactively.`,
        },
      ],
    },
  },
  {
    id: '2',
    title: 'Relational Databases & SQL',
    category: 'relational',
    description: 'Tables, relationships, and the language that runs most of the world\'s data.',
    concepts: ['Tables & schemas', 'Primary & foreign keys', 'JOINs (INNER, LEFT, RIGHT, CROSS)', 'GROUP BY & HAVING', 'Indexes', 'Transactions', 'Normalization'],
    type: 'interactive',
    engine: 'sqlite',
    demo: {
      type: 'queries',
      intro: {
        title: 'How Relational Databases Work',
        content: `A relational database stores data in **tables** (also called relations). Each table has:
• **Columns** — Define the structure (name, type, constraints)
• **Rows** — Individual records of data

Tables are connected through **relationships** using primary keys (PK) and foreign keys (FK). This is the "relational" part — data is related across tables.

**Our sample schema:**
\`\`\`
users (id, name, email, created_at)
categories (id, name)
products (id, name, price, category_id → categories, stock)
orders (id, user_id → users, total, status, created_at)
order_items (id, order_id → orders, product_id → products, quantity, price)
\`\`\`

This models a simple e-commerce system. Users place orders, orders contain items, items reference products, products belong to categories.`,
      },
      queries: [
        {
          label: 'List all users',
          sql: 'SELECT * FROM users',
          explanation: 'SELECT * returns all columns. FROM specifies the table. This is the simplest SQL query — a full table scan. For large tables, avoid SELECT * in production (use specific columns).',
          concept: 'Basic SELECT',
        },
        {
          label: 'Products with categories (JOIN)',
          sql: "SELECT p.name, p.price, c.name as category FROM products p JOIN categories c ON p.category_id = c.id",
          explanation: 'JOIN combines rows from two tables. Here we JOIN products with categories using the foreign key relationship (p.category_id = c.id). The "p" and "c" are table aliases — shorthand for writing less. Without the JOIN, you\'d only have a category_id number — the JOIN gives you the human-readable name.',
          concept: 'INNER JOIN',
        },
        {
          label: 'Orders with user names',
          sql: "SELECT u.name, o.total, o.status FROM orders o JOIN users u ON o.user_id = u.id",
          explanation: 'Another JOIN, this time between orders and users. The foreign key o.user_id references u.id. In production, you\'d add an index on user_id for fast lookups: CREATE INDEX idx_orders_user ON orders(user_id).',
          concept: 'JOIN with aliases',
        },
        {
          label: 'Total spending by user (GROUP BY)',
          sql: "SELECT u.name, SUM(o.total) as total_spent FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.name ORDER BY total_spent DESC",
          explanation: 'GROUP BY collapses rows with the same value into summary rows. Here it groups orders by user, then SUM() adds up their totals. ORDER BY DESC sorts highest first. Other aggregate functions: COUNT(), AVG(), MIN(), MAX(). This is how dashboards calculate revenue by customer.',
          concept: 'Aggregation',
        },
        {
          label: 'Expensive electronics (WHERE + AND)',
          sql: "SELECT p.name, p.price FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name = 'Electronics' AND p.price > 50",
          explanation: 'WHERE filters rows before grouping. AND combines conditions. You can use =, >, <, >=, <=, !=, LIKE (pattern matching), IN (multiple values), and BETWEEN. Performance tip: the database can use indexes on filtered columns.',
          concept: 'Filtering',
        },
        {
          label: 'Orders by status (COUNT + GROUP BY)',
          sql: "SELECT status, COUNT(*) as count FROM orders GROUP BY status",
          explanation: 'COUNT(*) counts all rows in each group. Combined with GROUP BY, this tells you how many orders are pending vs completed. Essential for dashboards and reporting. Note: COUNT(*) counts all rows including NULLs; COUNT(column) excludes NULLs.',
          concept: 'Counting',
        },
        {
          label: 'Users with no orders (LEFT JOIN)',
          sql: "SELECT u.name FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE o.id IS NULL",
          explanation: 'LEFT JOIN returns ALL rows from the left table, even if there\'s no match in the right table. WHERE o.id IS NULL finds users who have no matching order — a common pattern for "find items that don\'t have X". Also try RIGHT JOIN (rare in practice) and CROSS JOIN (every combination).',
          concept: 'LEFT JOIN (anti-join)',
        },
        {
          label: 'Subquery: products above average price',
          sql: "SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products)",
          explanation: 'A subquery runs inside another query. Here the inner query calculates the average price, then the outer query filters products above it. Subqueries can be in SELECT, FROM, or WHERE clauses. For performance, consider CTEs (WITH clause) or JOINs instead of correlated subqueries.',
          concept: 'Subqueries',
        },
      ],
    },
  },
  {
    id: '3',
    title: 'Key-Value Stores',
    category: 'key-value',
    description: 'The simplest, fastest database model. One key, one value. No queries, no schema.',
    concepts: ['O(1) lookups', 'LSM-trees', 'Bloom filters', 'Write amplification', 'Compaction', 'Prefix scans', 'Batch operations'],
    type: 'interactive',
    engine: 'level',
    demo: {
      type: 'operations',
      intro: {
        title: 'How Key-Value Stores Work',
        content: `A key-value store is a dictionary on disk. You can:
• **Get** a value by its key (O(1) average — hash table)
• **Put** a key-value pair
• **Delete** a key
• **Scan** a range of keys (ordered by key)

That's it. No SQL, no joins, no complex queries. But this simplicity is the point — it's the fastest possible database for simple lookups.

**Storage engine: LSM-Tree (Log-Structured Merge Tree)**
Writes go to an in-memory buffer (memtable). When full, it's flushed to disk as a sorted file (SSTable). Periodically, SSTables are merged (compacted) to reduce read overhead.

**Why key-value stores are everywhere:**
• **Redis** — Caching, sessions, rate limiting, pub/sub
• **LevelDB** — Embedded in Chrome, Android, many tools
• **DynamoDB** — AWS's massive-scale KV store
• **etcd** — Configuration, service discovery (Kubernetes uses it)

**Key naming convention:** Use colons as separators: \`user:123\`, \`session:abc\`, \`cache:homepage\`. This enables prefix scanning — list all users, all sessions, etc.

**When to use KV over relational:** When you only need lookup-by-key. Sessions, caching, user preferences, feature flags, rate limiting counters. When your access pattern is always "give me the value for key X".`,
      },
      operations: [
        {
          label: 'List all stored data',
          operation: 'list',
          params: {},
          explanation: 'Scan returns all key-value pairs. In a real KV store, this is an ordered iteration — keys are sorted. For millions of keys, you\'d use prefix scans instead of listing everything.',
        },
        {
          label: 'Get a specific user',
          operation: 'get',
          params: { key: 'user:1' },
          explanation: 'A point lookup — O(1) with a hash index, or O(log n) with a tree. This is where KV stores shine: single-key reads are extremely fast. The key "user:1" follows the namespace convention.',
        },
        {
          label: 'Get a session',
          operation: 'get',
          params: { key: 'session:abc123' },
          explanation: 'Session storage is the classic KV use case. Web servers store session data with a random session ID as the key. Fast reads on every HTTP request. Redis is the go-to for this.',
        },
        {
          label: 'Prefix scan: all users',
          operation: 'list',
          params: { prefix: 'user:' },
          explanation: 'Prefix scanning finds all keys starting with "user:". This is why colons in key names matter — they enable logical grouping without a schema. You can list all users, all sessions, all cached pages.',
        },
        {
          label: 'Count all entries',
          operation: 'count',
          params: {},
          explanation: 'Counting requires scanning all keys — O(n). KV stores don\'t maintain row counts automatically (unlike SQL\'s COUNT(*)). In production, use a separate counter key that you increment/decrement atomically.',
        },
        {
          label: 'Write: increment counter',
          operation: 'put',
          params: { key: 'counter:pageviews', value: 1043 },
          explanation: 'Put writes or overwrites a value. The key already existed — this is an update, not an insert. KV stores don\'t distinguish between create and update. The previous value is overwritten atomically.',
        },
        {
          label: 'Batch write',
          operation: 'batch',
          params: { operations: [{ type: 'put', key: 'user:4', value: { name: 'Diana', email: 'diana@example.com' } }, { type: 'put', key: 'counter:signups', value: 4 }] },
          explanation: 'Batch operations write multiple keys atomically. In LevelDB, this is a single WAL (Write-Ahead Log) entry — faster than individual writes. Batching is essential for bulk imports.',
        },
        {
          label: 'Delete a key',
          operation: 'del',
          params: { key: 'session:abc123' },
          explanation: 'Delete removes a key. In LSM-trees, this writes a "tombstone" marker — the actual data is removed during compaction. Deletion is optimistic: the tombstone propagates through compaction.',
        },
      ],
    },
  },
  {
    id: '4',
    title: 'Graph Databases',
    category: 'graph',
    description: 'Data as a network of connected things. The natural model for relationships.',
    concepts: ['Nodes & edges', 'Properties on both', 'BFS/DFS traversal', 'Shortest path', 'Cypher query language', 'Index-free adjacency', 'Pattern matching'],
    type: 'interactive',
    engine: 'graph',
    demo: {
      type: 'graph_queries',
      intro: {
        title: 'How Graph Databases Work',
        content: `Graph databases store data as **nodes** (entities) and **edges** (relationships). Both can have **properties** (key-value pairs).

**Our graph has:**
• **Person** nodes — Alice, Bob, Charlie
• **Project** nodes — DB Explorer, Graph Engine
• **City** nodes — Tokyo, Paris
• **Skill** nodes — JavaScript, Python, SQL
• **Relationships** — WORKS_ON, FRIENDS_WITH, LIVES_IN, KNOWS

**Why graph databases exist:**
In SQL, finding "friends of friends of friends" requires 3 self-JOINs on a friendship table — O(n²) or worse. In a graph, it's a traversal — O(k) where k is the number of connections found.

**Key algorithms:**
• **BFS (Breadth-First Search)** — Explore level by level. Find all nodes within N hops.
• **DFS (Depth-First Search)** — Go deep first. Good for detecting cycles, topological sorting.
• **Shortest Path** — BFS with backtracking. Minimum hops between two nodes.
• **PageRank** — How important is each node? Google's original algorithm.

**Query languages:**
• **Cypher** (Neo4j) — ASCII art: \`(a)-[:KNOWS]->(b)\`
• **Gremlin** (Apache TinkerPop) — Traversal steps: \`g.V().hasLabel('Person').out('KNOWS')\`
• **SPARQL** — W3C standard for RDF graphs

**Real-world use cases:**
• **Social networks** — Friend suggestions, feed ranking
• **Knowledge graphs** — Wikipedia, Google's Knowledge Graph
• **Fraud detection** — Unusual connection patterns in financial graphs
• **Recommendations** — "People who bought X also bought Y"
• **Network/IT** — Dependency graphs, impact analysis
• **Bioinformatics** — Protein interaction networks, drug discovery`,
      },
      queries: [
        {
          label: 'Explore Alice\'s network (BFS)',
          operation: 'bfs',
          params: { from: 'alice', depth: 2 },
          explanation: 'BFS from Alice, exploring 2 hops deep. Returns all nodes and edges reachable within 2 steps. In a social network, this would be "Alice + her friends + friends of friends". The visualizer shows the network graphically.',
        },
        {
          label: 'Shortest path: Alice → Charlie',
          operation: 'shortest_path',
          params: { from: 'alice', to: 'charlie' },
          explanation: 'Finds the minimum number of hops between two nodes. In SQL, this requires recursive CTEs — complex and slow. In a graph, BFS naturally finds it. The result shows the path and the edges traversed.',
        },
        {
          label: 'Who does Alice know?',
          operation: 'neighbors',
          params: { node: 'alice' },
          explanation: 'Direct neighbors — all nodes connected by an edge to Alice. In a social network, this is "Alice\'s friends". The edge type tells you the relationship: FRIENDS_WITH, WORKS_ON, KNOWS, LIVES_IN.',
        },
        {
          label: 'Find all people',
          operation: 'search',
          params: { query: 'person' },
          explanation: 'Text search across all node properties. In Neo4j, you\'d create an index: CREATE INDEX FOR (p:Person) ON (p.name). For full-text search, use Elasticsearch as a secondary index.',
        },
        {
          label: 'Find JavaScript skill',
          operation: 'search',
          params: { query: 'javascript' },
          explanation: 'Search for the JavaScript skill node. In a real graph, you\'d query: MATCH (p:Person)-[:KNOWS]->(s:Skill {name: "JavaScript"}) RETURN p to find everyone who knows JavaScript.',
        },
      ],
    },
  },
  {
    id: '5',
    title: 'Time-Series Databases',
    category: 'timeseries',
    description: 'Optimized for timestamped data. Write millions of points per second, query by time range.',
    concepts: ['Timestamps as first-class', 'Downsampling', 'Retention policies', 'Time-range queries', 'Aggregations (avg, sum, max)', 'Tags for dimensions', 'Continuous queries'],
    type: 'interactive',
    engine: 'timeseries',
    demo: {
      type: 'ts_queries',
      intro: {
        title: 'How Time-Series Databases Work',
        content: `Time-series databases (TSDB) are specialized for data that changes over time: server metrics, IoT sensors, stock prices, application logs.

**Data model:**
A time-series data point has:
• **Measurement** (metric name) — cpu_usage, temperature, requests
• **Timestamp** — When it was recorded
• **Value** — The measurement (float, integer, string)
• **Tags** — Key-value metadata for grouping (host=web-01, region=us-east)

**Why not just use SQL?**
SQL databases can store timestamps, but they're not optimized for it. A TSDB:
• Writes are append-only (no updates) → extremely fast writes
• Data is naturally ordered by time → efficient range scans
• Built-in downsampling → "what was the hourly avg over 30 days?"
• Retention policies → auto-delete data older than 90 days
• Compression → 10:1 ratio on numeric time-series

**Storage engine:**
TSDBs typically use a combination of:
• **In-memory buffers** for recent data (hot path)
• **Columnar files** on disk (cold storage)
• **Compression algorithms** like Gorilla (XOR delta encoding)

**Our metrics:**
• cpu_usage — Server CPU utilization (%)
• memory_usage — RAM usage (%)
• requests — HTTP requests per interval
• errors — Error count per interval
• latency — Response time in ms

Each metric has 168 data points (7 days of hourly data) with tags for host and region.`,
      },
      queries: [
        {
          label: 'List available metrics',
          operation: 'list_metrics',
          params: {},
          explanation: 'Shows all measurements with their data points and time range. In InfluxQL (InfluxDB\'s language): SHOW MEASUREMENTS. In PromQL (Prometheus): use the metrics endpoint.',
        },
        {
          label: 'CPU usage last 24 hours',
          operation: 'range',
          params: { metric: 'cpu_usage', from: Date.now() - 86400000, to: Date.now() },
          explanation: 'Range query retrieves all data points within a time window. In InfluxDB: SELECT * FROM cpu_usage WHERE time > now() - 24h. The chart visualizes the trend — look for peaks during business hours.',
        },
        {
          label: 'Average CPU over 7 days',
          operation: 'aggregate',
          params: { metric: 'cpu_usage', from: Date.now() - 7 * 86400000, to: Date.now(), func: 'avg' },
          explanation: 'Aggregation collapses many data points into one summary. avg() gives the mean value. Other functions: sum(), min(), max(), count(), first(), last(). In production, combine with GROUP BY time(1h) for hourly averages.',
        },
        {
          label: 'Peak latency (MAX)',
          operation: 'aggregate',
          params: { metric: 'latency', from: Date.now() - 7 * 86400000, to: Date.now(), func: 'max' },
          explanation: 'MAX returns the highest value in the time range. Critical for SLA monitoring — "99th percentile latency must be under 200ms". For percentile queries, use histogram_quantile() in PromQL or percentile() in InfluxQL.',
        },
        {
          label: 'Downsample to daily',
          operation: 'downsample',
          params: { metric: 'requests', from: Date.now() - 7 * 86400000, to: Date.now(), every: 86400000 },
          explanation: 'Downsampling reduces data resolution for long-range queries. Instead of 168 hourly points, you get 7 daily averages. This is essential for dashboards showing months of data — you don\'t need every second, you need the trend.',
        },
        {
          label: 'Write a new data point',
          operation: 'write',
          params: { metric: 'cpu_usage', value: 78.5, tags: { host: 'web-02', region: 'us-east' } },
          explanation: 'Writes are append-only — you never update existing data. This is why TSDBs are fast: no locks, no updates, just append. Tags enable dimensional queries: "show CPU for web-02" or "compare us-east vs eu-west".',
        },
      ],
    },
  },
  {
    id: '6',
    title: 'Vector Databases & AI',
    category: 'vector',
    description: 'Store embeddings, find similar things. The database behind modern AI applications.',
    concepts: ['Embeddings', 'Cosine similarity', 'Approximate Nearest Neighbor', 'HNSW index', 'RAG (Retrieval Augmented Generation)', 'Semantic search', 'Dimension reduction'],
    type: 'interactive',
    engine: 'vector',
    demo: {
      type: 'vector_queries',
      intro: {
        title: 'How Vector Databases Work',
        content: `A vector database stores **embeddings** — arrays of numbers (e.g., [0.9, 0.1, 0.8, 0.2, 0.5, 0.3]) that represent the meaning of data. Similar things have similar vectors.

**How embeddings are created:**
1. **Text** → An ML model (OpenAI, BERT, sentence-transformers) converts text into a vector
2. **Images** → A CNN or ViT model extracts visual features into a vector
3. **Audio** → A model like Whisper extracts speech features

A 768-dimensional vector from OpenAI's text-embedding-ada-002:
\`\`\`
[0.0123, -0.0456, 0.0789, ...] (768 numbers)
\`\`\`

**Cosine Similarity:**
To find similar vectors, compute the cosine of the angle between them:
• Score of 1.0 = identical direction (very similar)
• Score of 0.0 = orthogonal (unrelated)
• Score of -1.0 = opposite (opposite meaning)

**Why not just use SQL?**
For 10 vectors, SQL works fine: SELECT * ORDER BY cosine_similarity(vector, query) LIMIT 5.
For 10 million vectors, that's O(n) scan — too slow. Vector databases use:
• **HNSW** (Hierarchical Navigable Small World) — Graph-based index, O(log n) search
• **IVF** (Inverted File Index) — Cluster vectors, search nearest clusters
• **PQ** (Product Quantization) — Compress vectors for memory efficiency

**RAG (Retrieval Augmented Generation):**
The killer use case. Instead of relying on an LLM's training data:
1. User asks: "How do I deploy a Node.js app?"
2. Vector DB finds 5 relevant documents
3. These are injected into the LLM's prompt as context
4. LLM generates an answer grounded in your actual documentation

This is how chatbots, search engines, and knowledge bases work in 2024-2025.`,
      },
      queries: [
        {
          label: 'View all vectors',
          operation: 'list',
          params: {},
          explanation: 'Shows all stored embeddings with their metadata. Each vector has an ID, text content, category, and the actual embedding (simplified to 6 dimensions for visualization). In production, vectors are 384-3072 dimensions.',
        },
        {
          label: 'Text search: "database SQL"',
          operation: 'search_by_text',
          params: { query: 'database SQL' },
          explanation: 'This simulates text-based search using word overlap. In a real system, the query text would be converted to an embedding first using an ML model, then cosine similarity is computed against all stored vectors.',
        },
        {
          label: 'Text search: "machine learning"',
          operation: 'search_by_text',
          params: { query: 'machine learning neural' },
          explanation: 'Search for AI/ML content. The vector database finds documents whose embeddings are closest to the query embedding. Notice it finds documents about neural networks and ML even if the exact words don\'t match — that\'s semantic understanding.',
        },
        {
          label: 'Text search: "streaming"',
          operation: 'search_by_text',
          params: { query: 'real-time streaming' },
          explanation: 'Semantic search understands that "real-time streaming" relates to Kafka. Traditional keyword search might miss this if the document says "stream processing" instead. Embeddings capture meaning, not just words.',
        },
        {
          label: 'Similarity search (vector)',
          operation: 'search',
          params: { vector: [0.9, 0.1, 0.8, 0.2, 0.5, 0.3], topK: 3 },
          explanation: 'Direct vector similarity search. The query vector [0.9, 0.1, 0.8, 0.2, 0.5, 0.3] is compared against all stored vectors using cosine similarity. The top 3 most similar are returned with their scores.',
        },
      ],
    },
  },
  {
    id: '7',
    title: 'CAP Theorem & Distributed Systems',
    category: 'theory',
    description: 'Why you can\'t have everything. The fundamental trade-off in distributed databases.',
    concepts: ['Consistency', 'Availability', 'Partition tolerance', 'CP vs AP', 'Eventual consistency', 'PACELC', 'Consensus protocols'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'cap_explorer',
      intro: {
        title: 'Understanding CAP',
        content: `In 2000, Eric Brewer proved that a distributed data store can provide at most **two** of these three guarantees:

**Consistency (C)** — Every read receives the most recent write. All nodes see the same data at the same time. Like a single source of truth.

**Availability (A)** — Every request receives a response (success or failure), without guarantee that it contains the most recent write. The system is always operational.

**Partition Tolerance (P)** — The system continues to operate despite network partitions (nodes can't communicate). In distributed systems, partitions are inevitable — networks fail, cables get cut, hardware breaks.

**The theorem says:** Since network partitions WILL happen, you must choose between Consistency and Availability during a partition.

**PACELC extends CAP:**
If Partition → choose Availability or Consistency
Else (normal operation) → choose Latency or Consistency

This explains why:
• **Cassandra** is AP (available during partition) but EL (low latency in normal ops)
• **PostgreSQL** is CP (consistent during partition) but EC (consistent in normal ops)

**Real-world impact:**
• **Banking** → CP. Better to reject a transaction than show wrong balances.
• **Social media** → AP. Better to show slightly stale posts than go down.
• **E-commerce cart** → Depends. Amazon uses AP (show cart, reconcile later).`,
      },
      systems: [
        { name: 'PostgreSQL', caps: ['C', 'P'], type: 'CP', explanation: 'Strong consistency via synchronous replication. During a network partition, the minority partition becomes unavailable (rejects writes). This ensures no split-brain.' },
        { name: 'Cassandra', caps: ['A', 'P'], type: 'AP', explanation: 'Always writable (each node can accept writes). Data is eventually consistent via anti-entropy repair. Tunable consistency: you can require quorum reads/writes for stronger guarantees.' },
        { name: 'MongoDB', caps: ['C', 'P'], type: 'CP', explanation: 'With majority write concern and read concern "majority", MongoDB provides strong consistency. During partitions, nodes without majority become read-only.' },
        { name: 'Redis Cluster', caps: ['C', 'P'], type: 'CP', explanation: 'Consistent within a hash slot. If the primary node fails, the cluster rejects writes until a replica is promoted. No split-brain.' },
        { name: 'DynamoDB', caps: ['A', 'P'], type: 'AP', explanation: 'Always accepts writes. Eventually consistent reads by default. Strongly consistent reads available but cost 2x. Great for global applications.' },
        { name: 'ZooKeeper / etcd', caps: ['C', 'P'], type: 'CP', explanation: 'Consensus-based (Raft/ZAB). Requires majority quorum. If 3 of 5 nodes can communicate, the cluster works. If only 2 can, it stops. Used for leader election, config, coordination.' },
      ],
    },
  },
  {
    id: '8',
    title: 'Database Comparison',
    category: 'comparison',
    description: 'Same problem, different databases. See the trade-offs in action.',
    concepts: ['Use-case fit', 'Polyglot persistence', 'Right tool for the job', 'Performance trade-offs', 'Consistency models', 'Scaling patterns'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'comparison',
      scenarios: [
        {
          title: 'User Profile Lookup',
          description: 'Find a user by their ID. The most basic access pattern — and different databases handle it very differently.',
          context: 'Every app needs to look up user profiles. The question is: what else does your data need to do?',
          solutions: [
            { type: 'relational', engine: 'sqlite', sql: 'SELECT * FROM users WHERE id = 1', why: 'Structured data with ACID guarantees. Great when you need JOINs (user + their orders + their preferences). The default choice for most apps.', label: 'SQLite' },
            { type: 'key-value', engine: 'level', operation: 'get', params: { key: 'user:1' }, why: 'O(1) lookup. Perfect when you only need get-by-ID. Redis stores this in memory — sub-millisecond reads. No schema, no JOINs, just speed.', label: 'LevelDB' },
          ],
        },
        {
          title: 'Social Graph Traversal',
          description: 'Find friends-of-friends, recommend connections, detect communities.',
          context: 'LinkedIn\'s "degrees of connection", Facebook\'s friend suggestions, Twitter\'s "follow recommendations" — all graph problems.',
          solutions: [
            { type: 'graph', engine: 'graph', operation: 'bfs', params: { from: 'alice', depth: 2 }, why: 'O(1) per hop. The graph is already connected — just follow edges. No JOINs needed. This is what graph databases were born for.', label: 'Graph DB' },
            { type: 'relational', engine: 'sqlite', sql: "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total > 50)", why: 'Possible but painful. Self-JOINs on a friends table are O(n²) at scale. Recursive CTEs help but aren\'t optimized for this pattern.', label: 'SQLite' },
          ],
        },
        {
          title: 'Server Monitoring',
          description: 'Store and analyze CPU, memory, latency metrics over time.',
          context: 'Your servers generate millions of data points per day. How do you store them efficiently and query "what was the average CPU last Tuesday?"',
          solutions: [
            { type: 'timeseries', engine: 'timeseries', operation: 'aggregate', params: { metric: 'cpu_usage', from: Date.now() - 86400000, to: Date.now(), func: 'avg' }, why: 'Time-range queries are O(1) with time partitioning. Downsampling, retention policies, and compression are built in. Designed for exactly this use case.', label: 'TimeSeries DB' },
          ],
        },
        {
          title: 'Semantic Document Search',
          description: 'Find documents similar in meaning to a query — not just keyword matching.',
          context: 'User searches "how to handle errors" — you want to find docs about exception handling, try/catch, error middleware, even if they don\'t use the word "error".',
          solutions: [
            { type: 'vector', engine: 'vector', operation: 'search_by_text', params: { query: 'error handling exceptions' }, why: 'Embeddings capture semantic meaning. "Exception handling" and "error handling" have similar vectors. Keyword search misses this. This is RAG (Retrieval Augmented Generation) at its core.', label: 'Vector DB' },
          ],
        },
        {
          title: 'Session Management',
          description: 'Store and retrieve user session data on every HTTP request.',
          context: 'Every page load needs the session. Latency matters — a 5ms session lookup adds up to 500ms on a page with 100 sub-requests.',
          solutions: [
            { type: 'key-value', engine: 'level', operation: 'get', params: { key: 'session:abc123' }, why: 'In-memory KV stores (Redis) give sub-millisecond reads. Session data is simple: key=session_id, value=user_data. No need for SQL\'s complexity.', label: 'LevelDB/Redis' },
            { type: 'relational', engine: 'sqlite', sql: "SELECT * FROM users WHERE id = 1", why: 'Works for small apps but SQL overhead (parsing, planning, locking) adds latency. SQL shines when sessions need JOINs with user data, permissions, etc.', label: 'SQLite' },
          ],
        },
      ],
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // DEEP-DIVE LANGUAGE TUTORIALS
  // ═══════════════════════════════════════════════════════════════
  {
    id: '9',
    title: 'SQL Language Deep Dive',
    category: 'sql-language',
    description: 'Master SQL from DDL to window functions. The complete language reference with runnable examples.',
    concepts: ['DDL (CREATE, ALTER, DROP)', 'DML (SELECT, INSERT, UPDATE, DELETE)', 'DCL (GRANT, REVOKE)', 'TCL (COMMIT, ROLLBACK)', 'Window Functions', 'CTEs', 'Subqueries', 'Set Operations', 'Data Types', 'Constraints'],
    type: 'interactive',
    engine: 'sqlite',
    demo: {
      type: 'queries',
      intro: {
        title: 'SQL — The Language of Data',
        content: `SQL (Structured Query Language) is the standard language for relational databases. It's been around since the 1970s and remains the most widely used data language.

**SQL has four sub-languages:**

| Sub-language | Purpose | Commands |
|-------------|---------|----------|
| **DDL** (Data Definition) | Define structure | CREATE, ALTER, DROP, TRUNCATE |
| **DML** (Data Manipulation) | Read/write data | SELECT, INSERT, UPDATE, DELETE |
| **DCL** (Data Control) | Access control | GRANT, REVOKE |
| **TCL** (Transaction Control) | Transaction management | COMMIT, ROLLBACK, SAVEPOINT |

**SQL execution order (mental model):**
1. FROM / JOIN — Identify tables
2. WHERE — Filter rows
3. GROUP BY — Group rows
4. HAVING — Filter groups
5. SELECT — Choose columns
6. DISTINCT — Remove duplicates
7. ORDER BY — Sort results
8. LIMIT / OFFSET — Paginate

**Data types in SQLite:**
• INTEGER — Whole numbers (0, -1, 42)
• REAL — Floating point (3.14, -0.001)
• TEXT — Strings ('hello', "world")
• BLOB — Binary data (images, files)
• NULL — Missing/unknown value

**Constraints:**
• PRIMARY KEY — Unique identifier, not null
• NOT NULL — Value required
• UNIQUE — No duplicates
• CHECK — Custom validation rule
• DEFAULT — Fallback value
• FOREIGN KEY — Reference another table`,
      },
      queries: [
        // DDL
        {
          label: 'DDL: CREATE TABLE',
          sql: `CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  salary REAL CHECK (salary > 0),
  hire_date DATE DEFAULT CURRENT_DATE,
  manager_id INTEGER REFERENCES employees(id)
)`,
          explanation: 'CREATE TABLE defines a new table. NOT NULL prevents empty values. CHECK ensures salary is positive. DEFAULT provides fallback. REFERENCES creates a foreign key (self-referencing here for manager hierarchy). IF NOT EXISTS prevents errors on re-run.',
          concept: 'DDL',
        },
        {
          label: 'DDL: INSERT data',
          sql: `INSERT INTO employees (name, department, salary) VALUES
('Alice', 'Engineering', 95000),
('Bob', 'Engineering', 85000),
('Charlie', 'Marketing', 75000),
('Diana', 'Engineering', 92000),
('Eve', 'Sales', 68000)`,
          explanation: 'INSERT adds rows. You can insert multiple rows in one statement. Columns not specified get DEFAULT values or NULL. AUTOINCREMENT handles id automatically.',
          concept: 'DML',
        },
        {
          label: 'SELECT with all clauses',
          sql: `SELECT department, COUNT(*) as headcount, ROUND(AVG(salary), 0) as avg_salary
FROM employees
WHERE salary > 60000
GROUP BY department
HAVING COUNT(*) > 1
ORDER BY avg_salary DESC`,
          explanation: 'This query demonstrates the full SQL execution flow: FROM → WHERE (filter) → GROUP BY (group) → HAVING (filter groups) → SELECT (choose columns) → ORDER BY (sort). Only departments with 2+ employees earning over 60k.',
          concept: 'DML',
        },
        // Window Functions
        {
          label: 'Window Function: ROW_NUMBER',
          sql: `SELECT name, department, salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank_in_dept,
  RANK() OVER (ORDER BY salary DESC) as overall_rank
FROM employees`,
          explanation: 'Window functions compute across a set of rows related to the current row WITHOUT collapsing them (unlike GROUP BY). ROW_NUMBER() gives unique sequential numbers. RANK() handles ties. PARTITION BY creates "windows" per department.',
          concept: 'Window Functions',
        },
        {
          label: 'Window Function: Running total',
          sql: `SELECT name, salary,
  SUM(salary) OVER (ORDER BY hire_date) as running_total,
  salary - LAG(salary) OVER (ORDER BY hire_date) as salary_diff_from_prev,
  ROUND(salary * 100.0 / SUM(salary) OVER (), 1) as pct_of_total
FROM employees
ORDER BY hire_date`,
          explanation: 'SUM() OVER creates a running/cumulative total. LAG() accesses the previous row. You can compute percentages of totals without subqueries. Window functions are the most powerful SQL feature for analytics.',
          concept: 'Window Functions',
        },
        // CTEs
        {
          label: 'CTE: Common Table Expression',
          sql: `WITH dept_stats AS (
  SELECT department, COUNT(*) as cnt, AVG(salary) as avg_sal
  FROM employees GROUP BY department
),
high_earners AS (
  SELECT name, department, salary FROM employees WHERE salary > 85000
)
SELECT h.name, h.salary, d.cnt as dept_size, ROUND(d.avg_sal, 0) as dept_avg
FROM high_earners h
JOIN dept_stats d ON h.department = d.department
ORDER BY h.salary DESC`,
          explanation: 'CTEs (WITH clause) create temporary named result sets. They make complex queries readable by breaking them into logical steps. Think of them as variables for queries. Unlike subqueries, CTEs can be referenced multiple times.',
          concept: 'CTEs',
        },
        // Set Operations
        {
          label: 'Set Operations: UNION, INTERSECT, EXCEPT',
          sql: `SELECT name, 'Engineering' as dept FROM employees WHERE department = 'Engineering'
UNION ALL
SELECT name, 'Non-Engineering' as dept FROM employees WHERE department != 'Engineering'`,
          explanation: 'UNION combines results from two queries. UNION ALL keeps duplicates (faster). UNION removes duplicates. INTERSECT returns only matching rows. EXCEPT returns rows in the first query but not the second. All queries must have the same number of columns.',
          concept: 'Set Operations',
        },
        // Subqueries
        {
          label: 'Correlated Subquery',
          sql: `SELECT name, department, salary,
  (SELECT ROUND(AVG(salary), 0) FROM employees e2 WHERE e2.department = e1.department) as dept_avg,
  salary - (SELECT ROUND(AVG(salary), 0) FROM employees e2 WHERE e2.department = e1.department) as diff_from_avg
FROM employees e1
ORDER BY department, salary DESC`,
          explanation: 'A correlated subquery references the outer query. It runs once per row — efficient for "compare each row to its group" patterns. The subquery in SELECT is called a scalar subquery (returns one value).',
          concept: 'Subqueries',
        },
        // Data manipulation
        {
          label: 'UPDATE with subquery',
          sql: `UPDATE employees SET salary = salary * 1.10
WHERE department = 'Engineering'
AND salary < (SELECT AVG(salary) FROM employees WHERE department = 'Engineering')`,
          explanation: 'UPDATE modifies existing rows. The WHERE clause can use subqueries to target specific rows. This gives a 10% raise to engineers earning below average. Always test with SELECT first!',
          concept: 'DML',
        },
        {
          label: 'DELETE with condition',
          sql: `DELETE FROM employees WHERE id NOT IN (SELECT MIN(id) FROM employees GROUP BY name)`,
          explanation: 'DELETE removes rows. This example removes duplicate names (keeping the one with the lowest id). Dangerous without WHERE — always backup first. In production, use soft deletes (is_deleted flag) instead.',
          concept: 'DML',
        },
      ],
    },
  },
  {
    id: '10',
    title: 'MongoDB & Document Queries',
    category: 'nosql',
    description: 'Document databases: flexible schemas, rich queries, and the aggregation pipeline.',
    concepts: ['Document model', 'CRUD operations', 'Aggregation pipeline', 'Embedding vs referencing', 'Indexing', 'Sharding', 'Change streams'],
    type: 'interactive',
    engine: 'mongodb',
    demo: {
      type: 'mongodb_queries',
      intro: {
        title: 'MongoDB — The Document Database',
        content: `MongoDB stores data as **documents** in **collections**. Documents are JSON-like objects with flexible fields — no fixed schema required.

**Document vs Relational:**
| Concept | SQL | MongoDB |
|---------|-----|---------|
| Database | Database | Database |
| Table | Table | Collection |
| Row | Row | Document |
| Column | Column | Field |
| JOIN | JOIN | Embedding or $lookup |
| Index | Index | Index |

**Our collections:**
• **users** — 5 users with nested address, tags array
• **orders** — 6 orders with embedded items array
• **products** — 5 products with nested specs object

**MongoDB query operators:**
• Comparison: $gt, $gte, $lt, $lte, $ne, $in, $nin
• Logical: $and, $or, $not, $nor
• Element: $exists, $type
• Array: $all, $elemMatch, $size
• Evaluation: $regex, $text

**The Aggregation Pipeline:**
MongoDB's most powerful feature. Documents flow through stages:
\`\`\`
$match → $group → $sort → $project → $limit
\`\`\`
Each stage transforms the data. Like a Unix pipe: \`cat file | grep | sort | head\`

**Embedding vs Referencing:**
• **Embed** — Store related data inside the document (denormalization). Fast reads, larger documents.
• **Reference** — Store just the _id, query separately (normalization). Smaller documents, requires JOINs ($lookup).
Rule of thumb: If data is accessed together, embed it. If it grows unboundedly, reference it.`,
      },
      queries: [
        {
          label: 'Find all users',
          operation: 'find',
          params: { collection: 'users' },
          explanation: 'db.users.find() returns all documents in the collection. Equivalent to SELECT * FROM users. The _id field is auto-generated and unique.',
        },
        {
          label: 'Find with filter',
          operation: 'find',
          params: { collection: 'users', filter: { age: { $gte: 30 } } },
          explanation: 'The filter { age: { $gte: 30 } } finds users aged 30+. Operators: $gt (>), $gte (>=), $lt (<), $lte (<=), $ne (!=), $in (in list). Equivalent to WHERE age >= 30.',
        },
        {
          label: 'Find with nested field',
          operation: 'find',
          params: { collection: 'users', filter: { "address.city": "Tokyo" } },
          explanation: 'Dot notation accesses nested fields. "address.city" navigates into the address object. This is one of MongoDB\'s strengths — query deep into nested documents without JOINs.',
        },
        {
          label: 'Find with array contains',
          operation: 'find',
          params: { collection: 'users', filter: { tags: "admin" } },
          explanation: 'Querying arrays is natural in MongoDB. { tags: "admin" } finds documents where the tags array contains "admin". For multiple values: { tags: { $all: ["admin", "developer"] } }.',
        },
        {
          label: 'Aggregation: Orders by status',
          operation: 'aggregate',
          params: {
            collection: 'orders',
            pipeline: [
              { $group: { _id: "$status", count: { $count: {} }, totalAmount: { $sum: "$amount" } } },
              { $sort: { count: -1 } },
            ],
          },
          explanation: 'The aggregation pipeline: $group groups by status and computes count + total. $sort orders by count descending. Each stage is a pipe — output of one becomes input of the next.',
          concept: 'Aggregation',
        },
        {
          label: 'Aggregation: User spending',
          operation: 'aggregate',
          params: {
            collection: 'orders',
            pipeline: [
              { $group: { _id: "$userId", totalSpent: { $sum: "$amount" }, orderCount: { $count: {} }, avgOrder: { $avg: "$amount" } } },
              { $sort: { totalSpent: -1 } },
            ],
          },
          explanation: 'GROUP BY userId with multiple aggregations: sum, count, and average. This is the equivalent of SQL\'s GROUP BY with aggregate functions. MongoDB computes all of these in one pipeline.',
          concept: 'Aggregation',
        },
        {
          label: 'Aggregation: Unwind items',
          operation: 'aggregate',
          params: {
            collection: 'orders',
            pipeline: [
              { $match: { status: "completed" } },
              { $unwind: "$items" },
              { $group: { _id: "$items.name", totalQty: { $sum: "$items.qty" }, revenue: { $sum: "$items.price" } } },
              { $sort: { revenue: -1 } },
            ],
          },
          explanation: '$unwind explodes the items array into separate documents. Then $group aggregates across all orders. This is how you analyze embedded arrays — flatten them first, then aggregate.',
          concept: 'Aggregation',
        },
        {
          label: 'Find one document',
          operation: 'findOne',
          params: { collection: 'products', filter: { category: 'laptops' } },
          explanation: 'findOne() returns a single document. Useful when you know the result is unique (e.g., by _id or a unique field). Returns null if not found.',
        },
        {
          label: 'Insert a document',
          operation: 'insertOne',
          params: { collection: 'products', doc: { name: 'Webcam', category: 'accessories', price: 79.99, specs: { resolution: '1080p', fps: 30 }, inStock: true } },
          explanation: 'insertOne() adds a document. The _id is auto-generated. Notice the nested specs object and no need to define a schema first — just insert the data you have.',
        },
      ],
    },
  },
  {
    id: '11',
    title: 'Cypher: Graph Query Language',
    category: 'graph-language',
    description: 'Neo4j\'s Cypher language. Pattern matching, path queries, and graph algorithms.',
    concepts: ['MATCH patterns', 'CREATE/MERGE', 'Path patterns', 'Variable-length paths', 'Pattern comprehension', 'Graph algorithms', 'Index management'],
    type: 'interactive',
    engine: 'graph',
    demo: {
      type: 'graph_queries',
      intro: {
        title: 'Cypher — The Graph Query Language',
        content: `Cypher is Neo4j's query language, designed to be intuitive by using ASCII art to represent graph patterns.

**Basic syntax:**
\`\`\`cypher
-- Nodes: (variable:Label)
MATCH (p:Person) RETURN p

-- Relationships: -[variable:TYPE]->
MATCH (p:Person)-[:KNOWS]->(friend:Person) RETURN friend

-- Properties: {key: value}
MATCH (p:Person {name: 'Alice'}) RETURN p.age
\`\`\`

**Key commands:**
• **MATCH** — Find patterns in the graph (like SELECT)
• **CREATE** — Add nodes and relationships
• **MERGE** — Match or create (idempotent)
• **SET** — Update properties
• **DELETE** — Remove nodes/relationships
• **RETURN** — Output results
• **WHERE** — Filter patterns
• **WITH** — Chain queries (pipe intermediate results)
• **ORDER BY / LIMIT / SKIP** — Sort and paginate

**Path patterns:**
\`\`\`cypher
-- Variable length: find paths of 1-3 hops
MATCH path = (a:Person)-[:KNOWS*1..3]->(b:Person)

-- Shortest path
MATCH path = shortestPath((a:Person {name:'Alice'})-[*]-(b:Person {name:'Charlie'}))

-- All shortest paths
MATCH path = allShortestPaths((a)-[*]-(b))
\`\`\`

**Graph algorithms (built-in):**
• PageRank — Node importance
• Community Detection — Find clusters
• Centrality — Most connected nodes
• Similarity — Node similarity scores
• Path finding — Dijkstra, A*`,
      },
      queries: [
        {
          label: 'All Person nodes',
          operation: 'search',
          params: { query: 'Person' },
          explanation: 'In Cypher: MATCH (p:Person) RETURN p. Finds all nodes with the Person label. The colon syntax specifies node labels (types).',
        },
        {
          label: 'Alice\'s direct connections',
          operation: 'neighbors',
          params: { node: 'alice' },
          explanation: 'In Cypher: MATCH (a:Person {name:"Alice"})-[r]->(n) RETURN n, type(r). Traverses all outgoing edges from Alice. The arrow direction matters in directed graphs.',
        },
        {
          label: 'BFS: 2-hop network',
          operation: 'bfs',
          params: { from: 'alice', depth: 2 },
          explanation: 'In Cypher: MATCH (a:Person {name:"Alice"})-[:KNOWS*1..2]-(n) RETURN n. The *1..2 means 1 to 2 hops. Variable-length paths are Cypher\'s superpower — they\'re expensive in SQL.',
          concept: 'Variable-length paths',
        },
        {
          label: 'Shortest path',
          operation: 'shortest_path',
          params: { from: 'alice', to: 'charlie' },
          explanation: 'In Cypher: MATCH path = shortestPath((a:Person {name:"Alice"})-[*]-(b:Person {name:"Charlie"})) RETURN path. BFS naturally finds shortest paths. In SQL, you\'d need recursive CTEs.',
          concept: 'Path finding',
        },
        {
          label: 'Find all skills',
          operation: 'search',
          params: { query: 'javascript' },
          explanation: 'In Cypher: MATCH (s:Skill) WHERE s.name CONTAINS "JavaScript" RETURN s. Text search on node properties. For large graphs, create an index: CREATE INDEX FOR (s:Skill) ON (s.name).',
        },
      ],
    },
  },
  {
    id: '12',
    title: 'Time-Series Query Languages',
    category: 'tsdb-language',
    description: 'InfluxQL, PromQL, and Flux — the specialized languages for time-series data.',
    concepts: ['InfluxQL SELECT', 'GROUP BY time()', 'PromQL metrics & ranges', 'Flux pipe operators', 'Retention policies', 'Continuous queries', 'Downsampling'],
    type: 'interactive',
    engine: 'timeseries',
    demo: {
      type: 'ts_queries',
      intro: {
        title: 'Time-Series Query Languages',
        content: `Time-series databases have specialized query languages optimized for temporal data.

**InfluxQL (InfluxDB):**
SQL-like syntax for time-series. SELECT with time functions.
\`\`\`
SELECT mean("value") FROM "cpu_usage"
WHERE time > now() - 1h
GROUP BY time(5m), "host"
\`\`\`

**PromQL (Prometheus):**
Prometheus's query language. Metric names + label selectors.
\`\`\`
rate(http_requests_total[5m])          -- requests per second
histogram_quantile(0.99, latency)      -- 99th percentile
sum by (method) (rate(errors[1h]))     -- errors per hour by method
\`\`\`

**Flux (InfluxDB 2.0):**
A functional data scripting language. Pipe-based like Unix.
\`\`\`
from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> mean()
  |> yield()
\`\`\`

**Key concepts across all languages:**
• **Time range** — Always specify: last hour, last 7 days, custom range
• **Aggregation** — avg, sum, min, max, count over time windows
• **Grouping** — By host, region, metric, or time interval
• **Downsampling** — Reduce resolution: 1s → 1m → 1h for long ranges
• **Retention** — Auto-delete old data (keep 30 days, 1 year, etc.)`,
      },
      queries: [
        {
          label: 'List all measurements',
          operation: 'list_metrics',
          params: {},
          explanation: 'Shows what metrics are available. In InfluxQL: SHOW MEASUREMENTS. In PromQL: use /metrics endpoint. In Flux: from(bucket:"m") |> distinct(column:"_measurement").',
        },
        {
          label: 'Range query: CPU 24h',
          operation: 'range',
          params: { metric: 'cpu_usage', from: Date.now() - 86400000, to: Date.now() },
          explanation: 'InfluxQL: SELECT * FROM cpu_usage WHERE time > now() - 24h. PromQL: cpu_usage{__name__="cpu_usage"}[24h]. Flux: from(bucket:"m") |> range(start:-24h) |> filter(fn:(r) => r._measurement == "cpu_usage").',
          concept: 'Time range',
        },
        {
          label: 'Aggregation: Avg CPU 7d',
          operation: 'aggregate',
          params: { metric: 'cpu_usage', from: Date.now() - 7 * 86400000, to: Date.now(), func: 'avg' },
          explanation: 'InfluxQL: SELECT mean(value) FROM cpu_usage WHERE time > now() - 7d. PromQL: avg_over_time(cpu_usage[7d]). Flux: from(bucket:"m") |> range(start:-7d) |> mean().',
          concept: 'Aggregation',
        },
        {
          label: 'Max latency',
          operation: 'aggregate',
          params: { metric: 'latency', from: Date.now() - 7 * 86400000, to: Date.now(), func: 'max' },
          explanation: 'InfluxQL: SELECT max(value) FROM latency WHERE time > now() - 7d. Critical for SLA monitoring. Combine with GROUP BY time(1h) to find hourly peaks.',
          concept: 'Aggregation',
        },
        {
          label: 'Downsample to daily',
          operation: 'downsample',
          params: { metric: 'requests', from: Date.now() - 7 * 86400000, to: Date.now(), every: 86400000 },
          explanation: 'InfluxQL: SELECT mean(value) FROM requests WHERE time > now() - 7d GROUP BY time(1d). PromQL: avg_over_time(requests[1d]). Downsampling reduces 168 hourly points to 7 daily points for dashboards.',
          concept: 'Downsampling',
        },
        {
          label: 'Write with tags',
          operation: 'write',
          params: { metric: 'cpu_usage', value: 78.5, tags: { host: 'web-02', region: 'us-east' } },
          explanation: 'Tags enable dimensional queries. InfluxQL: INSERT cpu_usage,host=web-02,region=us-east value=78.5. Later query: WHERE host=\'web-02\' AND region=\'us-east\'. Tags are indexed; fields are not.',
          concept: 'Tags & dimensions',
        },
      ],
    },
  },
  {
    id: '13',
    title: 'Redis & Key-Value Patterns',
    category: 'kv-language',
    description: 'Redis data structures, commands, and real-world patterns.',
    concepts: ['Strings', 'Lists', 'Hashes', 'Sets', 'Sorted Sets', 'Pub/Sub', 'Lua scripting', 'TTL & expiration', 'Transactions'],
    type: 'interactive',
    engine: 'level',
    demo: {
      type: 'operations',
      intro: {
        title: 'Redis — The Data Structure Server',
        content: `Redis is more than a key-value store. It's a **data structure server** with rich built-in types.

**Data Structures:**

| Type | Redis Command | Use Case |
|------|--------------|----------|
| **String** | SET, GET, INCR | Counters, flags, simple values |
| **List** | LPUSH, RPUSH, LPOP, LRANGE | Queues, recent items, timelines |
| **Hash** | HSET, HGET, HGETALL | Objects, user profiles, config |
| **Set** | SADD, SMEMBERS, SINTER | Tags, unique items, membership |
| **Sorted Set** | ZADD, ZRANGE, ZRANK | Leaderboards, priority queues |
| **Stream** | XADD, XREAD | Event sourcing, message queues |

**Real-world patterns:**
• **Rate limiting** — INCR + EXPIRE: count requests per minute
• **Session store** — HSET session:{id} user_id 123 expires 3600
• **Leaderboard** — ZADD leaderboard score user_id, ZREVRANGE top 10
• **Pub/Sub** — SUBSCRIBE channel, PUBLISH channel message
• **Cache invalidation** — SET key value EX 3600 (1hr TTL)

**Redis vs LevelDB:**
Redis is in-memory (faster but limited by RAM). LevelDB is on-disk (slower but larger). Redis has rich data structures. LevelDB only has strings. Use Redis for caching, LevelDB for persistent storage.

**Atomic operations:**
Redis commands are atomic — INCR is safe without locks. This makes Redis ideal for concurrent counters, distributed locks, and rate limiters.`,
      },
      operations: [
        {
          label: 'List all keys',
          operation: 'list',
          params: {},
          explanation: 'SCAN or KEYS * in Redis. Lists all stored data. In production, avoid KEYS on large databases (it\'s O(n)). Use SCAN for cursor-based iteration.',
        },
        {
          label: 'GET a string value',
          operation: 'get',
          params: { key: 'user:1' },
          explanation: 'GET key returns the value. In Redis: GET user:1 → {"name":"Alice"}. O(1) lookup. The most basic Redis operation.',
        },
        {
          label: 'GET with prefix (HSCAN pattern)',
          operation: 'list',
          params: { prefix: 'session:' },
          explanation: 'In Redis: SCAN 0 MATCH session:* or HSCAN. Prefix scanning finds related keys. This is how you list all sessions, all user data, all cache entries.',
        },
        {
          label: 'SET a value (write)',
          operation: 'put',
          params: { key: 'cache:homepage', value: { data: 'fresh', timestamp: Date.now() }, },
          explanation: 'SET key value in Redis. With TTL: SET key value EX 3600 (expires in 1 hour). For hashes: HSET key field value. SET is atomic and overwrites any existing value.',
        },
        {
          label: 'Count entries (SCARD pattern)',
          operation: 'count',
          params: {},
          explanation: 'In Redis: DBSIZE or SCAN + count. For sets: SCARD set_name. For sorted sets: ZCARD. In LevelDB, count requires a full scan — Redis maintains counts internally for sets.',
        },
        {
          label: 'Batch operations (pipeline)',
          operation: 'batch',
          params: { operations: [
            { type: 'put', key: 'user:10', value: { name: 'Frank', role: 'admin' } },
            { type: 'put', key: 'counter:logins', value: 100 },
            { type: 'put', key: 'cache:config', value: { theme: 'dark', version: 2 } },
          ]},
          explanation: 'In Redis: Pipeline or MULTI/EXEC transaction. Pipelines batch commands to reduce round-trips. Transactions ensure all commands execute atomically. Essential for bulk operations.',
        },
        {
          label: 'DELETE a key',
          operation: 'del',
          params: { key: 'session:abc123' },
          explanation: 'DEL key removes it. In Redis: DEL, UNLINK (async), EXPIRE key 0 (expire immediately). For hashes: HDEL key field. For sets: SREM key member.',
        },
      ],
    },
  },
  {
    id: '14',
    title: 'Database Design & Modeling',
    category: 'design',
    description: 'How to design schemas, normalize data, and avoid common pitfalls.',
    concepts: ['Normalization (1NF, 2NF, 3NF, BCNF)', 'Denormalization', 'ER diagrams', 'Composite keys', 'Surrogate vs natural keys', 'Soft deletes', 'Audit trails', 'Polymorphic associations'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'explanation',
      sections: [
        {
          heading: 'Normalization — Eliminating Redundancy',
          content: `Normalization organizes data to reduce redundancy. Each normal form builds on the previous:

**First Normal Form (1NF) — Atomic values**
Every column contains a single, indivisible value.
❌ Bad:  tags = "admin,developer,writer"  (comma-separated)
✅ Good: tags table with one tag per row

**Second Normal Form (2NF) — No partial dependencies**
Every non-key column depends on the ENTIRE primary key (not just part of it).
❌ Bad: order_items table with (order_id, product_id, product_name)
  → product_name depends only on product_id, not the full key
✅ Good: order_items (order_id, product_id, quantity, price)
  → All non-key columns depend on both order_id AND product_id

**Third Normal Form (3NF) — No transitive dependencies**
Non-key columns don't depend on other non-key columns.
❌ Bad: users (id, name, department_id, department_name)
  → department_name depends on department_id, not directly on id
✅ Good: users (id, name, department_id) + departments (id, name)

**BCNF (Boyce-Codd Normal Form)**
Every determinant is a candidate key. Stricter than 3NF. Rarely needed for most applications.

**When NOT to normalize:**
Denormalization is intentional for:
• Read-heavy systems (avoid JOINs on hot paths)
• Data warehousing (star/snowflake schemas)
• Caching layers (pre-computed aggregations)
• Event sourcing (append-only logs)`,
        },
        {
          heading: 'ER Diagrams & Relationships',
          content: `Entity-Relationship diagrams map your data model visually:

**Relationship types:**
• **One-to-One (1:1)** — User ↔ Profile
  → Foreign key on either side, or merge tables if always accessed together
• **One-to-Many (1:N)** — User → Orders
  → Foreign key on the "many" side (orders.user_id)
• **Many-to-Many (M:N)** — Students ↔ Courses
  → Junction table: enrollments (student_id, course_id)

**Cardinality notation:**
\`\`\`
User ||--o{ Order       (one user has zero or many orders)
Order }o--|| Product    (each order has one product, each product in many orders)
User ||--|| Profile     (one user has exactly one profile)
\`\`\`

**Common design decisions:**
1. **Surrogate vs Natural keys**
   - Surrogate: auto-increment ID (id=1,2,3). Always works, never changes.
   - Natural: business key (email, SKU). Meaningful but may change.
   → Use surrogate for primary keys, natural for unique constraints.

2. **Soft vs Hard deletes**
   - Hard: DELETE FROM users WHERE id = 1. Gone forever.
   - Soft: UPDATE users SET deleted_at = NOW() WHERE id = 1. Still there.
   → Soft deletes preserve data for audit trails and recovery.

3. **Audit trail pattern**
   Create a changes table: (id, table_name, record_id, action, old_value, new_value, user_id, timestamp)
   Trigger on INSERT/UPDATE/DELETE to log every change.`,
        },
        {
          heading: 'Schema Design Patterns',
          content: `**1. Closed Open Principle (COP)**
Tables should be open for extension but closed for modification.
Add columns without breaking existing queries.

**2. Entity-Attribute-Value (EAV)**
For truly dynamic attributes:
\`\`\`
product_attributes (product_id, attr_name, attr_value)
\`\`\`
Flexible but hard to query. Use JSON columns instead (PostgreSQL jsonb, MySQL JSON).

**3. Tree/Hierarchy patterns**
• Adjacency List — parent_id column (simple, recursive CTEs for queries)
• Materialized Path — "/root/parent/child" (fast ancestry queries)
• Nested Sets — left/right values (fast subtree queries, slow writes)
• Closure Table — separate table with all ancestor-descendant pairs

**4. Temporal tables (Slowly Changing Dimensions)**
Track history by adding valid_from/valid_to dates:
\`\`\`
products (id, name, price, valid_from, valid_to)
\`\`\`
Query: WHERE valid_from <= NOW() AND valid_to > NOW()

**5. Polymorphic associations**
A column that references different tables:
\`\`\`
comments (id, commentable_type, commentable_id, body)
-- commentable_type = 'Post' or 'Video'
-- commentable_id = the id in that table
\`\`\`
Use with caution — bypasses foreign key constraints.`,
        },
        {
          heading: 'Anti-Patterns to Avoid',
          content: `**1. The God Table**
One giant table with 50+ columns. Split into focused tables with relationships.

**2. String-encoded arrays**
email = "alice@example.com,bob@example.com"
→ Use a junction table or PostgreSQL array type.

**3. Repeating groups**
order_line_1, order_line_2, order_line_3...
→ Use a separate order_items table.

**4. Missing foreign keys**
Relying on application code to maintain referential integrity.
→ Always add FOREIGN KEY constraints. The database is faster at checking than your app.

**5. Over-normalization for read-heavy systems**
10 JOINs to render a single page.
→ Denormalize hot paths. Use materialized views. Cache aggressively.

**6. Using reserved words as column names**
table, order, group, select...
→ Prefix with the entity: user_table, order_records, etc.

**7. Implicit type conversions**
WHERE id = "1" (string compared to integer)
→ Always use correct types in queries.`,
        },
      ],
    },
  },
  {
    id: '15',
    title: 'Indexing & Query Performance',
    category: 'performance',
    description: 'How databases find data fast. Index types, query planning, and optimization.',
    concepts: ['B-Tree indexes', 'Hash indexes', 'GIN/GiST', 'Composite indexes', 'Covering indexes', 'Query planner', 'EXPLAIN', 'Index-only scans', 'Partial indexes'],
    type: 'interactive',
    engine: 'sqlite',
    demo: {
      type: 'queries',
      intro: {
        title: 'Indexes — The Performance Multiplier',
        content: `An index is a data structure that speeds up data retrieval at the cost of slower writes.

**Without an index:** Full table scan — read every row. O(n).
**With an index:** B-tree traversal — logarithmic lookup. O(log n).

For 1 million rows: scan = 1M reads, index = ~20 reads.

**Index types in SQLite/PostgreSQL:**

| Type | Best For | Structure |
|------|----------|-----------|
| **B-Tree** (default) | Equality, ranges, ORDER BY | Balanced tree |
| **Hash** | Equality only | Hash table |
| **GIN** | Arrays, full-text, JSONB | Inverted index |
| **GiST** | Geometric, full-text | Generalized search tree |
| **Partial** | Filtered queries | Conditional index |
| **Covering** | Index-only scans | Includes all columns |

**When to create an index:**
• Columns in WHERE clauses (frequent filters)
• Columns in JOIN conditions (foreign keys)
• Columns in ORDER BY (sorting)
• Columns used in GROUP BY

**When NOT to index:**
• Small tables (< 1000 rows) — full scan is fast enough
• Columns with low selectivity (e.g., boolean "is_active")
• Tables with heavy writes — each write updates every index
• Columns rarely used in queries

**Composite indexes (multi-column):**
CREATE INDEX idx ON table(a, b, c)
• Good for: WHERE a=1 AND b=2 AND c=3
• Good for: WHERE a=1 AND b=2
• Good for: WHERE a=1
• Bad for: WHERE b=2 (skips first column)
• Bad for: WHERE c=3 (skips first two columns)
Order matters!`,
      },
      queries: [
        {
          label: 'Basic SELECT (uses index)',
          sql: "SELECT * FROM users WHERE id = 1",
          explanation: 'The PRIMARY KEY is always indexed. SQLite uses the B-tree index to find the row in O(log n) instead of scanning all rows. This is the fastest possible query.',
          concept: 'B-Tree Index',
        },
        {
          label: 'Range query (index scan)',
          sql: "SELECT name, price FROM products WHERE price BETWEEN 10 AND 200 ORDER BY price",
          explanation: 'B-tree indexes support range queries efficiently. The database starts at price=10 and scans sequentially until price=200. ORDER BY is free because the index is already sorted.',
          concept: 'Range scan',
        },
        {
          label: 'LIKE prefix search (uses index)',
          sql: "SELECT * FROM users WHERE email LIKE 'alice%'",
          explanation: 'LIKE with a prefix (starts with) can use a B-tree index. LIKE \'%alice%\' (contains) cannot — it requires a full scan or GIN index. Always put the wildcard at the end.',
          concept: 'Prefix search',
        },
        {
          label: 'GROUP BY aggregation',
          sql: "SELECT category_id, COUNT(*) as cnt, AVG(price) as avg_price FROM products GROUP BY category_id",
          explanation: 'GROUP BY can use an index on category_id. Without an index, SQLite sorts all rows first. With an index, it reads groups in order — much faster for large tables.',
          concept: 'Index scan',
        },
        {
          label: 'Subquery optimization',
          sql: "SELECT * FROM products WHERE category_id IN (SELECT id FROM categories WHERE name LIKE 'E%')",
          explanation: 'SQLite transforms this into a JOIN internally. The IN subquery is equivalent to: SELECT p.* FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name LIKE \'E%\'. Understanding query equivalence helps you write better queries.',
          concept: 'Query rewriting',
        },
        {
          label: 'Self-join (powerful pattern)',
          sql: "SELECT e1.name, e2.name as colleague FROM users e1, users e2 WHERE e1.id != e2.id LIMIT 5",
          explanation: 'Self-joins compare a table to itself. Useful for finding pairs, duplicates, or hierarchical relationships. This finds all user pairs. In practice, add conditions to make it meaningful.',
          concept: 'Self-join',
        },
        {
          label: 'CASE expression (conditional logic)',
          sql: `SELECT name, price,
  CASE
    WHEN price < 50 THEN 'Budget'
    WHEN price < 500 THEN 'Mid-range'
    ELSE 'Premium'
  END as price_tier
FROM products ORDER BY price`,
          explanation: 'CASE is SQL\'s if-else. It works in SELECT, WHERE, ORDER BY, and GROUP BY. Useful for categorizing data, creating computed columns, and conditional aggregations.',
          concept: 'Conditional logic',
        },
        {
          label: 'Pivot with CASE',
          sql: `SELECT u.name,
  SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END) as completed_total,
  SUM(CASE WHEN o.status = 'pending' THEN o.total ELSE 0 END) as pending_total
FROM users u LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.name`,
          explanation: 'PIVOT converts rows to columns. SQLite doesn\'t have PIVOT syntax, so use CASE inside SUM(). This shows each user\'s completed vs pending totals as separate columns — a common reporting pattern.',
          concept: 'Pivot',
        },
      ],
    },
  },
  {
    id: '16',
    title: 'NoSQL Data Modeling',
    category: 'nosql',
    description: 'Denormalization, embedding strategies, and patterns for document/graph/KV stores.',
    concepts: ['Embedding vs referencing', 'Bucket pattern', 'Schema versioning', 'Polymorphic patterns', 'Time-series patterns', 'Graph modeling', 'Event sourcing'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'explanation',
      sections: [
        {
          heading: 'NoSQL Data Modeling Principles',
          content: `NoSQL databases don't have JOINs (or they're expensive). Your data model must match your query patterns.

**Rule #1: Query-driven modeling**
Start with your queries, then design the schema. In SQL, you normalize first and write queries to fit. In NoSQL, you write the schema to fit your queries.

**Rule #2: Duplicate data freely**
If you query "user + their last 5 orders" together, store them together — even if it means duplicating user data in each order document.

**Rule #3: One collection/table per access pattern**
If you need to query by user AND by product, create two collections: user_orders and product_orders. Duplicating is fine.

**The Trade-off Triangle:**
\`\`\`
        Read Performance
           /      \\
          /        \\
  Write Efficiency — Data Consistency
\`\`\`
You can optimize for two. NoSQL typically chooses read performance + write efficiency, sacrificing consistency.`,
        },
        {
          heading: 'Embedding vs Referencing',
          content: `**Embed (denormalize):**
Store related data inside the parent document.
\`\`\`json
{
  "_id": "order_1",
  "user": { "name": "Alice", "email": "alice@example.com" },
  "items": [
    { "name": "Laptop", "price": 999, "qty": 1 },
    { "name": "Mouse", "price": 29, "qty": 2 }
  ]
}
\`\`\`
✅ Fast reads — everything in one document
✅ Atomic updates — one document, one write
❌ Larger documents — more data transfer
❌ Data duplication — if Alice changes email, update all her orders

**Reference (normalize):**
Store just the ID, query separately.
\`\`\`json
{ "_id": "order_1", "userId": "u1", "items": ["p1", "p3"] }
\`\`\`
✅ Smaller documents
✅ No duplication
❌ Requires $lookup (expensive JOIN equivalent)
❌ Multiple round-trips

**When to embed:**
• Data is accessed together (1:1 or 1:few relationships)
• Sub-data is small and bounded (address, settings)
• No independent access to sub-data needed

**When to reference:**
• Sub-data grows unboundedly (orders, logs)
• Sub-data is accessed independently
• Multiple parent types reference the same child`,
        },
        {
          heading: 'Common NoSQL Patterns',
          content: `**1. Bucket Pattern (Time-Series)**
Group time-series data into time-based buckets:
\`\`\`json
{
  "sensor_id": "temp_01",
  "time_bucket": "2024-06-01T10:00:00",
  "readings": [
    { "ts": "10:00:01", "value": 22.5 },
    { "ts": "10:00:02", "value": 22.6 }
  ]
}
\`\`\`
Reduces document count, efficient range queries.

**2. Outbox Pattern (Event Sourcing)**
Instead of writing to multiple collections, write an event to an outbox:
\`\`\`json
{ "type": "order_created", "data": {...}, "timestamp": "...", "processed": false }
\`\`\`
A separate worker processes events. Ensures consistency without distributed transactions.

**3. Schema Versioning**
Add a version field to documents:
\`\`\`json
{ "schemaVersion": 3, "name": "Alice", "settings": {...} }
\`\`\`
When you change structure, increment version and handle migrations in application code.

**4. Computed/Aggregated Documents**
Pre-compute expensive aggregations:
\`\`\`json
{
  "userId": "u1",
  "totalOrders": 15,
  "totalSpent": 4500,
  "lastOrderDate": "2024-06-25",
  "avgOrderValue": 300
}
\`\`\`
Update on each order. Trade write complexity for read simplicity.

**5. Materialized Views**
Create pre-built query results that update periodically:
\`\`\`
user_stats = db.users.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "userId" } },
  { $project: { name: 1, orderCount: { $size: "$orders" } } }
])
\`\`\`
Run hourly/daily. Serve reads from the materialized view.`,
        },
        {
          heading: 'Graph Data Modeling',
          content: `Graph databases model relationships as first-class citizens.

**When to use graph vs relational:**
• Relationships are the primary query pattern → Graph
• Relationships are simple (FK only) → Relational
• Deep traversal (3+ hops) → Graph (O(k) vs O(n²))
• Shallow queries → Either works

**Modeling rules:**
1. **Nouns become nodes** — Users, Products, Cities
2. **Verbs become edges** — FRIENDS_WITH, PURCHASED, LIVES_IN
3. **Adjectives become properties** — age, price, since

**Property graphs vs RDF:**
• Property graphs (Neo4j) — Nodes and edges have key-value properties
• RDF (SPARQL) — Triplets: subject-predicate-object. More formal, used for knowledge graphs.

**Graph modeling example: E-commerce**
\`\`\`
(User)-[:PURCHASED {date, amount}]->(Product)
(Product)-[:BELONGS_TO]->(Category)
(User)-[:REVIEWED {rating, text}]->(Product)
(User)-[:FOLLOWS]->(User)
(Product)-[:RELATED_TO {score}]->(Product)  -- "also bought"
\`\`\`
This models the entire e-commerce domain as a graph. Queries: "recommend products", "find influencer users", "detect fake reviews".`,
        },
      ],
    },
  },
  {
    id: '17',
    title: 'Distributed Systems & Replication',
    category: 'theory',
    description: 'How databases scale across machines. Replication, sharding, consensus, and consistency.',
    concepts: ['Master-slave replication', 'Multi-master', 'Sharding', 'Consistent hashing', 'Raft consensus', 'Vector clocks', 'Conflict resolution', 'Eventual consistency'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'explanation',
      sections: [
        {
          heading: 'Replication — Copying Data Across Machines',
          content: `Replication copies data to multiple machines for reliability and performance.

**Master-Slave (Primary-Replica):**
• One primary handles all writes
• Replicas handle reads (horizontal read scaling)
• If primary dies, promote a replica
• Used by: PostgreSQL, MySQL, MongoDB (default)

**Multi-Master:**
• Multiple nodes accept writes
• Conflicts must be resolved (last-write-wins, CRDTs)
• More complex but no single point of failure
• Used by: Cassandra, CouchDB, Galera

**Synchronous vs Asynchronous:**
• Sync — Write confirmed only after replica confirms. Strong consistency, higher latency.
• Async — Write confirmed immediately. Lower latency, risk of data loss on failure.
• Semi-sync — Confirmed by at least one replica. Compromise.

**Consensus protocols:**
• **Raft** — Leader election + log replication. Used by etcd, TiKV.
• **Paxos** — Classic but complex. Used by Google Chubby.
• **ZAB** — Zookeeper Atomic Broadcast. Used by ZooKeeper.

These ensure all nodes agree on the order of operations — critical for consistency.`,
        },
        {
          heading: 'Sharding — Splitting Data Across Machines',
          content: `Sharding splits a large dataset across multiple machines (shards). Each shard holds a subset of the data.

**Hash-based sharding:**
shard = hash(user_id) % num_shards
• Even distribution
• Range queries require hitting all shards
• Used by: MongoDB, Redis Cluster

**Range-based sharding:**
Shard 1: users A-M, Shard 2: users N-Z
• Range queries are efficient
• Hotspots if data is skewed
• Used by: HBase, Bigtable

**Directory-based sharding:**
A lookup service maps keys to shards.
• Flexible — can move data between shards
• Single point of failure (the directory)
• Used by: Vitess, Citus

**Consistent hashing:**
Instead of hash % N, use a hash ring. When a shard is added/removed, only nearby keys move.
• Used by: DynamoDB, Cassandra, Amazon

**Sharding challenges:**
• Cross-shard queries — expensive, avoid if possible
• Joins across shards — nearly impossible, denormalize
• Rebalancing — moving data when adding shards
• Global secondary indexes — indexes that span all shards`,
        },
        {
          heading: 'Consistency Models',
          content: `Different systems offer different consistency guarantees:

**Strong consistency:**
Every read returns the most recent write. All nodes see the same data simultaneously.
→ PostgreSQL (synchronous replication), Spanner, ZooKeeper

**Eventual consistency:**
If no new writes, all replicas will eventually converge. Reads may return stale data.
→ Cassandra, DynamoDB (default), Redis Cluster

**Causal consistency:**
Operations that are causally related are seen in order by all nodes. Concurrent operations may be seen in different orders.
→ MongoDB (causal sessions), Azure Cosmos DB

**Read-your-writes:**
A user always sees their own writes immediately, but other users may see stale data.
→ MongoDB (read concern "local"), many web applications

**Monotonic reads:**
Once you read a value, you never see an older value.
→ DynamoDB (consistent reads), MongoDB

**How to choose:**
• Financial transactions → Strong consistency
• Social media feed → Eventual consistency (stale posts are OK)
• User sees their own profile update → Read-your-writes
• Shopping cart → Eventual consistency (conflict resolution handles divergent carts)`,
        },
      ],
    },
  },
  {
    id: '18',
    title: 'Database Comparison Matrix',
    category: 'comparison',
    description: 'Comprehensive comparison of every database type with decision framework.',
    concepts: ['Decision matrix', 'Performance benchmarks', 'Scaling patterns', 'Operational complexity', 'Cost models', 'Migration strategies', 'Polyglot persistence'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'comparison',
      scenarios: [
        {
          title: 'E-Commerce Platform',
          description: 'A complete e-commerce system needs multiple database types working together.',
          context: 'Real-world systems are polyglot — they use multiple databases, each optimized for a specific job.',
          solutions: [
            { type: 'relational', engine: 'sqlite', sql: "SELECT u.name, SUM(o.total) as lifetime_value FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.name ORDER BY lifetime_value DESC", why: 'PostgreSQL for orders, inventory, payments. ACID compliance is non-negotiable for financial data.', label: 'PostgreSQL — Transactions' },
            { type: 'key-value', engine: 'level', operation: 'get', params: { key: 'cache:product:p1' }, why: 'Redis for session management, cart data, and product cache. Sub-millisecond reads on every page load.', label: 'Redis — Cache/Sessions' },
            { type: 'mongodb', engine: 'mongodb', operation: 'find', params: { collection: 'products', filter: { category: 'laptops' } }, why: 'MongoDB for product catalog. Flexible schema for varying product attributes (laptops vs shoes vs books).', label: 'MongoDB — Catalog' },
            { type: 'vector', engine: 'vector', operation: 'search_by_text', params: { query: 'wireless headphones noise cancelling' }, why: 'Pinecone/Weaviate for "similar products" recommendations. Embeddings capture product similarity.', label: 'Vector — Recommendations' },
          ],
        },
        {
          title: 'Social Media App',
          description: 'User-generated content, social graphs, real-time feeds.',
          context: 'Social media demands: fast writes (every post), fast reads (news feed), relationship queries (friend suggestions), and search.',
          solutions: [
            { type: 'graph', engine: 'graph', operation: 'bfs', params: { from: 'alice', depth: 2 }, why: 'Neo4j for social graph. "Friends of friends" traversal is O(k) instead of O(n²) with SQL JOINs.', label: 'Neo4j — Social Graph' },
            { type: 'timeseries', engine: 'timeseries', operation: 'aggregate', params: { metric: 'requests', from: Date.now() - 86400000, to: Date.now(), func: 'sum' }, why: 'InfluxDB for engagement analytics. Track likes, views, shares over time. Downsampling for long-term trends.', label: 'InfluxDB — Analytics' },
            { type: 'mongodb', engine: 'mongodb', operation: 'find', params: { collection: 'users', filter: { tags: 'developer' } }, why: 'MongoDB for user profiles, posts, comments. Flexible schema for varying content types (text, images, videos).', label: 'MongoDB — Content' },
            { type: 'vector', engine: 'vector', operation: 'search_by_text', params: { query: 'machine learning deep learning' }, why: 'Weaviate for content discovery. "Show me posts similar to this one" using embedding similarity.', label: 'Vector — Discovery' },
          ],
        },
        {
          title: 'IoT Sensor Network',
          description: 'Millions of sensors writing data points every second.',
          context: 'IoT demands: massive write throughput, time-range queries, downsampling, and retention policies.',
          solutions: [
            { type: 'timeseries', engine: 'timeseries', operation: 'downsample', params: { metric: 'cpu_usage', from: Date.now() - 7 * 86400000, to: Date.now(), every: 86400000 }, why: 'InfluxDB/TimescaleDB for sensor data. Optimized for append-only timestamped writes and range queries.', label: 'InfluxDB — Raw Metrics' },
            { type: 'key-value', engine: 'level', operation: 'get', params: { key: 'sensor:latest:temp_01' }, why: 'Redis for latest sensor values. Every dashboard query needs the current reading — O(1) lookup.', label: 'Redis — Current State' },
            { type: 'relational', engine: 'sqlite', sql: "SELECT name, email FROM users WHERE id = 1", why: 'PostgreSQL for device management, user accounts, alert configurations. Relational data about the IoT system.', label: 'PostgreSQL — Metadata' },
          ],
        },
        {
          title: 'Real-Time Chat Application',
          description: 'Messages, presence, typing indicators, read receipts.',
          context: 'Chat requires: instant message delivery, message history, user presence, and group conversations.',
          solutions: [
            { type: 'key-value', engine: 'level', operation: 'get', params: { key: 'presence:user:123' }, why: 'Redis for presence/online status, typing indicators, read receipts. TTL auto-expires stale presence data.', label: 'Redis — Presence' },
            { type: 'mongodb', engine: 'mongodb', operation: 'find', params: { collection: 'orders', filter: { userId: 'u1' } }, why: 'MongoDB for message storage. Embedded arrays for messages in a conversation. Flexible for rich media messages.', label: 'MongoDB — Messages' },
            { type: 'graph', engine: 'graph', operation: 'neighbors', params: { node: 'alice' }, why: 'Neo4j for contact lists, group membership, "friend of friend" suggestions for new connections.', label: 'Neo4j — Contacts' },
          ],
        },
      ],
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // ADVANCED & SPECIALIZED TOPICS (19-30)
  // ═══════════════════════════════════════════════════════════════
  {
    id: '19',
    title: 'SQL Transactions & Concurrency Control',
    category: 'transactions',
    description: 'ACID in practice, isolation levels, locking, deadlocks, and MVCC.',
    concepts: ['Transaction lifecycle', 'Isolation levels (Read Uncommitted → Serializable)', 'Pessimistic vs optimistic locking', 'Deadlocks', 'MVCC', 'Savepoints', 'Two-phase locking', 'Snapshot isolation'],
    type: 'interactive',
    engine: 'sqlite',
    demo: {
      type: 'queries',
      intro: {
        title: 'Transactions — Keeping Data Correct Under Pressure',
        content: `A transaction is a group of operations that must all succeed or all fail. Without transactions, a crash mid-operation leaves data in an inconsistent state.

**Transaction lifecycle:**
\`\`\`
BEGIN TRANSACTION
  UPDATE accounts SET balance = balance - 100 WHERE id = 1
  UPDATE accounts SET balance = balance + 100 WHERE id = 2
COMMIT
\`\`\`
If either UPDATE fails, ROLLBACK reverts both.

**Isolation Levels (from least to most strict):**

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Performance |
|-------|-----------|--------------------|--------------| -- |
| Read Uncommitted | Yes | Yes | Yes | Fastest |
| Read Committed | No | Yes | Yes | Fast |
| Repeatable Read | No | No | Yes | Moderate |
| Serializable | No | No | No | Slowest |

• **Dirty read** — Read uncommitted data from another transaction
• **Non-repeatable read** — Same query returns different results within same transaction
• **Phantom read** — New rows appear between two reads in same transaction

**Locking strategies:**
• **Pessimistic** — Lock rows before reading/writing. Safe but blocks other transactions.
• **Optimistic** — Read without locking, check for conflicts at commit time. Faster if conflicts are rare.

**MVCC (Multi-Version Concurrency Control):**
Instead of locking, each transaction sees a snapshot of the database at its start time. Readers don't block writers, writers don't block readers. Used by PostgreSQL, MySQL InnoDB, SQLite (WAL mode).

**Deadlocks:**
Transaction A locks row 1, waits for row 2. Transaction B locks row 2, waits for row 1. Neither can proceed. Databases detect deadlocks and abort one transaction (the victim). Prevention: always acquire locks in the same order.`,
      },
      queries: [
        {
          label: 'Transaction: Transfer funds',
          sql: `-- Simulate a bank transfer
UPDATE users SET email = 'alice_updated@example.com' WHERE id = 1
-- In SQLite, each statement is auto-committed unless wrapped in BEGIN...COMMIT
-- This demonstrates the concept: both updates must succeed or both fail`,
          explanation: 'In production: BEGIN; UPDATE accounts SET balance = balance - 100 WHERE id = 1; UPDATE accounts SET balance = balance + 100 WHERE id = 2; COMMIT. If the second UPDATE fails, ROLLBACK reverts the first.',
          concept: 'Atomicity',
        },
        {
          label: 'Demonstrate isolation',
          sql: `SELECT * FROM users
-- Simultaneously from two connections:
-- Connection 1: BEGIN; SELECT * FROM users (sees snapshot at time T1)
-- Connection 2: INSERT INTO users (new row)
-- Connection 1: SELECT * FROM users (same result — snapshot hasn't changed)
-- Connection 1: COMMIT
-- Connection 1: SELECT * FROM users (now sees the new row)`,
          explanation: 'This is Read Committed isolation. Each SELECT in its own statement sees the latest committed data. But within a transaction, you see a consistent snapshot (Repeatable Read).',
          concept: 'Snapshot isolation',
        },
        {
          label: 'Deadlock prevention pattern',
          sql: `-- Always lock rows in the same order to prevent deadlocks
SELECT * FROM users WHERE id = 1 ORDER BY id
SELECT * FROM users WHERE id = 2 ORDER BY id
-- If both connections always lock id=1 before id=2, no deadlock is possible`,
          explanation: 'Deadlock prevention: establish a global ordering for lock acquisition. If all transactions lock rows by ascending ID, circular waits cannot occur. Databases also have deadlock detectors that abort one transaction after a timeout.',
          concept: 'Deadlock prevention',
        },
        {
          label: 'Aggregate with consistency',
          sql: `SELECT u.name, SUM(o.total) as total_spent,
  COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.name
HAVING SUM(o.total) > 0
ORDER BY total_spent DESC`,
          explanation: 'Aggregations should run within transactions for consistency. Without a transaction, new orders could appear mid-query, giving inconsistent totals. REPEATABLE READ or SERIALIZABLE isolation prevents this.',
          concept: 'Consistent reads',
        },
      ],
    },
  },
  {
    id: '20',
    title: 'PostgreSQL Advanced Features',
    category: 'advanced-db',
    description: 'JSONB, arrays, full-text search, materialized views, and PostgreSQL-specific power features.',
    concepts: ['JSONB operations', 'Array columns', 'Full-text search (tsvector/tsquery)', 'Materialized views', 'CTE recursion', 'LATERAL joins', 'Window functions', 'Extensions (pg_trgm, PostGIS)'],
    type: 'interactive',
    engine: 'sqlite',
    demo: {
      type: 'queries',
      intro: {
        title: 'PostgreSQL — The Swiss Army Knife of Databases',
        content: `PostgreSQL is the most feature-rich open-source database. It extends SQL with powerful capabilities that blur the line between relational and document databases.

**Key PostgreSQL features:**

**1. JSONB — Document storage in a relational database**
Store JSON documents with indexing and querying:
\`\`\`sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  attributes JSONB  -- Store flexible attributes
);

-- Query JSONB
SELECT * FROM products WHERE attributes @> '{"color": "red"}';
SELECT * FROM products WHERE attributes->>'brand' = 'Apple';
\`\`\`

**2. Array columns**
Store arrays natively:
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  tags TEXT[]  -- Array of strings
);

SELECT * WHERE 'admin' = ANY(tags);
SELECT unnest(tags) FROM users;  -- Expand array to rows
\`\`\`

**3. Full-text search**
Built-in search engine:
\`\`\`sql
SELECT * FROM products
WHERE to_tsvector('english', name || ' ' || description)
   @@ to_tsquery('english', 'wireless & headphones');
\`\`\`

**4. Materialized views**
Pre-computed query results that don't update automatically:
\`\`\`sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT user_id, COUNT(*) as orders, SUM(total) as spent
FROM orders GROUP BY user_id;

REFRESH MATERIALIZED VIEW user_stats;  -- Manual refresh
\`\`\`

**5. Recursive CTEs**
Query hierarchical data:
\`\`\`sql
WITH RECURSIVE tree AS (
  SELECT id, name, parent_id, 1 as depth FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.name, c.parent_id, t.depth + 1
  FROM categories c JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree ORDER BY depth, name;
\`\`\`

**6. LATERAL joins**
Correlated subqueries in FROM clause:
\`\`\`sql
SELECT u.name, latest.order_id, latest.total
FROM users u
CROSS JOIN LATERAL (
  SELECT * FROM orders WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
) latest;
\`\`\``,
      },
      queries: [
        {
          label: 'JSONB-style query',
          sql: `-- Simulate JSONB query with JOINs
SELECT p.name, p.price, c.name as category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.name IN ('Electronics', 'Books')`,
          explanation: 'In PostgreSQL with JSONB: SELECT * FROM products WHERE attributes @> \'{"category": "Electronics"}\'. JSONB supports GIN indexes for fast containment checks (@>, ?) and path access (->, ->>).',
          concept: 'JSONB',
        },
        {
          label: 'Full-text search simulation',
          sql: `-- Simulate full-text search
SELECT name, price FROM products
WHERE name LIKE '%book%' OR name LIKE '%design%'
ORDER BY price`,
          explanation: 'PostgreSQL FTS: SELECT * FROM products WHERE to_tsvector(\'english\', name) @@ to_tsquery(\'english\', \'book & design\'). FTS uses stemming (running → run), ranking (ts_rank), and GIN indexes for performance.',
          concept: 'Full-text search',
        },
        {
          label: 'Recursive CTE (tree traversal)',
          sql: `-- Simulate hierarchical query
-- In SQLite, recursive CTEs work natively:
-- WITH RECURSIVE tree AS (
--   SELECT id, name, parent_id FROM categories WHERE parent_id IS NULL
--   UNION ALL
--   SELECT c.id, c.name, c.parent_id FROM categories c
--   JOIN tree t ON c.parent_id = t.id
-- )
-- SELECT * FROM tree ORDER BY name
SELECT name, email FROM users ORDER BY name`,
          explanation: 'Recursive CTEs traverse hierarchical data (org charts, file systems, categories). PostgreSQL also supports SEARCH and CYCLE clauses for ordered traversal and cycle detection.',
          concept: 'Recursive CTE',
        },
        {
          label: 'Window function with frame',
          sql: `SELECT name, price,
  SUM(price) OVER (ORDER BY price ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total,
  AVG(price) OVER (ORDER BY price ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) as moving_avg
FROM products
ORDER BY price`,
          explanation: 'Window frame clauses define the rows relative to the current row: ROWS BETWEEN n PRECEDING AND m FOLLOWING. PostgreSQL supports RANGE, GROUPS, and EXCLUDE clauses for advanced framing.',
          concept: 'Window frames',
        },
        {
          label: 'Aggregate with FILTER',
          sql: `SELECT name,
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending
FROM orders
GROUP BY name`,
          explanation: 'PostgreSQL FILTER clause: COUNT(*) FILTER (WHERE condition) counts only matching rows. More readable than CASE inside aggregate functions. Supported by PostgreSQL, SQLite 3.30+, and newer SQL standards.',
          concept: 'FILTER clause',
        },
      ],
    },
  },
  {
    id: '21',
    title: 'MySQL & Storage Engines',
    category: 'advanced-db',
    description: 'MySQL internals: InnoDB vs MyISAM, replication, and MySQL-specific optimizations.',
    concepts: ['InnoDB vs MyISAM', 'Buffer pool', 'Redo/undo logs', 'Binary logging', 'Replication (async, semi-sync, GTID)', 'Partitioning', 'Query cache', 'InnoDB clustered index'],
    type: 'interactive',
    engine: 'sqlite',
    demo: {
      type: 'queries',
      intro: {
        title: 'MySQL — The Web\'s Database',
        content: `MySQL powers 39% of all websites (WordPress, Facebook, Twitter, GitHub). Understanding its internals is critical for web developers.

**InnoDB vs MyISAM (storage engines):**

| Feature | InnoDB | MyISAM |
|---------|--------|--------|
| Transactions | ✅ Full ACID | ❌ No transactions |
| Locking | Row-level | Table-level |
| Foreign keys | ✅ Supported | ❌ Not supported |
| Crash recovery | ✅ WAL-based | ❌ Risk of corruption |
| Full-text index | ✅ InnoDB FTS | ✅ Native |
| Performance | Read-heavy OK, writes safe | Fast reads, unsafe writes |
| Use case | Default (8.0+) | Legacy only |

**InnoDB internals:**
• **Buffer pool** — Caches data and indexes in memory (default 128MB, set to 70-80% of RAM)
• **Redo log** — Write-ahead log for crash recovery. Writes to ib_logfile0/1
• **Undo log** — Stores before-images for transactions and MVCC
• **Doublewrite buffer** — Prevents torn pages on crash
• **Clustered index** — Data stored in primary key order (B+ tree leaf pages)

**Replication:**
\`\`\`
Primary → Binary Log → Replica I/O Thread → Relay Log → Replica SQL Thread
\`\`\`
• Async — Primary doesn't wait for replica (default, risk of lag)
• Semi-sync — Waits for at least one replica to acknowledge
• GTID — Global Transaction ID for easier failover

**MySQL 8.0+ features:**
• Window functions (finally!)
• CTEs
• JSON improvements
• Invisible indexes (test index removal safely)
• Resource groups (assign CPU to queries)`,
      },
      queries: [
        {
          label: 'InnoDB-style query',
          sql: `SELECT u.name, o.total, o.status
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
ORDER BY o.total DESC
LIMIT 5`,
          explanation: 'InnoDB: This query uses the clustered index on orders for the WHERE clause, then looks up users via the primary key. The JOIN is efficient because both sides are indexed. InnoDB\'s buffer pool caches hot data in memory.',
          concept: 'InnoDB query path',
        },
        {
          label: 'Auto-increment pattern',
          sql: `INSERT INTO users (name, email, created_at)
VALUES ('Test User', 'test@example.com', datetime('now'))`,
          explanation: 'MySQL AUTO_INCREMENT assigns sequential IDs. InnoDB stores data in primary key order (clustered index), so inserts are append-only and fast. Auto-increment gaps are normal after deletions.',
          concept: 'Clustered index',
        },
        {
          label: 'Covering index simulation',
          sql: `SELECT name, price FROM products WHERE category_id = 1`,
          explanation: 'A covering index includes all columns needed: CREATE INDEX idx_products_cat ON products(category_id, name, price). The query reads only the index (no table lookup) — 2-3x faster than a regular index scan.',
          concept: 'Covering index',
        },
        {
          label: 'Optimized COUNT pattern',
          sql: `SELECT COUNT(*) as total_orders FROM orders`,
          explanation: 'MySQL InnoDB: COUNT(*) without WHERE must scan the clustered index (no stored row count). For approximate counts: SHOW TABLE STATUS LIKE \'orders\' → Rows. For exact fast counts: maintain a counter table.',
          concept: 'COUNT optimization',
        },
      ],
    },
  },
  {
    id: '22',
    title: 'MongoDB Advanced Operations',
    category: 'nosql',
    description: 'Transactions, change streams, sharding, schema validation, and GridFS.',
    concepts: ['Multi-document transactions', 'Change streams', 'Sharding strategy', 'Schema validation', 'GridFS', 'Read/write concern', 'Read preference', 'Aggregation optimization'],
    type: 'interactive',
    engine: 'mongodb',
    demo: {
      type: 'mongodb_queries',
      intro: {
        title: 'MongoDB in Production',
        content: `MongoDB scales from prototype to billions of documents. Here\'s what you need for production.

**Multi-document transactions (4.0+):**
\`\`\`javascript
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
});
db.orders.insertOne({ userId: "u1", total: 100 }, { session });
db.inventory.updateOne({ _id: "p1" }, { $inc: { stock: -1 } }, { session });
session.commitTransaction();
\`\`\`
Transactions span multiple documents/collections. They use WiredTiger's MVCC for snapshot isolation.

**Change streams:**
Real-time notifications when data changes:
\`\`\`javascript
const changeStream = db.orders.watch();
changeStream.on("change", (change) => {
  console.log(change.operationType); // insert, update, delete, replace
  console.log(change.fullDocument);  // the new document
});
\`\`\`
Powered by the oplog (replication log). Works across sharded clusters.

**Sharding strategy:**
Choose a shard key that distributes data evenly:
• Hashed — Even distribution, no range queries
• Ranged — Good for ranges, risk of hotspots
• Compound — Combine fields: { userId: 1, timestamp: -1 }

**Read/Write concern:**
• w: "majority" — Write confirmed by majority of replicas
• w: 1 — Write confirmed by primary only (default)
• readConcern: "majority" — Read from majority-confirmed data
• readPreference: "secondaryPreferred" — Read from replicas

**Schema validation:**
\`\`\`javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name: { bsonType: "string", minLength: 1 },
        email: { bsonType: "string", pattern: "^.+@.+$" },
        age: { bsonType: "int", minimum: 0 }
      }
    }
  }
});
\`\`\``,
      },
      queries: [
        {
          label: 'Find with projection',
          operation: 'find',
          params: { collection: 'users', filter: { age: { $gte: 25 } }, sort: { age: 1 } },
          explanation: 'Projections limit returned fields: db.users.find({}, { name: 1, email: 1, _id: 0 }). This reduces network transfer and memory usage. Sort uses an index if available.',
          concept: 'Read optimization',
        },
        {
          label: 'Complex aggregation pipeline',
          operation: 'aggregate',
          params: {
            collection: 'orders',
            pipeline: [
              { $match: { status: { $in: ["completed", "pending"] } } },
              { $group: { _id: "$userId", totalSpent: { $sum: "$amount" }, avgOrder: { $avg: "$amount" }, orderCount: { $count: {} } } },
              { $sort: { totalSpent: -1 } },
              { $limit: 5 },
            ],
          },
          explanation: 'Pipeline stages run in order: $match filters early (reduces data), $group computes aggregations, $sort orders, $limit truncates. Place $match as early as possible for performance.',
          concept: 'Pipeline optimization',
        },
        {
          label: 'Nested document query',
          operation: 'find',
          params: { collection: 'products', filter: { 'specs.ram': { $gte: 16 } } },
          explanation: 'Dot notation queries nested objects: db.products.find({ "specs.ram": { $gte: 16 } }). Create an index: db.products.createIndex({ "specs.ram": 1 }) for fast nested field queries.',
          concept: 'Nested field indexing',
        },
        {
          label: 'Update with operators',
          operation: 'updateOne',
          params: { collection: 'products', filter: { _id: 'p1' }, update: { $set: { inStock: false }, $inc: { 'specs.version': 1 } } },
          explanation: '$set updates specific fields (preserving others). $inc increments a numeric field atomically. Other operators: $push (array add), $pull (array remove), $unset (remove field), $rename.',
          concept: 'Update operators',
        },
        {
          label: 'Delete with filter',
          operation: 'deleteOne',
          params: { collection: 'products', filter: { inStock: false } },
          explanation: 'deleteOne removes the first matching document. deleteMany removes all matches. MongoDB uses a tombstone marker — actual deletion happens during compaction. For soft deletes, add a deletedAt field instead.',
          concept: 'Deletion strategy',
        },
      ],
    },
  },
  {
    id: '23',
    title: 'Cassandra & Column-Family Stores',
    category: 'nosql',
    description: 'Apache Cassandra: partitioning, replication, compaction, and CQL query language.',
    concepts: ['Partition keys', 'Clustering columns', 'Replication factor', 'Consistency levels', 'Compaction strategies', 'CQL (Cassandra Query Language)', 'Tunable consistency', 'Anti-entropy repair'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'explanation',
      sections: [
        {
          heading: 'Cassandra — Distributed by Design',
          content: `Cassandra is a distributed column-family database designed for massive write throughput and linear scalability. Used by Apple (200K nodes), Netflix, Instagram.

**Data model:**
\`\`\`sql
CREATE TABLE sensor_data (
  sensor_id UUID,
  timestamp TIMESTAMP,
  temperature DOUBLE,
  humidity DOUBLE,
  PRIMARY KEY (sensor_id, timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);
\`\`\`
• **Partition key** (sensor_id) — Determines which node stores the data
• **Clustering column** (timestamp) — Sorts data within a partition

**How partitioning works:**
1. Hash the partition key: token(sensor_id) → integer
2. Each node owns a token range on the ring
3. The hash determines which node stores the data
4. Replication copies data to N neighboring nodes

**CQL (Cassandra Query Language):**
SQL-like but with restrictions:
• SELECT: Must include partition key in WHERE clause
• No JOINs — Denormalize everything
• No GROUP BY — Use application-side aggregation
• ALLOW FILTERING — Scans all data (slow, avoid in production)

**Consistency levels:**
| Level | Meaning | Use Case |
|-------|---------|----------|
| ONE | Response from 1 replica | Fast, low consistency |
| QUORUM | Response from majority | Balanced |
| ALL | Response from all replicas | Strong consistency |
| LOCAL_QUORUM | Majority in local DC | Multi-DC balanced |

Formula for strong consistency: R + W > Replication Factor

**Compaction:**
Merges SSTables to reclaim space and improve read performance.
• SizeTiered — Default, merges similar-sized SSTables
• Leveled — Better read performance, more write amplification
• TimeWindow — Time-series data, compacts by time window`,
        },
        {
          heading: 'Cassandra vs Other NoSQL',
          content: `| Feature | Cassandra | MongoDB | DynamoDB |
|---------|-----------|---------|----------|
| Data model | Wide column | Document | Key-value/document |
| Consistency | Tunable | Eventual/strong | Eventual/strong |
| Query language | CQL | MongoDB API | PartiQL/SDK |
| Replication | Masterless | Primary-based | AWS-managed |
| Scaling | Linear (add nodes) | Sharding (complex) | Auto-scaling |
| Best for | Time-series, IoT | Content, catalogs | Serverless apps |

**When to choose Cassandra:**
• Write-heavy workloads (100K+ writes/sec)
• Multi-datacenter replication
• Time-series data with high cardinality
• When you need linear scalability
• When uptime > consistency (AP system)

**When NOT to choose Cassandra:**
• Complex queries with JOINs
• Small datasets (< 1TB)
- When strong consistency is required
- When ad-hoc queries are important`,
        },
        {
          heading: 'Data Modeling for Cassandra',
          content: `Cassandra data modeling is QUERY-DRIVEN, not entity-driven.

**Step 1: List your queries**
1. Get all readings for sensor X in the last 24 hours
2. Get the latest reading for sensor X
3. Get average temperature per sensor per hour

**Step 2: Design tables for each query**
\`\`\`sql
-- Query 1: Readings by time
CREATE TABLE sensor_readings (
  sensor_id UUID, timestamp TIMESTAMP, temp DOUBLE,
  PRIMARY KEY (sensor_id, timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);

-- Query 3: Hourly aggregates
CREATE TABLE sensor_hourly (
  sensor_id UUID, hour TIMESTAMP, avg_temp DOUBLE,
  PRIMARY KEY (sensor_id, hour)
);
\`\`\`

**Step 3: Denormalize aggressively**
Duplicate data across tables. Updates via lightweight transactions or application logic.

**Anti-patterns:**
• Large partitions (> 100MB) — Hot spots, slow queries
• High-cardinality partition keys — Many small partitions
• Deleting individual rows — Use time-based expiry instead
• Secondary indexes on high-cardinality columns — Use materialized views instead`,
        },
      ],
    },
  },
  {
    id: '24',
    title: 'Elasticsearch & Full-Text Search',
    category: 'search',
    description: 'Inverted indexes, analyzers, mappings, aggregations, and search relevance.',
    concepts: ['Inverted index', 'Analyzers (standard, custom)', 'Mappings (text vs keyword)', 'Query DSL', 'Bool queries', 'Aggregations', 'Scoring (TF-IDF, BM25)', 'Fuzzy search', 'Percolator'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'explanation',
      sections: [
        {
          heading: 'Elasticsearch — Search at Scale',
          content: `Elasticsearch is a distributed search and analytics engine built on Apache Lucene. It powers search for Wikipedia, Stack Overflow, GitHub, and thousands of production applications.

**How full-text search works:**
1. **Indexing** — Documents are analyzed and stored in an inverted index
2. **Analysis** — Text is tokenized, lowercased, stemmed
3. **Querying** — Terms are looked up in the inverted index
4. **Scoring** — Results ranked by relevance (BM25)

**Inverted index:**
Instead of "which document contains this word?", the index answers "which documents contain word X?".
\`\`\`
Term → Document IDs
"database" → [1, 3, 5, 7]
"postgresql" → [3, 5]
"mongodb" → [7]
\`\`\`
This makes text search O(1) per term instead of O(n) scanning.

**Analyzers:**
Transform text into searchable tokens:
• **Standard** — Lowercases, splits on whitespace/punctuation
• **Simple** — Lowercases, splits on non-letter characters
• **Whitespace** — Splits on whitespace only
• **Custom** — Your rules: stop words, stemming, synonyms

Example: "PostgreSQL Databases!" → ["postgresql", "database"]

**Mappings:**
Define how fields are indexed:
• **text** — Analyzed (full-text searchable)
• **keyword** — Not analyzed (exact match, sorting, aggregations)
• **integer, float, boolean** — Numeric types
• **date** — Date parsing and range queries
• **nested** — Arrays of objects

**Query DSL:**
\`\`\`json
{
  "query": {
    "bool": {
      "must": [{ "match": { "title": "database" } }],
      "filter": [{ "range": { "price": { "gte": 50 } } }],
      "should": [{ "match": { "description": "postgres" } }],
      "must_not": [{ "term": { "status": "draft" } }]
    }
  },
  "sort": [{ "price": "asc" }],
  "size": 10
}
\`\`\``,
        },
        {
          heading: 'Search Relevance & Scoring',
          content: `Elasticsearch uses BM25 (default since 5.0) to score results:

**BM25 factors:**
• **Term frequency (TF)** — How often the query term appears in the document
• **Inverse document frequency (IDF)** — How rare the term is across all documents
• **Field length** — Shorter fields get higher scores for the same term match

**Boosting:**
\`\`\`json
{ "match": { "title": { "query": "database", "boost": 3 } } }
\`\`\`
Multiply the score by a factor. Title matches count 3x more than body matches.

**Fuzzy search:**
\`\`\`json
{ "fuzzy": { "name": { "value": "datbase", "fuzziness": 2 } } }
\`\`\`
Allow up to 2 character edits (insertions, deletions, substitutions). Based on Levenshtein distance.

**Phrase search:**
\`\`\`json
{ "match_phrase": { "description": "relational database" } }
\`\`\`
Terms must appear in order with no gaps.

**Aggregations (analytics):**
\`\`\`json
{
  "aggs": {
    "avg_price": { "avg": { "field": "price" } },
    "by_category": { "terms": { "field": "category", "size": 10 } },
    "price_histogram": { "histogram": { "field": "price", "interval": 50 } }
  }
}
\`\`\`
Elasticsearch is also a powerful analytics engine, not just search.`,
        },
      ],
    },
  },
  {
    id: '25',
    title: 'DynamoDB & Cloud-Native Databases',
    category: 'cloud-db',
    description: 'AWS DynamoDB: partition design, GSIs, DAX, streams, and serverless patterns.',
    concepts: ['Partition key design', 'Sort keys', 'Global Secondary Indexes', 'Local Secondary Indexes', 'DAX (caching)', 'DynamoDB Streams', 'Batch operations', 'On-demand vs provisioned'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'explanation',
      sections: [
        {
          heading: 'DynamoDB — Serverless Key-Value at Scale',
          content: `DynamoDB is AWS's fully managed NoSQL database. Single-digit millisecond latency at any scale. Powers Amazon.com, Slack, Lyft, and Samsung.

**Data model:**
• **Partition key** — Determines which partition stores the item (hash-based)
• **Sort key** (optional) — Orders items within a partition
• **Attributes** — Flexible, schema-less attributes

\`\`\`javascript
// Table: Users
// Partition key: userId
{
  userId: "u123",
  name: "Alice",
  email: "alice@example.com",
  createdAt: "2024-01-15",
  // Any additional attributes are allowed
}
\`\`\`

**Partition key design (critical!):**
The partition key determines data distribution. Bad choices create hot spots:
• ❌ "status" with values ["active", "inactive"] → 2 partitions, 50/50 split
• ❌ Sequential IDs → All writes to the same partition (hot partition)
• ✅ Random UUID → Even distribution
• ✅ Composite key: "USER#u123" → Enables prefix queries

**Global Secondary Index (GSI):**
Alternate partition/sort key for different query patterns:
\`\`\`javascript
// GSI: email-index
// Partition key: email
// Allows: db.query({ TableName: "Users", IndexName: "email-index", KeyConditionExpression: "email = :e" })
\`\`\`

**Local Secondary Index (LSI):**
Same partition key, different sort key. Allows range queries on the sort key.

**DAX (DynamoDB Accelerator):**
In-memory cache in front of DynamoDB. Microsecond latency for read-heavy workloads. Compatible with DynamoDB API — just change the endpoint.

**DynamoDB Streams:**
Ordered log of item changes. Triggers Lambda functions on create/update/delete. Enables event sourcing, cross-table replication, and real-time analytics.`,
        },
        {
          heading: 'DynamoDB Access Patterns',
          content: `DynamoDB is ACCESS-PATTERN driven. Design your table for specific queries, not general-purpose storage.

**Single-table design:**
Store multiple entity types in one table with composite keys:
\`\`\`javascript
// Partition key: PK, Sort key: SK
{ PK: "USER#u1", SK: "PROFILE", name: "Alice" }
{ PK: "USER#u1", SK: "ORDER#2024-06-01", total: 100 }
{ PK: "USER#u1", SK: "SETTINGS", theme: "dark" }
{ PK: "ORDER#o1", SK: "ITEM#p1", qty: 2 }
\`\`\`
Query: Get all data for user u1 → PK = "USER#u1"
Query: Get user's orders → PK = "USER#u1", SK begins_with "ORDER#"

**Batch operations:**
• BatchGetItem — Read up to 100 items per call
• BatchWriteItem — Write up to 25 items per call
• TransactWriteItems — Atomic writes across multiple items

**On-demand vs Provisioned:**
• On-demand — Pay per request, auto-scales, good for unpredictable traffic
• Provisioned — Reserve capacity, cheaper at steady state, use auto-scaling

**Pricing model:**
• Read capacity unit (RCU) — 1 strongly consistent read/sec for items up to 4KB
• Write capacity unit (WCU) — 1 write/sec for items up to 1KB
• Storage — $0.25/GB/month`,
        },
      ],
    },
  },
  {
    id: '26',
    title: 'Data Warehousing & Analytics',
    category: 'analytics',
    description: 'OLAP vs OLTP, star/snowflake schemas, ETL/ELT pipelines, and analytics platforms.',
    concepts: ['OLAP vs OLTP', 'Star schema', 'Snowflake schema', 'Fact tables', 'Dimension tables', 'ETL vs ELT', 'Data lake vs warehouse', 'Columnar storage', 'Materialized views'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'explanation',
      sections: [
        {
          heading: 'OLAP vs OLTP',
          content: `Two fundamentally different database paradigms:

**OLTP (Online Transaction Processing):**
• Purpose: Day-to-day operations (CRUD)
• Queries: Simple, indexed, single-row lookups
• Pattern: Read-write, many concurrent users
• Data: Current state, small result sets
• Example: Your app's production database
• Examples: PostgreSQL, MySQL, MongoDB

**OLAP (Online Analytical Processing):**
• Purpose: Business intelligence, reporting
• Queries: Complex aggregations, multi-table JOINs
• Pattern: Read-heavy, fewer concurrent queries
• Data: Historical, large result sets
• Example: Analytics dashboard, data warehouse
• Examples: Snowflake, BigQuery, Redshift, ClickHouse

**Key differences:**
| Aspect | OLTP | OLAP |
|--------|------|------|
| Operations | INSERT/UPDATE/DELETE | SELECT (read-only) |
| Query complexity | Simple (index-based) | Complex (full scans) |
| Data volume | GBs-TBs | TBs-PBs |
| Latency | Milliseconds | Seconds-minutes |
| Users | 1000s (concurrent) | 10s (analysts) |
| Schema | Normalized (3NF) | Denormalized (star) |`,
        },
        {
          heading: 'Star Schema & Snowflake Schema',
          content: `Data warehouses use denormalized schemas optimized for analytics.

**Star Schema:**
One fact table surrounded by dimension tables:
\`\`\`
          dim_date
             |
dim_product — fact_sales — dim_store
             |
          dim_customer
\`\`\`
• **Fact table** — Contains measurable events (sales, clicks, pageviews)
  - Foreign keys to dimensions
  - Numeric measures (quantity, revenue, duration)
  - Date/timestamp
• **Dimension tables** — Context about the events
  - Product name, category, brand
  - Store location, manager
  - Customer demographics

**Snowflake schema:**
Normalized dimensions (dimension tables have sub-dimensions):
\`\`\`
dim_product → dim_category → dim_department
\`\`\`
Saves space but requires more JOINs. Star schema is preferred for query performance.

**Slowly Changing Dimensions (SCD):**
How to handle changing dimension attributes:
• SCD Type 1 — Overwrite (no history)
• SCD Type 2 — Add new row (full history)
• SCD Type 3 — Add new column (limited history)

**Columnar storage:**
OLAP databases store data by column, not by row:
\`\`\`
Row store: [1,Alice,100] [2,Bob,200] [3,Charlie,300]
Column store: [1,2,3] [Alice,Bob,Charlie] [100,200,300]
\`\`\`
Scanning one column reads contiguous memory — 10-100x faster for aggregations.`,
        },
        {
          heading: 'ETL vs ELT',
          content: `Data pipelines move data from source systems to the warehouse.

**ETL (Extract → Transform → Load):**
1. Extract data from sources
2. Transform (clean, aggregate, join) in a staging area
3. Load into the warehouse
Used by: Traditional warehouses (Teradata, Informatica)

**ELT (Extract → Load → Transform):**
1. Extract data from sources
2. Load raw data into the warehouse
3. Transform using SQL inside the warehouse
Used by: Modern warehouses (Snowflake, BigQuery, Redshift)

**Why ELT is winning:**
• Cloud warehouses are cheap for storage
• SQL is the most common transformation language
• dbt (data build tool) makes ELT easy
• Raw data is preserved for re-processing

**Data Lake vs Data Warehouse:**
• **Data Lake** — Raw, unstructured data (S3, GCS). Cheap storage, schema-on-read.
• **Data Warehouse** — Processed, structured data. Fast queries, schema-on-write.
• **Lakehouse** — Combines both. Delta Lake, Apache Iceberg.

**Modern data stack:**
\`\`\`
Sources → Fivetran/Airbyte → S3 (Raw) → dbt → Snowflake (Warehouse) → Looker/Metabase (BI)
\`\`\``,
        },
      ],
    },
  },
  {
    id: '27',
    title: 'Database Security',
    category: 'security',
    description: 'SQL injection, encryption, access control, auditing, and compliance.',
    concepts: ['SQL injection', 'Prepared statements', 'Encryption at rest/in transit', 'TLS/SSL', 'RBAC', 'Row-level security', 'Column-level permissions', 'Audit logging', 'GDPR/HIPAA compliance'],
    type: 'interactive',
    engine: 'sqlite',
    demo: {
      type: 'queries',
      intro: {
        title: 'Database Security — Protecting Your Data',
        content: `Database security is non-negotiable. A breach can cost millions and destroy trust.

**SQL Injection (the #1 web vulnerability):**
\`\`\`python
# VULNERABLE — Never do this!
query = f"SELECT * FROM users WHERE name = '{user_input}'"
# If user_input = "'; DROP TABLE users; --"
# Result: SELECT * FROM users WHERE name = ''; DROP TABLE users; --'
# The database executes BOTH statements!

# SAFE — Use parameterized queries
cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,))
# The database treats user_input as data, not code
\`\`\`

**Prepared statements:**
Parse SQL once, execute many times with different parameters. Faster AND safer.

**Encryption:**
• **At rest** — Data encrypted on disk (AES-256). Transparent decryption for authorized users.
• **In transit** — TLS/SSL for all connections. Prevents man-in-the-middle attacks.
• **Application-level** — Encrypt sensitive fields before storage (passwords, SSNs).

**Access control:**
\`\`\`sql
-- Create roles
CREATE ROLE app_readonly;
CREATE ROLE app_readwrite;
CREATE ROLE admin;

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;

-- Row-level security (PostgreSQL)
CREATE POLICY user_isolation ON orders
  USING (user_id = current_setting('app.current_user_id')::int);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
\`\`\`

**Password hashing:**
Never store passwords in plain text. Use bcrypt, scrypt, or Argon2:
\`\`\`
# Generate hash
hash = bcrypt.hashpw(password, bcrypt.gensalt(12))
# Verify
bcrypt.checkpw(password, hash)
\`\`\`

**GDPR compliance:**
• Right to erasure — DELETE user data on request
• Data portability — Export user data as JSON/CSV
• Consent tracking — Log when/how user consented
• Data minimization — Only collect what's needed`,
      },
      queries: [
        {
          label: 'Safe parameterized query',
          sql: `SELECT * FROM users WHERE name = 'Alice'`,
          explanation: 'This is a parameterized query — the value "Alice" is treated as data, not executable code. In production: cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,)). The ? placeholder prevents SQL injection.',
          concept: 'SQL injection prevention',
        },
        {
          label: 'Safe JOIN (prevents data leakage)',
          sql: `SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.id = 1`,
          explanation: 'Always filter by the authenticated user\'s ID. Never trust client-provided user IDs. In production, use session-based authentication: WHERE user_id = current_setting(\'app.user_id\').',
          concept: 'Access control',
        },
        {
          label: 'Aggregate with access control',
          sql: `SELECT status, COUNT(*) as count, SUM(total) as revenue
FROM orders
GROUP BY status
ORDER BY revenue DESC`,
          explanation: 'Aggregations should respect row-level security. In PostgreSQL, RLS policies filter rows BEFORE aggregation. This prevents unauthorized users from seeing restricted data in aggregate results.',
          concept: 'Row-level security',
        },
        {
          label: 'Audit trail pattern',
          sql: `-- Log all data access
SELECT u.name, 'READ' as action, datetime('now') as timestamp
FROM users u WHERE u.id = 1`,
          explanation: 'In production: create an audit_log table and use triggers to log every SELECT, INSERT, UPDATE, DELETE. Track: who, what, when, from where, old value, new value. Essential for compliance (GDPR, HIPAA, SOC2).',
          concept: 'Audit logging',
        },
      ],
    },
  },
  {
    id: '28',
    title: 'Backup, Recovery & Monitoring',
    category: 'operations',
    description: 'WAL, point-in-time recovery, slow query logs, connection pooling, and alerting.',
    concepts: ['WAL (Write-Ahead Log)', 'Physical vs logical backups', 'Point-in-time recovery (PITR)', 'pg_dump / pg_restore', 'Slow query log', 'Connection pooling (PgBouncer)', 'EXPLAIN ANALYZE', 'Prometheus/Grafana metrics'],
    type: 'interactive',
    engine: 'sqlite',
    demo: {
      type: 'queries',
      intro: {
        title: 'Backup, Recovery & Monitoring — Keeping Data Safe',
        content: `Data is your most valuable asset. Backups protect it. Monitoring tells you when something is wrong.

**Write-Ahead Log (WAL):**
Before any change is applied to the database, it's written to the WAL file.
\`\`\`
Transaction: UPDATE users SET name = 'Bob' WHERE id = 1
1. Write: "UPDATE users SET name = 'Bob' WHERE id = 1" to WAL
2. Return success to client
3. Apply change to actual data file (checkpoint)
\`\`\`
If the server crashes between steps 2 and 3, the WAL is replayed on startup.

**Backup strategies:**
• **Full backup** — Copy entire database. Slow but simple.
• **Incremental backup** — Copy only changed pages since last backup.
• **WAL archiving** — Continuous archiving of WAL segments. Enables PITR.
• **Logical backup (pg_dump)** — SQL dump of schema + data. Portable but slower restore.

**Point-in-time recovery (PITR):**
Restore to any point in time using WAL archives:
\`\`\`bash
# PostgreSQL
pg_basebackup -D /backup -Ft -z -P
# After crash: restore base backup, replay WAL to desired timestamp
recovery.conf: restore_command = 'cp /archive/%f %p'
recovery_target_time = '2024-06-25 14:30:00'
\`\`\`

**Monitoring essentials:**
• **Connections** — Active/idle/waiting connections. Alert if near max.
• **Query performance** — Slow query log, pg_stat_statements
• **Replication lag** — Difference between primary and replica
• **Disk usage** — Tablespace growth rate
• **Cache hit ratio** — Should be > 99%. Below means more memory needed.
• **Lock waits** — Long-running locks indicate contention

**Connection pooling:**
Database connections are expensive (fork/thread per connection). PgBouncer maintains a pool:
\`\`\`
# pgbouncer.ini
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction  # Release connection after each transaction
max_client_conn = 1000
default_pool_size = 20
\`\`\``,
      },
      queries: [
        {
          label: 'Check data integrity',
          sql: `SELECT name, email, created_at FROM users ORDER BY id`,
          explanation: 'After a recovery, verify data integrity by checking critical tables. Compare row counts, checksums, and sample data against known-good backups. Automated integrity checks should run daily.',
          concept: 'Recovery verification',
        },
        {
          label: 'Analyze query performance',
          sql: `SELECT p.name, p.price, c.name as category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price > 50
ORDER BY p.price`,
          explanation: 'In PostgreSQL: EXPLAIN ANALYZE shows the actual execution plan with timing. Look for: sequential scans on large tables (need index), high row estimates (statistics may be stale), nested loops vs hash joins.',
          concept: 'EXPLAIN ANALYZE',
        },
        {
          label: 'Monitor slow queries',
          sql: `SELECT status, COUNT(*) as count, SUM(total) as revenue
FROM orders
GROUP BY status`,
          explanation: 'Slow query logging: log_min_duration_statement = 1000 (log queries > 1 second). pg_stat_statements tracks all query statistics. pgBadger analyzes logs for trends. Grafana dashboards visualize performance over time.',
          concept: 'Slow query analysis',
        },
        {
          label: 'Backup verification',
          sql: `-- Verify table structure and row counts
SELECT 'users' as tbl, COUNT(*) as rows FROM users
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'products', COUNT(*) FROM products`,
          explanation: 'After restore, verify: row counts match, schema is correct, constraints are intact, indexes exist. Automate this with a post-restore script that compares against expected state.',
          concept: 'Backup verification',
        },
      ],
    },
  },
  {
    id: '29',
    title: 'Database Migrations & DevOps',
    category: 'operations',
    description: 'Schema migrations, zero-downtime deploys, blue-green databases, and CI/CD for data.',
    concepts: ['Schema migrations (Flyway, Liquibase, Alembic)', 'Zero-downtime migrations', 'Blue-green deploys', 'Expand/contract pattern', 'Feature flags for DB changes', 'Canary releases', 'Database versioning'],
    type: 'interactive',
    engine: 'sqlite',
    demo: {
      type: 'queries',
      intro: {
        title: 'Database Migrations — Changing Schema Without Downtime',
        content: `Schema changes are the most dangerous operations in production. A bad migration can take down your service for hours.

**Schema migration tools:**
• **Flyway** — SQL-based, version-numbered migrations (V1__create_users.sql)
• **Liquibase** — XML/YAML/SQL changesets with rollback support
• **Alembic** — Python, auto-generates migrations from SQLAlchemy models
• **Rails ActiveRecord** — Ruby conventions, up/down methods
• **Knex.js** — JavaScript, programmatic migration builder

**Zero-downtime migration pattern (Expand & Contract):**
Instead of one big change, do it in 3 steps over days/weeks:

**Step 1: Expand (backward-compatible)**
\`\`\`sql
-- Add new column with default
ALTER TABLE users ADD COLUMN full_name TEXT DEFAULT '';
-- Populate from existing data
UPDATE users SET full_name = first_name || ' ' || last_name;
\`\`\`
Old code still works (ignores new column). New code can use it.

**Step 2: Migrate (transition period)**
\`\`\`sql
-- Backfill all rows
UPDATE users SET full_name = first_name || ' ' || last_name
WHERE full_name = '';
-- Add NOT NULL constraint
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
\`\`\`
Both old and new code work. Deploy new code that uses full_name.

**Step 3: Contract (cleanup)**
\`\`\`sql
-- Remove old columns
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
\`\`\`
Only after all code is deployed and stable.

**Blue-green database deploys:**
• Blue = current production database
• Green = new version
• Switch traffic atomically
• Rollback by switching back

**Dangerous migrations to avoid:**
• Renaming columns (breaks all queries)
• Changing column types (data loss risk)
• Adding NOT NULL without defaults (fails on existing rows)
• Large ALTER TABLE on billion-row tables (locks table for hours)`,
      },
      queries: [
        {
          label: 'Safe column addition',
          sql: `-- Add column with default (SQLite 3.25+)
-- ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''
-- This is safe: existing rows get the default value
SELECT name, email FROM users`,
          explanation: 'Adding a column with a default is always safe in modern databases. The default is applied to all existing rows without a table rewrite. In PostgreSQL: ALTER TABLE ADD COLUMN is instant for columns with non-volatile defaults.',
          concept: 'Expand phase',
        },
        {
          label: 'Backfill data safely',
          sql: `-- Update in batches to avoid locking the entire table
-- UPDATE users SET full_name = name WHERE full_name IS NULL LIMIT 1000
-- Repeat until 0 rows affected
SELECT name, email FROM users WHERE id <= 3`,
          explanation: 'For large tables, never UPDATE all rows at once. Use batched updates: UPDATE ... WHERE id > last_id AND id <= last_id + 1000. This keeps lock duration short and allows other queries to proceed.',
          concept: 'Batched migration',
        },
        {
          label: 'Verify migration success',
          sql: `-- Check row counts before and after
SELECT COUNT(*) as total FROM users`,
          explanation: 'After every migration, verify: row counts match, no NULLs in required columns, constraints are valid, application queries still work. Automate this with a migration verification script.',
          concept: 'Migration verification',
        },
        {
          label: 'Rollback pattern',
          sql: `-- Every migration should have a rollback script
-- Forward: ALTER TABLE users ADD COLUMN phone TEXT
-- Rollback: ALTER TABLE users DROP COLUMN phone
-- Test both directions before deploying
SELECT name, email FROM users LIMIT 5`,
          explanation: 'Always write rollback scripts alongside forward migrations. Test rollback in staging before deploying. Some migrations (data deletions) cannot be rolled back — backup before running.',
          concept: 'Rollback safety',
        },
      ],
    },
  },
  {
    id: '30',
    title: 'Real-World Database Architecture',
    category: 'architecture',
    description: 'How Instagram, Uber, Netflix, Discord, and other companies architect their databases.',
    concepts: ['Instagram (PostgreSQL sharding)', 'Uber (Schemaless/Mysql)', 'Netflix (Cassandra + EVCache)', 'Discord (Cassandra migration)', 'Slack (Vitess)', 'GitHub (MySQL + Vitess)', 'Polyglot persistence patterns', 'Database migration at scale'],
    type: 'interactive',
    engine: null,
    demo: {
      type: 'explanation',
      sections: [
        {
          heading: 'Instagram — PostgreSQL at Billions of Rows',
          content: `Instagram serves 2B+ monthly users on PostgreSQL.

**Architecture:**
\`\`\`
App Servers → PgBouncer (connection pool) → PostgreSQL Primary
                                                 ↓
                                           PostgreSQL Replicas (read)
\`\`\`

**Key decisions:**
• **Sharding** — Shard by user_id. Each shard is a separate PostgreSQL instance.
• **Feed generation** — Pre-computed using fan-out-on-write. When you post, your followers' feeds are updated immediately.
• **Media storage** — S3 for images, PostgreSQL for metadata.
• **Caching** — Memcached for hot data, Redis for counts/leaderboards.

**Lessons learned:**
• Connection pooling is critical — PgBouncer saved them from connection storms
• Sharding by user_id gives 95% of queries single-shard access
• Pre-compute expensive queries (fan-out-on-write over fan-out-on-read)`,
        },
        {
          heading: 'Uber — Schemaless (Custom MySQL Layer)',
          content: `Uber built Schemaless on top of MySQL for their trip data.

**Architecture:**
\`\`\`
App → Schemaless (row store + document store) → MySQL
  ↓
Hive (analytics) → S3
\`\`\`

**Schemaless is two stores:**
• **Row store** — Traditional MySQL tables for structured data
• **Document store** — Schemaless rows (id, blob). Flexible schema stored as JSON.

**Migration from PostgreSQL to MySQL:**
Uber famously migrated from PostgreSQL to MySQL. Reasons:
• PostgreSQL's replication lag under heavy writes
• Connection overhead (process-per-connection)
• MySQL's better tooling for their use case

**Key lessons:**
• No database is perfect for every use case
• Operational maturity matters more than features
• Migrations are possible but expensive`,
        },
        {
          heading: 'Netflix — Cassandra + EVCache at Global Scale',
          content: `Netflix streams to 230M+ subscribers across 190 countries.

**Architecture:**
\`\`\`
Global CDN → API Gateway → Microservices
                               ↓
                    Cassandra (multi-region)
                    EVCache (Memcached + consistency)
                    MySQL (billing, accounts)
\`\`\`

**Why Cassandra:**
• Multi-region active-active (no single primary)
• Linear scalability as subscriber count grows
• Tunable consistency per query
• Handles 70M+ operations per day

**EVCache (Enhanced Vider Cache):**
Netflix's caching layer on top of Memcached:
• Consistent hashing for cache distribution
• Cache invalidation via Kafka events
• Cross-region cache replication

**Key lessons:**
• Multi-region requires careful data modeling
• Cache invalidation is the hardest problem in distributed systems
• Use the right tool for each job (Cassandra for streams, MySQL for billing)`,
        },
        {
          heading: 'Discord — From MongoDB to Cassandra to ScyllaDB',
          content: `Discord stores 4B+ messages and migrated twice.

**Migration 1: MongoDB → Cassandra**
Reason: MongoDB couldn't handle their write volume (millions of messages/sec).
Result: Cassandra handled the writes but operational complexity was high.

**Migration 2: Cassandra → ScyllaDB**
Reason: ScyllaDB is a C++ rewrite of Cassandra — 10x better performance.
Result: Same data model, 10x fewer nodes, lower latency.

**Data model:**
\`\`\`sql
-- Messages partitioned by channel + time bucket
CREATE TABLE messages (
  channel_id BIGINT,
  bucket TIMESTAMP,  -- Monthly bucket
  message_id BIGINT,
  author_id BIGINT,
  content TEXT,
  PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
\`\`\`

**Key lessons:**
• Schema design matters more than database choice
• Migrations are possible even for massive datasets
• Operational simplicity is worth sacrificing features`,
        },
        {
          heading: 'Slack — Vitess (Distributed MySQL)',
          content: `Slack uses Vitess to distribute MySQL across thousands of nodes.

**Vitess architecture:**
\`\`\`
App → VTGate (query router) → VTTablet (per-shard proxy) → MySQL
\`\`\`

**What Vitess does:**
• Transparent sharding — App queries a logical database, Vitess routes to shards
• Connection pooling — VTTablet manages MySQL connections
• Query rewriting — Rewrites queries for sharding compatibility
• Online DDL — Schema changes without downtime

**Key lessons:**
• You don't always need to change databases — sometimes a proxy is enough
• Vitess lets you keep MySQL's ecosystem while scaling horizontally
• Connection management is a universal challenge`,
        },
        {
          heading: 'General Architecture Patterns',
          content: `**1. CQRS (Command Query Responsibility Segregation)**
Separate write model (OLTP) from read model (OLAP/OLAP):
\`\`\`
Write: PostgreSQL (normalized, ACID)
  ↓ CDC (Change Data Capture)
Read: Elasticsearch (denormalized, fast search)
  ↓
Analytics: ClickHouse (columnar, aggregations)
\`\`\`

**2. Event Sourcing**
Store every state change as an immutable event:
\`\`\`
Event 1: UserCreated { name: "Alice" }
Event 2: EmailChanged { email: "alice@new.com" }
Event 3: OrderPlaced { total: 100 }
Current state = replay all events
\`\`\`
Used by: Banks, trading systems, audit-heavy domains.

**3. Data Mesh**
Decentralized data ownership. Each team owns their data as a product.
• Domain-oriented ownership
• Data as a product (with SLAs)
• Self-serve data platform
• Federated computational governance

**4. Database-per-service (Microservices)**
Each microservice owns its database. No shared databases.
\`\`\`
User Service → PostgreSQL
Order Service → MongoDB
Analytics Service → ClickHouse
\`\`\`
Trade-off: No JOINs across services, eventual consistency between services.`,
        },
      ],
    },
  },
];
