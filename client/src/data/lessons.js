export default [
  {
    "id": "1",
    "title": "What is a Database?",
    "category": "fundamentals",
    "description": "From flat files to organized systems — why databases exist and how they changed everything.",
    "concepts": [
      "Data persistence",
      "Structured storage",
      "Query languages",
      "CRUD",
      "ACID",
      "Indexes",
      "Schema design"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "2",
    "title": "Relational Databases & SQL",
    "category": "relational",
    "description": "Tables, relationships, and the language that runs most of the world's data.",
    "concepts": [
      "Tables & schemas",
      "Primary & foreign keys",
      "JOINs (INNER, LEFT, RIGHT, CROSS)",
      "GROUP BY & HAVING",
      "Indexes",
      "Transactions",
      "Normalization"
    ],
    "type": "interactive",
    "engine": "sqlite"
  },
  {
    "id": "3",
    "title": "Key-Value Stores",
    "category": "key-value",
    "description": "The simplest, fastest database model. One key, one value. No queries, no schema.",
    "concepts": [
      "O(1) lookups",
      "LSM-trees",
      "Bloom filters",
      "Write amplification",
      "Compaction",
      "Prefix scans",
      "Batch operations"
    ],
    "type": "interactive",
    "engine": "level"
  },
  {
    "id": "4",
    "title": "Graph Databases",
    "category": "graph",
    "description": "Data as a network of connected things. The natural model for relationships.",
    "concepts": [
      "Nodes & edges",
      "Properties on both",
      "BFS/DFS traversal",
      "Shortest path",
      "Cypher query language",
      "Index-free adjacency",
      "Pattern matching"
    ],
    "type": "interactive",
    "engine": "graph"
  },
  {
    "id": "5",
    "title": "Time-Series Databases",
    "category": "timeseries",
    "description": "Optimized for timestamped data. Write millions of points per second, query by time range.",
    "concepts": [
      "Timestamps as first-class",
      "Downsampling",
      "Retention policies",
      "Time-range queries",
      "Aggregations (avg, sum, max)",
      "Tags for dimensions",
      "Continuous queries"
    ],
    "type": "interactive",
    "engine": "timeseries"
  },
  {
    "id": "6",
    "title": "Vector Databases & AI",
    "category": "vector",
    "description": "Store embeddings, find similar things. The database behind modern AI applications.",
    "concepts": [
      "Embeddings",
      "Cosine similarity",
      "Approximate Nearest Neighbor",
      "HNSW index",
      "RAG (Retrieval Augmented Generation)",
      "Semantic search",
      "Dimension reduction"
    ],
    "type": "interactive",
    "engine": "vector"
  },
  {
    "id": "7",
    "title": "CAP Theorem & Distributed Systems",
    "category": "theory",
    "description": "Why you can't have everything. The fundamental trade-off in distributed databases.",
    "concepts": [
      "Consistency",
      "Availability",
      "Partition tolerance",
      "CP vs AP",
      "Eventual consistency",
      "PACELC",
      "Consensus protocols"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "8",
    "title": "Database Comparison",
    "category": "comparison",
    "description": "Same problem, different databases. See the trade-offs in action.",
    "concepts": [
      "Use-case fit",
      "Polyglot persistence",
      "Right tool for the job",
      "Performance trade-offs",
      "Consistency models",
      "Scaling patterns"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "9",
    "title": "SQL Language Deep Dive",
    "category": "sql-language",
    "description": "Master SQL from DDL to window functions. The complete language reference with runnable examples.",
    "concepts": [
      "DDL (CREATE, ALTER, DROP)",
      "DML (SELECT, INSERT, UPDATE, DELETE)",
      "DCL (GRANT, REVOKE)",
      "TCL (COMMIT, ROLLBACK)",
      "Window Functions",
      "CTEs",
      "Subqueries",
      "Set Operations",
      "Data Types",
      "Constraints"
    ],
    "type": "interactive",
    "engine": "sqlite"
  },
  {
    "id": "10",
    "title": "MongoDB & Document Queries",
    "category": "nosql",
    "description": "Document databases: flexible schemas, rich queries, and the aggregation pipeline.",
    "concepts": [
      "Document model",
      "CRUD operations",
      "Aggregation pipeline",
      "Embedding vs referencing",
      "Indexing",
      "Sharding",
      "Change streams"
    ],
    "type": "interactive",
    "engine": "mongodb"
  },
  {
    "id": "11",
    "title": "Cypher: Graph Query Language",
    "category": "graph-language",
    "description": "Neo4j's Cypher language. Pattern matching, path queries, and graph algorithms.",
    "concepts": [
      "MATCH patterns",
      "CREATE/MERGE",
      "Path patterns",
      "Variable-length paths",
      "Pattern comprehension",
      "Graph algorithms",
      "Index management"
    ],
    "type": "interactive",
    "engine": "graph"
  },
  {
    "id": "12",
    "title": "Time-Series Query Languages",
    "category": "tsdb-language",
    "description": "InfluxQL, PromQL, and Flux — the specialized languages for time-series data.",
    "concepts": [
      "InfluxQL SELECT",
      "GROUP BY time()",
      "PromQL metrics & ranges",
      "Flux pipe operators",
      "Retention policies",
      "Continuous queries",
      "Downsampling"
    ],
    "type": "interactive",
    "engine": "timeseries"
  },
  {
    "id": "13",
    "title": "Redis & Key-Value Patterns",
    "category": "kv-language",
    "description": "Redis data structures, commands, and real-world patterns.",
    "concepts": [
      "Strings",
      "Lists",
      "Hashes",
      "Sets",
      "Sorted Sets",
      "Pub/Sub",
      "Lua scripting",
      "TTL & expiration",
      "Transactions"
    ],
    "type": "interactive",
    "engine": "level"
  },
  {
    "id": "14",
    "title": "Database Design & Modeling",
    "category": "design",
    "description": "How to design schemas, normalize data, and avoid common pitfalls.",
    "concepts": [
      "Normalization (1NF, 2NF, 3NF, BCNF)",
      "Denormalization",
      "ER diagrams",
      "Composite keys",
      "Surrogate vs natural keys",
      "Soft deletes",
      "Audit trails",
      "Polymorphic associations"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "15",
    "title": "Indexing & Query Performance",
    "category": "performance",
    "description": "How databases find data fast. Index types, query planning, and optimization.",
    "concepts": [
      "B-Tree indexes",
      "Hash indexes",
      "GIN/GiST",
      "Composite indexes",
      "Covering indexes",
      "Query planner",
      "EXPLAIN",
      "Index-only scans",
      "Partial indexes"
    ],
    "type": "interactive",
    "engine": "sqlite"
  },
  {
    "id": "16",
    "title": "NoSQL Data Modeling",
    "category": "nosql",
    "description": "Denormalization, embedding strategies, and patterns for document/graph/KV stores.",
    "concepts": [
      "Embedding vs referencing",
      "Bucket pattern",
      "Schema versioning",
      "Polymorphic patterns",
      "Time-series patterns",
      "Graph modeling",
      "Event sourcing"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "17",
    "title": "Distributed Systems & Replication",
    "category": "theory",
    "description": "How databases scale across machines. Replication, sharding, consensus, and consistency.",
    "concepts": [
      "Master-slave replication",
      "Multi-master",
      "Sharding",
      "Consistent hashing",
      "Raft consensus",
      "Vector clocks",
      "Conflict resolution",
      "Eventual consistency"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "18",
    "title": "Database Comparison Matrix",
    "category": "comparison",
    "description": "Comprehensive comparison of every database type with decision framework.",
    "concepts": [
      "Decision matrix",
      "Performance benchmarks",
      "Scaling patterns",
      "Operational complexity",
      "Cost models",
      "Migration strategies",
      "Polyglot persistence"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "19",
    "title": "SQL Transactions & Concurrency Control",
    "category": "transactions",
    "description": "ACID in practice, isolation levels, locking, deadlocks, and MVCC.",
    "concepts": [
      "Transaction lifecycle",
      "Isolation levels (Read Uncommitted → Serializable)",
      "Pessimistic vs optimistic locking",
      "Deadlocks",
      "MVCC",
      "Savepoints",
      "Two-phase locking",
      "Snapshot isolation"
    ],
    "type": "interactive",
    "engine": "sqlite"
  },
  {
    "id": "20",
    "title": "PostgreSQL Advanced Features",
    "category": "advanced-db",
    "description": "JSONB, arrays, full-text search, materialized views, and PostgreSQL-specific power features.",
    "concepts": [
      "JSONB operations",
      "Array columns",
      "Full-text search (tsvector/tsquery)",
      "Materialized views",
      "CTE recursion",
      "LATERAL joins",
      "Window functions",
      "Extensions (pg_trgm, PostGIS)"
    ],
    "type": "interactive",
    "engine": "sqlite"
  },
  {
    "id": "21",
    "title": "MySQL & Storage Engines",
    "category": "advanced-db",
    "description": "MySQL internals: InnoDB vs MyISAM, replication, and MySQL-specific optimizations.",
    "concepts": [
      "InnoDB vs MyISAM",
      "Buffer pool",
      "Redo/undo logs",
      "Binary logging",
      "Replication (async, semi-sync, GTID)",
      "Partitioning",
      "Query cache",
      "InnoDB clustered index"
    ],
    "type": "interactive",
    "engine": "sqlite"
  },
  {
    "id": "22",
    "title": "MongoDB Advanced Operations",
    "category": "nosql",
    "description": "Transactions, change streams, sharding, schema validation, and GridFS.",
    "concepts": [
      "Multi-document transactions",
      "Change streams",
      "Sharding strategy",
      "Schema validation",
      "GridFS",
      "Read/write concern",
      "Read preference",
      "Aggregation optimization"
    ],
    "type": "interactive",
    "engine": "mongodb"
  },
  {
    "id": "23",
    "title": "Cassandra & Column-Family Stores",
    "category": "nosql",
    "description": "Apache Cassandra: partitioning, replication, compaction, and CQL query language.",
    "concepts": [
      "Partition keys",
      "Clustering columns",
      "Replication factor",
      "Consistency levels",
      "Compaction strategies",
      "CQL (Cassandra Query Language)",
      "Tunable consistency",
      "Anti-entropy repair"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "24",
    "title": "Elasticsearch & Full-Text Search",
    "category": "search",
    "description": "Inverted indexes, analyzers, mappings, aggregations, and search relevance.",
    "concepts": [
      "Inverted index",
      "Analyzers (standard, custom)",
      "Mappings (text vs keyword)",
      "Query DSL",
      "Bool queries",
      "Aggregations",
      "Scoring (TF-IDF, BM25)",
      "Fuzzy search",
      "Percolator"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "25",
    "title": "DynamoDB & Cloud-Native Databases",
    "category": "cloud-db",
    "description": "AWS DynamoDB: partition design, GSIs, DAX, streams, and serverless patterns.",
    "concepts": [
      "Partition key design",
      "Sort keys",
      "Global Secondary Indexes",
      "Local Secondary Indexes",
      "DAX (caching)",
      "DynamoDB Streams",
      "Batch operations",
      "On-demand vs provisioned"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "26",
    "title": "Data Warehousing & Analytics",
    "category": "analytics",
    "description": "OLAP vs OLTP, star/snowflake schemas, ETL/ELT pipelines, and analytics platforms.",
    "concepts": [
      "OLAP vs OLTP",
      "Star schema",
      "Snowflake schema",
      "Fact tables",
      "Dimension tables",
      "ETL vs ELT",
      "Data lake vs warehouse",
      "Columnar storage",
      "Materialized views"
    ],
    "type": "interactive",
    "engine": null
  },
  {
    "id": "27",
    "title": "Database Security",
    "category": "security",
    "description": "SQL injection, encryption, access control, auditing, and compliance.",
    "concepts": [
      "SQL injection",
      "Prepared statements",
      "Encryption at rest/in transit",
      "TLS/SSL",
      "RBAC",
      "Row-level security",
      "Column-level permissions",
      "Audit logging",
      "GDPR/HIPAA compliance"
    ],
    "type": "interactive",
    "engine": "sqlite"
  },
  {
    "id": "28",
    "title": "Backup, Recovery & Monitoring",
    "category": "operations",
    "description": "WAL, point-in-time recovery, slow query logs, connection pooling, and alerting.",
    "concepts": [
      "WAL (Write-Ahead Log)",
      "Physical vs logical backups",
      "Point-in-time recovery (PITR)",
      "pg_dump / pg_restore",
      "Slow query log",
      "Connection pooling (PgBouncer)",
      "EXPLAIN ANALYZE",
      "Prometheus/Grafana metrics"
    ],
    "type": "interactive",
    "engine": "sqlite"
  },
  {
    "id": "29",
    "title": "Database Migrations & DevOps",
    "category": "operations",
    "description": "Schema migrations, zero-downtime deploys, blue-green databases, and CI/CD for data.",
    "concepts": [
      "Schema migrations (Flyway, Liquibase, Alembic)",
      "Zero-downtime migrations",
      "Blue-green deploys",
      "Expand/contract pattern",
      "Feature flags for DB changes",
      "Canary releases",
      "Database versioning"
    ],
    "type": "interactive",
    "engine": "sqlite"
  },
  {
    "id": "30",
    "title": "Real-World Database Architecture",
    "category": "architecture",
    "description": "How Instagram, Uber, Netflix, Discord, and other companies architect their databases.",
    "concepts": [
      "Instagram (PostgreSQL sharding)",
      "Uber (Schemaless/Mysql)",
      "Netflix (Cassandra + EVCache)",
      "Discord (Cassandra migration)",
      "Slack (Vitess)",
      "GitHub (MySQL + Vitess)",
      "Polyglot persistence patterns",
      "Database migration at scale"
    ],
    "type": "interactive",
    "engine": null
  }
]