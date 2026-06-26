import { useState, useEffect } from 'react';
import { Settings, Database, Key, GitBranch, Clock, Cpu, Box, ChevronRight, ChevronDown, Zap, Shield, Gauge, HardDrive, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getEngines, getSchema } from '../utils/api';
import SchemaViewer from '../components/SchemaViewer';

const ENGINE_DETAILS = {
  sqlite: {
    icon: Database,
    label: 'Relational',
    color: 'bg-blue-600',
    title: 'SQLite — Relational Database',
    description: 'Tables with typed columns, primary keys, and foreign key relationships. Data is normalized — repeated values stored once and referenced by ID.',
    howDataIsStored: 'Data lives in a single .db file. Tables are B-tree structures. Each row has a fixed schema. Indexes (B-tree by default) speed up lookups. WAL (Write-Ahead Logging) enables concurrent reads during writes.',
    schemaPattern: 'Each table = one entity type. Columns define the structure. Foreign keys connect tables. JOINs combine data at query time.',
    accessPatterns: [
      { pattern: 'Point lookup', example: 'SELECT * FROM users WHERE id = 1', complexity: 'O(log n)', note: 'Uses primary key index' },
      { pattern: 'Range scan', example: 'SELECT * FROM products WHERE price BETWEEN 10 AND 100', complexity: 'O(log n + k)', note: 'B-tree range scan, k = matching rows' },
      { pattern: 'Full scan', example: 'SELECT * FROM users WHERE name LIKE "%alice%"', complexity: 'O(n)', note: 'No index on name column' },
      { pattern: 'JOIN', example: 'SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id', complexity: 'O(n log n)', note: 'Hash or nested-loop join' },
      { pattern: 'Aggregation', example: 'SELECT category, COUNT(*) FROM products GROUP BY category', complexity: 'O(n)', note: 'Single pass through data' },
    ],
    whenToUse: ['ACID transactions required', 'Complex queries with JOINs', 'Structured data with fixed schema', 'Single-server deployment', 'Embedded/mobile apps'],
    whenToAvoid: ['Need horizontal scaling', 'Write-heavy workloads (millions/sec)', 'Flexible/dynamic schema', 'Real-time analytics on billions of rows'],
    storageEngine: 'B-tree (default), WAL mode for concurrency',
    maxDataSize: 'Practical limit ~140 TB, but most use < 1 GB',
    consistencyModel: 'Strong (ACID)',
    scalingModel: 'Vertical (single server)',
    indexTypes: ['B-Tree (default)', 'Hash (equality only)', 'GIN (arrays, FTS)', 'GiST (geometric)'],
    sqlSupport: 'Full SQL: JOINs, subqueries, window functions, CTEs, recursive queries, triggers',
    realWorld: 'Embedded in every smartphone, browser, OS. Powers more apps than any other database.',
  },
  level: {
    icon: Key,
    label: 'Key-Value',
    color: 'bg-red-600',
    title: 'LevelDB — Key-Value Store',
    description: 'No schema! Data stored as key→value pairs. Keys are strings (sorted lexicographically), values can be any JSON.',
    howDataIsStored: 'LSM-tree: writes go to in-memory memtable (sorted), periodically flushed to sorted SSTable files on disk. Background compaction merges SSTables. Bloom filters speed up reads.',
    schemaPattern: 'No enforced schema. Key naming convention IS the schema: "user:123", "session:abc", "cache:homepage". Prefixes create logical groups.',
    accessPatterns: [
      { pattern: 'Point lookup', operation: 'get', params: { key: 'user:1' }, complexity: 'O(1) amortized', note: 'Hash index + Bloom filter' },
      { pattern: 'Prefix scan', operation: 'list', params: { prefix: 'user:' }, complexity: 'O(k)', note: 'k = matching keys, lexicographic order' },
      { pattern: 'Sequential write', operation: 'put', params: { key: 'x', value: 1 }, complexity: 'O(1)', note: 'Append to memtable + WAL' },
      { pattern: 'Range scan', operation: 'list', params: { gte: 'user:00', lte: 'user:99' }, complexity: 'O(k)', note: 'Lexicographic range' },
      { pattern: 'Batch write', operation: 'batch', params: { operations: [] }, complexity: 'O(n)', note: 'Atomic multi-key write' },
    ],
    whenToUse: ['High-throughput caching', 'Session storage', 'Counters and rate limiting', 'Real-time leaderboards', 'Write-heavy workloads'],
    whenToAvoid: ['Need complex queries or JOINs', 'Need ACID transactions across keys', 'Need secondary indexes', 'Data relationships matter'],
    storageEngine: 'LSM-tree (Log-Structured Merge Tree)',
    maxDataSize: 'Practical limit ~1 TB per instance',
    consistencyModel: 'Eventual (single-process)', 
    scalingModel: 'Vertical (single-process), horizontal via cluster',
    indexTypes: ['Hash index (in-memory)', 'Bloom filters (for reads)', 'SSTable index blocks'],
    sqlSupport: 'None — get/put/del/scan operations only',
    realWorld: 'Embedded in Chrome (IndexedDB), Android, Bitcoin Core. Redis builds on similar principles.',
  },
  graph: {
    icon: GitBranch,
    label: 'Graph',
    color: 'bg-purple-600',
    title: 'Graph Database — Property Graph',
    description: 'Nodes with types and properties, connected by typed edges with properties. Schema = node types + edge types.',
    howDataIsStored: 'In-memory adjacency lists. Each node stores its edges directly. Index-free adjacency — each node knows its neighbors. Traversal follows pointers, not index lookups.',
    schemaPattern: 'Nouns become nodes (Person, Product). Verbs become edges (FRIENDS_WITH, PURCHASED). Adjectives become properties (age, since).',
    accessPatterns: [
      { pattern: 'Node lookup', operation: 'neighbors', params: { node: 'alice' }, complexity: 'O(1)', note: 'Direct pointer access' },
      { pattern: 'BFS traversal', operation: 'bfs', params: { from: 'alice', depth: 2 }, complexity: 'O(k)', note: 'k = nodes in result' },
      { pattern: 'Shortest path', operation: 'shortest_path', params: { from: 'a', to: 'b' }, complexity: 'O(V + E)', note: 'BFS from source' },
      { pattern: 'Pattern match', operation: 'search', params: { query: 'Person' }, complexity: 'O(n)', note: 'Scan all nodes' },
      { pattern: 'Multi-hop', operation: 'bfs', params: { from: 'a', depth: 5 }, complexity: 'O(k^d)', note: 'k = avg degree, d = depth' },
    ],
    whenToUse: ['Relationships are primary query pattern', 'Need multi-hop traversal', 'Social networks, recommendations', 'Knowledge graphs', 'Fraud detection'],
    whenToAvoid: ['Simple key-value lookups', 'Aggregation-heavy analytics', 'Tabular data with no relationships', 'Small datasets (relational is simpler)'],
    storageEngine: 'Adjacency list (in-memory), optional persistence',
    maxDataSize: 'Practical limit ~1 billion nodes (memory dependent)',
    consistencyModel: 'Eventual (in-memory)',
    scalingModel: 'Vertical (single-process)',
    indexTypes: ['Label index', 'Property index (on request)', 'Full-text index'],
    sqlSupport: 'None — graph traversal operations (MATCH, CREATE, MERGE in Cypher)',
    realWorld: 'Neo4j powers recommendation engines at eBay, NASA knowledge graphs, fraud detection at PayPal.',
  },
  timeseries: {
    icon: Clock,
    label: 'Time-Series',
    color: 'bg-amber-600',
    title: 'Time-Series Database — InfluxDB-style',
    description: 'Measurements with timestamps, values, tags. Tags enable dimensional queries — filter by host, region, or any tag.',
    howDataIsStored: 'Append-only log of timestamped data points. Data partitioned by time (shards). Tags create separate series. LSM-tree-like compaction. Built-in downsampling and retention.',
    schemaPattern: 'Measurement = metric name. Timestamp = when. Value = what was measured. Tags = dimensions for grouping (host, region, env).',
    accessPatterns: [
      { pattern: 'Time range', complexity: 'O(1) partition', note: 'Query: range("cpu", -1h, now()). Time partition pruning skips irrelevant shards.' },
      { pattern: 'Aggregation', complexity: 'O(n/buckets)', note: 'Query: aggregate("cpu", -24h, avg). Groups points into buckets, computes per bucket.' },
      { pattern: 'Downsample', complexity: 'O(n)', note: 'Query: downsample("cpu", -7d, 1h). Reduces resolution from 1s to 1h — 8640x fewer points.' },
      { pattern: 'Tag filter', complexity: 'O(1) per tag', note: 'Query: range("cpu", host="web-01"). Tags are indexed — instant filter.' },
      { pattern: 'Write', complexity: 'O(1)', note: 'Append-only. No locks, no updates. Write 1M points/sec on commodity hardware.' },
    ],
    whenToUse: ['Metrics, monitoring, observability', 'IoT sensor data', 'Financial market data', 'Log aggregation', 'Any timestamped data at scale'],
    whenToAvoid: ['Non-temporal data', 'Need JOINs or relationships', 'Update-heavy workloads', 'Small datasets (SQL is simpler)'],
    storageEngine: 'Time-partitioned LSM-tree, columnar compression',
    maxDataSize: 'Billions of points (compression: 10:1 ratio)',
    consistencyModel: 'Eventual (async replication)',
    scalingModel: 'Horizontal (cluster), vertical (single node)',
    indexTypes: ['Time partition index', 'Tag index (inverted)', 'Series index'],
    sqlSupport: 'InfluxQL (SQL-like), PromQL (Prometheus), Flux (functional)',
    realWorld: 'InfluxDB at Tesla (vehicle telemetry), Cisco (network monitoring), Cloudflare (analytics).',
  },
  vector: {
    icon: Cpu,
    label: 'Vector',
    color: 'bg-pink-600',
    title: 'Vector Database — Embedding Store',
    description: 'Documents with embeddings (arrays of floats) and metadata. Embedding captures semantic meaning of text.',
    howDataIsStored: 'Vectors stored with metadata. HNSW (Hierarchical Navigable Small World) graph index for fast approximate nearest neighbor search. Supports cosine, dot product, and L2 distance.',
    schemaPattern: 'Each document has: id, text/content, category (metadata), vector (embedding array). Similar items have similar vectors.',
    accessPatterns: [
      { pattern: 'Similarity search', complexity: 'O(log n)', note: 'HNSW approximate nearest neighbor. Finds top-K closest vectors.' },
      { pattern: 'Text search', complexity: 'O(n)', note: 'Word overlap in demo. Production: embed text to vector first, then ANN search.' },
      { pattern: 'Insert', complexity: 'O(log n)', note: 'Update HNSW graph. New node connected to nearest neighbors.' },
      { pattern: 'Filter + search', complexity: 'O(n)', note: 'Post-filter in demo; pre-filter in production with HNSW index.' },
      { pattern: 'Delete', complexity: 'O(log n)', note: 'Mark as deleted in index. Actual removal during compaction.' },
    ],
    whenToUse: ['Semantic search / RAG', 'Image/audio similarity', 'Recommendation systems', 'Anomaly detection', 'Drug discovery'],
    whenToAvoid: ['Exact keyword search (use Elasticsearch)', 'Structured queries (use SQL)', 'Small datasets (brute force is fine)', 'Need guaranteed exact results'],
    storageEngine: 'HNSW graph index + flat vector storage',
    maxDataSize: 'Millions of vectors (dimension-dependent)',
    consistencyModel: 'Eventual',
    scalingModel: 'Horizontal (sharding by vector space)',
    indexTypes: ['HNSW (default)', 'IVF (inverted file)', 'PQ (product quantization)'],
    sqlSupport: 'None — insert, search_by_text, search (vector), list, delete',
    realWorld: 'Pinecone powers ChatGPT RAG. Weaviate at Spotify for music recommendations.',
  },
  mongodb: {
    icon: Box,
    label: 'Document',
    color: 'bg-green-600',
    title: 'MongoDB — Document Database',
    description: 'Collections of JSON-like documents. Flexible schema — each document can have different fields.',
    howDataIsStored: 'BSON (binary JSON) documents in collections. WiredTiger storage engine with document-level locking. Journaling for crash recovery. Optional compression (zlib, snappy).',
    schemaPattern: 'Collections = groups of documents. Documents = JSON objects with _id. Fields are flexible — no schema enforcement by default (optional validation rules).',
    accessPatterns: [
      { pattern: 'Point lookup', operation: 'findOne', params: { filter: { _id: 'u1' } }, complexity: 'O(log n)', note: 'Primary key index' },
      { pattern: 'Filter query', operation: 'find', params: { filter: { category: 'laptops' } }, complexity: 'O(n) or O(log n)', note: 'With index: O(log n)' },
      { pattern: 'Nested field', operation: 'find', params: { filter: { 'address.city': 'Tokyo' } }, complexity: 'O(n)', note: 'Dot notation access' },
      { pattern: 'Aggregation', complexity: 'O(n)', note: 'Pipeline processes all docs through $match, $group, $sort, $project stages.' },
      { pattern: 'Array query', operation: 'find', params: { filter: { tags: 'admin' } }, complexity: 'O(n)', note: 'Array contains check' },
    ],
    whenToUse: ['Flexible/dynamic schema', 'Rapid prototyping', 'Content management', 'Real-time analytics', 'Mobile backends'],
    whenToAvoid: ['Need ACID across documents', 'Heavy JOIN requirements', 'Strict schema enforcement', 'Very large datasets with complex relationships'],
    storageEngine: 'WiredTiger (B-tree, document-level locking)',
    maxDataSize: 'Practical limit ~16 MB per document',
    consistencyModel: 'Tunable (read concern, write concern)',
    scalingModel: 'Horizontal (sharding), vertical (replica sets)',
    indexTypes: ['B-tree (default)', 'Hash', 'Geospatial', 'Text (full-text)', 'Wildcard', 'TTL'],
    sqlSupport: 'None — find, aggregate pipeline ($match, $group, $sort, $unwind, $lookup), insertOne, updateOne, deleteOne',
    realWorld: 'MongoDB at Forbes, Bosch, MetLife. 37,000+ customer deployments.',
  },
};

export default function Explorer() {
  const [engines, setEngines] = useState([]);
  const [activeEngine, setActiveEngine] = useState(null);
  const [schemas, setSchemas] = useState({});
  const [showTechnical, setShowTechnical] = useState(true);
  const [showAccess, setShowAccess] = useState(false);

  useEffect(() => {
    getEngines()
      .then(async e => {
        setEngines(e);
        setActiveEngine(e[0]);
        const s = {};
        for (const eng of e) { s[eng] = await getSchema(eng).catch(() => null); }
        setSchemas(s);
      })
      .catch(() => setServerError(true));
  }, []);

  const detail = ENGINE_DETAILS[activeEngine] || {};
  const Icon = detail.icon || Database;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Schema Explorer</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-[48px]">How data is organized, stored, and accessed in each database type.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="section-title mb-3">Database Engines</h3>
            <div className="space-y-1">
              {engines.map(e => {
                const d = ENGINE_DETAILS[e] || {};
                const EIcon = d.icon || Database;
                return (
                  <button
                    key={e}
                    onClick={() => setActiveEngine(e)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition-colors ${
                      activeEngine === e ? 'bg-blue-600/15 text-blue-400' : 'text-gray-400 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded ${d.color || 'bg-gray-600'} flex items-center justify-center`}>
                      <EIcon className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <span className="font-medium text-xs">{e}</span>
                      <span className="block text-[10px] text-gray-600">{d.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick facts */}
          {detail && (
            <div className="card">
              <h3 className="section-title mb-3">Quick Facts</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Storage</span><span className="text-gray-300 text-right">{detail.storageEngine?.split(' ')[0]}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Consistency</span><span className="text-gray-300 text-right">{detail.consistencyModel}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Scaling</span><span className="text-gray-300 text-right">{detail.scalingModel}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">SQL Support</span><span className="text-gray-300 text-right">{detail.sqlSupport?.split(' ')[0]}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Max Size</span><span className="text-gray-300 text-right text-[10px]">{detail.maxDataSize?.split(',')[0]}</span></div>
              </div>
            </div>
          )}

          {/* When to use */}
          {detail.whenToUse && (
            <div className="card">
              <h3 className="section-title mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green-400" /> Use When
              </h3>
              <ul className="space-y-1.5">
                {detail.whenToUse.map((item, i) => (
                  <li key={i} className="text-[11px] text-gray-400 flex gap-2">
                    <span className="text-green-500 mt-0.5">+</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When to avoid */}
          {detail.whenToAvoid && (
            <div className="card">
              <h3 className="section-title mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> Avoid When
              </h3>
              <ul className="space-y-1.5">
                {detail.whenToAvoid.map((item, i) => (
                  <li key={i} className="text-[11px] text-gray-400 flex gap-2">
                    <span className="text-red-500 mt-0.5">-</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header card */}
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${detail.color || 'bg-gray-600'} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{detail.title}</h2>
                <span className="text-xs text-gray-500">{detail.label} Database</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{detail.description}</p>

            {/* How data is stored */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 mb-4">
              <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-gray-400" /> How Data Is Stored
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">{detail.howDataIsStored}</p>
            </div>

            {/* Schema pattern */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 mb-4">
              <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Schema Pattern
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">{detail.schemaPattern}</p>
            </div>

            {/* Real world */}
            {detail.realWorld && (
              <div className="bg-green-600/5 border border-green-600/20 rounded-lg p-3">
                <p className="text-xs text-green-400 leading-relaxed">{detail.realWorld}</p>
              </div>
            )}
          </div>

          {/* Schema structure */}
          <div className="card">
            <h3 className="section-title mb-3">Schema Structure</h3>
            {schemas[activeEngine] && <SchemaViewer schema={schemas[activeEngine]} engine={activeEngine} detailed />}
          </div>

          {/* Access patterns */}
          {detail.accessPatterns && (
            <div className="card">
              <button
                onClick={() => setShowAccess(!showAccess)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="section-title flex items-center gap-2">
                  <Gauge className="w-3 h-3" /> Data Access Patterns & Complexity
                </h3>
                {showAccess ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {showAccess && (
                <div className="mt-3 space-y-2">
                  {detail.accessPatterns.map((p, i) => (
                    <div key={i} className="bg-gray-800/30 rounded-lg p-3 border border-gray-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-200">{p.pattern}</span>
                        <span className="text-[10px] bg-blue-600/15 text-blue-400 px-2 py-0.5 rounded font-mono">{p.complexity}</span>
                      </div>
                      {p.sql && <div className="code-block text-[11px] text-green-400 mb-1.5">{p.sql}</div>}
                      {p.operation && (
                        <div className="code-block text-[11px] text-gray-400 mb-1.5">
                          <span className="text-purple-400">operation</span>: "{p.operation}"
                          {p.params && <>, <span className="text-amber-400">params</span>: {JSON.stringify(p.params)}</>}
                        </div>
                      )}
                      <p className="text-[11px] text-gray-500">{p.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Index types */}
          {detail.indexTypes && (
            <div className="card">
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="section-title flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Index Types & Technical Details
                </h3>
                {showTechnical ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {showTechnical && (
                <div className="mt-3 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-400">Supported Index Types</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {detail.indexTypes.map((idx, i) => (
                        <span key={i} className="text-[11px] bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700/50">{idx}</span>
                      ))}
                    </div>
                  </div>
                  {detail.storageEngine && (
                    <div className="flex items-start gap-3 text-xs">
                      <span className="text-gray-500 shrink-0 w-20">Storage:</span>
                      <span className="text-gray-300">{detail.storageEngine}</span>
                    </div>
                  )}
                  {detail.consistencyModel && (
                    <div className="flex items-start gap-3 text-xs">
                      <span className="text-gray-500 shrink-0 w-20">Consistency:</span>
                      <span className="text-gray-300">{detail.consistencyModel}</span>
                    </div>
                  )}
                  {detail.scalingModel && (
                    <div className="flex items-start gap-3 text-xs">
                      <span className="text-gray-500 shrink-0 w-20">Scaling:</span>
                      <span className="text-gray-300">{detail.scalingModel}</span>
                    </div>
                  )}
                  {detail.maxDataSize && (
                    <div className="flex items-start gap-3 text-xs">
                      <span className="text-gray-500 shrink-0 w-20">Max Size:</span>
                      <span className="text-gray-300">{detail.maxDataSize}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
