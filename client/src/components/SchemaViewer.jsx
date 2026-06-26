import { useState } from 'react';
import { ChevronRight, ChevronDown, Table, Columns3, Key, Hash, ArrowRight, ExternalLink } from 'lucide-react';

const SAMPLE_QUERIES = {
  users: [
    { label: 'All users', sql: 'SELECT * FROM users' },
    { label: 'User by ID', sql: 'SELECT * FROM users WHERE id = 1' },
    { label: 'User count', sql: 'SELECT COUNT(*) as total FROM users' },
  ],
  products: [
    { label: 'All products', sql: 'SELECT * FROM products' },
    { label: 'Expensive items', sql: 'SELECT name, price FROM products WHERE price > 50' },
    { label: 'Products per category', sql: 'SELECT category_id, COUNT(*) as cnt FROM products GROUP BY category_id' },
  ],
  orders: [
    { label: 'All orders', sql: 'SELECT * FROM orders' },
    { label: 'Pending orders', sql: "SELECT * FROM orders WHERE status = 'pending'" },
    { label: 'Order totals', sql: 'SELECT user_id, SUM(total) as spent FROM orders GROUP BY user_id' },
  ],
  order_items: [
    { label: 'All items', sql: 'SELECT * FROM order_items' },
    { label: 'Items per order', sql: 'SELECT order_id, COUNT(*) as items FROM order_items GROUP BY order_id' },
  ],
  categories: [
    { label: 'All categories', sql: 'SELECT * FROM categories' },
  ],
};

const MONGO_SAMPLE_QUERIES = {
  users: [
    { label: 'All users', operation: 'find', params: { collection: 'users' } },
    { label: 'Users in Tokyo', operation: 'find', params: { collection: 'users', filter: { 'address.city': 'Tokyo' } } },
    { label: 'Admin users', operation: 'find', params: { collection: 'users', filter: { tags: 'admin' } } },
  ],
  products: [
    { label: 'All products', operation: 'find', params: { collection: 'products' } },
    { label: 'Laptops', operation: 'find', params: { collection: 'products', filter: { category: 'laptops' } } },
    { label: 'Products > $100', operation: 'find', params: { collection: 'products', filter: { price: { $gt: 100 } } } },
  ],
  orders: [
    { label: 'All orders', operation: 'find', params: { collection: 'orders' } },
    { label: 'Completed orders', operation: 'find', params: { collection: 'orders', filter: { status: 'completed' } } },
    { label: 'Orders by status', operation: 'aggregate', params: { collection: 'orders', pipeline: [{ $group: { _id: '$status', count: { $count: {} } } }] } },
  ],
};

const RELATIONAL_TIPS = {
  users: 'Primary key: id (auto-increment). Email has UNIQUE constraint. Created_at defaults to current time.',
  products: 'Foreign key: category_id → categories(id). Price has CHECK constraint (must be > 0). Stock defaults to 0.',
  orders: 'Foreign key: user_id → users(id). Status defaults to "pending". Total is the order sum.',
  order_items: 'Composite foreign keys: order_id → orders(id), product_id → products(id). Stores the price at time of purchase (snapshot).',
  categories: 'Simple lookup table. Referenced by products.category_id.',
};

const GRAPH_TIPS = {
  nodes: 'Each node has a unique ID, a type (label), and properties (key-value pairs). Types: Person, Project, City, Skill.',
  edges: 'Each edge has a source, target, type, and properties. Types: FRIENDS_WITH, WORKS_ON, LIVES_IN, KNOWS.',
  traversal: 'Follow edges from a starting node. BFS explores level by level. Depth controls how many hops to traverse.',
};

const TS_TIPS = {
  measurements: 'Each measurement is a time series: cpu_usage, memory_usage, requests, errors, latency. 168 data points each (7 days hourly).',
  tags: 'Tags are key-value pairs for dimensional queries. host=web-01, region=us-east. Tags are indexed for fast filtering.',
  retention: 'Old data can be automatically deleted. Production InfluxDB: keep 30 days of raw data, 1 year of downsampled data.',
};

const VECTOR_TIPS = {
  embeddings: 'Each vector is a 6-dimensional array (simplified). Real embeddings are 384-3072 dimensions from ML models like OpenAI.',
  similarity: 'Cosine similarity measures angle between vectors. Score of 1.0 = identical direction. 0.0 = orthogonal. -1.0 = opposite.',
  useCase: 'Semantic search: find documents similar in meaning. "Database" and "data store" have similar vectors even though words differ.',
};

const LEVEL_TIPS = {
  keys: 'Keys are strings sorted lexicographically. Convention: "type:id" — user:1, session:abc, cache:homepage.',
  values: 'Values can be any JSON. Strings, numbers, objects, arrays. No type constraints.',
  operations: 'Get (point lookup), Put (write), Delete, List (prefix scan), Count, Batch (atomic multi-key write).',
};

const TIPS = {
  sqlite: RELATIONAL_TIPS,
  mongodb: MONGO_SAMPLE_QUERIES,
  graph: GRAPH_TIPS,
  timeseries: TS_TIPS,
  vector: VECTOR_TIPS,
  level: LEVEL_TIPS,
};

export default function SchemaViewer({ schema, engine, detailed = false }) {
  const [expandedTable, setExpandedTable] = useState(detailed ? Object.keys(schema || {}) : []);
  const [showQueries, setShowQueries] = useState(false);
  const [showTips, setShowTips] = useState(detailed);

  if (!schema) return <div className="text-gray-500 text-sm">Loading schema...</div>;

  // Graph schema
  if (schema.nodeTypes) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-500 leading-relaxed">{schema.description}</p>
        <div>
          <span className="text-xs text-purple-400 font-medium">Node Types ({schema.nodeTypes.length})</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {schema.nodeTypes.map(t => (
              <span key={t} className="badge bg-purple-500/10 text-purple-400 border-purple-500/20">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs text-blue-400 font-medium">Edge Types ({schema.edgeTypes.length})</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {schema.edgeTypes.map(t => (
              <span key={t} className="badge bg-blue-500/10 text-blue-400 border-blue-500/20">{t}</span>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-600 font-mono">{schema.stats?.nodes} nodes • {schema.stats?.edges} edges</div>
        {detailed && GRAPH_TIPS && (
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800/50 mt-2">
            <span className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Graph modeling:</strong> Nouns become nodes, verbs become edges, adjectives become properties.
              Traversal follows edges directly — O(1) per hop, unlike SQL JOINs which are O(log n) each.
            </span>
          </div>
        )}
      </div>
    );
  }

  // Time-series schema
  if (schema.measurements) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 leading-relaxed">{schema.description}</p>
        {schema.measurements.map(m => (
          <div key={m.name} className="bg-gray-800/30 rounded-lg p-3 border border-gray-800/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-amber-400 font-mono font-medium">{m.name}</span>
              <span className="text-[10px] text-gray-600">{m.points} data points</span>
            </div>
            <div className="flex gap-1 mt-1.5">
              {m.tags?.map(t => (
                <span key={t} className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-700/50">tag: {t}</span>
              ))}
            </div>
            {detailed && TS_TIPS[m.name] && (
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{TS_TIPS[m.name]}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Vector schema
  if (schema.dimension !== undefined) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 leading-relaxed">{schema.description}</p>
        <div className="bg-gray-800/30 rounded-lg p-3 space-y-2 border border-gray-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Dimension</span>
            <span className="text-xs text-pink-400 font-mono font-medium">{schema.dimension}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Fields</span>
            <span className="text-xs text-gray-300">{schema.fields?.join(', ')}</span>
          </div>
        </div>
        {detailed && (
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800/50">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Each vector is an embedding — an array of numbers that captures semantic meaning.
              Similar concepts have similar vectors. Cosine similarity measures closeness:
              score 1.0 = identical, 0.0 = unrelated, -1.0 = opposite.
            </p>
          </div>
        )}
      </div>
    );
  }

  // MongoDB schema
  if (schema.collections && Array.isArray(schema.collections)) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 leading-relaxed">{schema.description}</p>
        {schema.collections.map(col => (
          <div key={col.name} className="border border-gray-800/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedTable(prev => prev.includes(col.name) ? prev.filter(n => n !== col.name) : [...prev, col.name])}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800/30 hover:bg-gray-800/50 transition-colors text-left"
            >
              {expandedTable.includes(col.name) ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
              <Table className="w-3.5 h-3.5 text-green-400" />
              <span className="text-sm font-mono text-gray-200">{col.name}</span>
              <span className="text-[10px] text-gray-600 ml-auto">{col.count} docs</span>
            </button>
            {expandedTable.includes(col.name) && (
              <div className="p-2 bg-gray-900/30">
                <div className="flex flex-wrap gap-1 mb-2">
                  {col.fields.map(f => (
                    <span key={f} className="text-[10px] bg-gray-800/60 text-gray-400 px-2 py-0.5 rounded font-mono">
                      {f === '_id' ? <span className="text-yellow-400">{f}</span> : f}
                    </span>
                  ))}
                </div>
                {detailed && MONGO_SAMPLE_QUERIES[col.name] && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-600">Sample queries:</span>
                    {MONGO_SAMPLE_QUERIES[col.name].map((q, i) => (
                      <div key={i} className="text-[10px] text-gray-500 font-mono pl-2 border-l border-gray-800">
                        {q.operation}({JSON.stringify(q.params.filter || {}).slice(1, -1)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Relational schema
  if (typeof schema === 'object' && !Array.isArray(schema)) {
    // Check if this is actually a relational schema (has tables with column arrays)
    // vs a simple description object (like LevelDB)
    const hasRealTables = Object.values(schema).some(v => Array.isArray(v));
    if (!hasRealTables) {
      // Simple schema description (LevelDB, etc.)
      return (
        <div className="space-y-3">
          {schema.description && (
            <p className="text-xs text-gray-500 leading-relaxed">{schema.description}</p>
          )}
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800/50">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Key-Value model:</strong> No enforced schema. Data is organized through key naming conventions.
              Keys are sorted strings; values can be any JSON. Logical grouping is done via key prefixes (user:*, session:*, cache:*).
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800/50">
            <span className="text-xs text-gray-400 font-medium">Common key patterns</span>
            <div className="mt-2 space-y-1.5">
              {[
                { pattern: 'user:{id}', desc: 'User profiles', example: 'user:1 → {name: "Alice"}' },
                { pattern: 'session:{token}', desc: 'Active sessions', example: 'session:abc123 → {userId: 1, expires: ...}' },
                { pattern: 'cache:{key}', desc: 'Cached data', example: 'cache:homepage → {data: ..., timestamp: ...}' },
                { pattern: 'counter:{name}', desc: 'Atomic counters', example: 'counter:pageviews → 1042' },
              ].map(p => (
                <div key={p.pattern} className="flex items-start gap-2 text-[11px]">
                  <code className="text-amber-400 font-mono shrink-0 w-28">{p.pattern}</code>
                  <span className="text-gray-500">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    const tables = Object.entries(schema);
    return (
      <div className="space-y-2">
        <div className="space-y-1.5">
          {tables.map(([name, columns]) => (
            <TableAccordion
              key={name}
              name={name}
              columns={columns}
              detailed={detailed}
              isOpen={expandedTable.includes(name)}
              onToggle={() => setExpandedTable(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])}
              tip={RELATIONAL_TIPS?.[name]}
              sampleQueries={SAMPLE_QUERIES?.[name]}
            />
          ))}
        </div>
        {detailed && (
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800/50">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Normalization:</strong> Data is organized to reduce redundancy.
              Each table stores one entity type. Foreign keys reference other tables. JOINs combine data at query time.
              This ensures data consistency but requires more complex queries.
            </p>
          </div>
        )}
      </div>
    );
  }

  return <pre className="text-xs text-gray-400 font-mono">{JSON.stringify(schema, null, 2)}</pre>;
}

function TableAccordion({ name, columns, detailed, isOpen, onToggle, tip, sampleQueries }) {
  const pkCount = columns.filter(c => c.pk === 1).length;
  const fkCount = columns.filter(c => c.type?.includes('REFERENCES') || c.fk).length;

  return (
    <div className="border border-gray-800/50 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800/30 hover:bg-gray-800/50 transition-colors text-left"
      >
        {isOpen ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
        <Table className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-sm font-mono text-gray-200">{name}</span>
        <span className="text-[10px] text-gray-600">{columns.length} cols</span>
        {pkCount > 0 && <span className="text-[9px] text-yellow-500">{pkCount} PK</span>}
        <span className="ml-auto" />
      </button>
      {isOpen && (
        <div className="p-2 space-y-0.5 bg-gray-900/30">
          {columns.map(col => (
            <div key={col.name} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-800/30 rounded transition-colors">
              <Columns3 className="w-3 h-3 text-gray-600" />
              <span className="font-mono text-gray-300 w-28 text-[11px]">{col.name}</span>
              <span className="text-gray-600 text-[10px] uppercase tracking-wider w-16">{col.type}</span>
              {col.pk === 1 && (
                <span className="badge bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[9px] py-0">
                  <Key className="w-2.5 h-2.5" /> PK
                </span>
              )}
              {col.notnull === 1 && (
                <span className="text-[9px] text-red-400/70">NOT NULL</span>
              )}
              {col.dflt_value && (
                <span className="text-[9px] text-gray-600">DEFAULT {col.dflt_value}</span>
              )}
            </div>
          ))}
          {tip && (
            <div className="mt-2 px-3 py-2 bg-gray-800/20 rounded text-[11px] text-gray-500 border-l-2 border-blue-500/30">
              {tip}
            </div>
          )}
          {sampleQueries && detailed && (
            <div className="mt-2 px-3 py-2 bg-gray-800/20 rounded">
              <span className="text-[10px] text-gray-600 block mb-1">Try these queries:</span>
              {sampleQueries.map((q, i) => (
                <div key={i} className="text-[10px] text-blue-400 font-mono flex items-center gap-1 py-0.5">
                  <ChevronRight className="w-2.5 h-2.5" />
                  {q.label}: <span className="text-green-400/70">{q.sql?.slice(0, 50)}{q.sql?.length > 50 ? '...' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
