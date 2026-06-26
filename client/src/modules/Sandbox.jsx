import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal, Play, Loader2, RotateCcw, Database, Lightbulb, BookOpen, History, X } from 'lucide-react';
import { getEngines, getEngineInfo, getSchema, executeQuery, resetEngine } from '../utils/api';
import QueryResult from '../components/QueryResult';
import SchemaViewer from '../components/SchemaViewer';

const ENGINE_INFO = {
  sqlite: {
    description: 'SQLite is the most widely deployed database engine. Serverless, zero-configuration, full SQL support.',
    howItWorks: 'Data stored in a single .db file using B-tree indexes. WAL mode enables concurrent reads during writes.',
    tip: 'Try JOINs, GROUP BY, subqueries, and window functions. SQLite supports 95% of SQL standard.',
    placeholder: 'SELECT * FROM users WHERE id > 1',
    color: 'bg-blue-600',
  },
  mongodb: {
    description: 'MongoDB stores data as JSON-like documents. Flexible schema, rich query language, aggregation pipeline.',
    howItWorks: 'Documents in collections with unique _id. Aggregation pipeline transforms data through $match → $group → $sort stages.',
    tip: 'Use dot notation for nested fields: "address.city". Arrays are first-class: { tags: "admin" } finds docs with "admin" in tags.',
    placeholder: '{"operation": "find", "params": {"collection": "users"}}',
    color: 'bg-green-600',
  },
  level: {
    description: 'LevelDB is Google\'s fast key-value storage library. Ordered mapping from string keys to string values.',
    howItWorks: 'LSM-tree: writes go to in-memory memtable, flushed to sorted SSTable files on disk. Compaction merges SSTables periodically.',
    tip: 'Use prefix scans to list related keys. Keys are sorted lexicographically: "user:1" before "user:2".',
    placeholder: '{"operation": "get", "params": {"key": "user:1"}}',
    color: 'bg-red-600',
  },
  graph: {
    description: 'In-memory graph database simulating Neo4j. Nodes and edges with properties.',
    howItWorks: 'Nodes have IDs, types, properties. Edges connect nodes with types and properties. BFS/DFS traverse by following edges.',
    tip: 'Try different starting nodes and depths. The graph visualizer shows network structure.',
    placeholder: '{"operation": "bfs", "params": {"from": "alice", "depth": 2}}',
    color: 'bg-purple-600',
  },
  timeseries: {
    description: 'Time-series database for metrics, events, and IoT. Optimized for timestamped writes and range queries.',
    howItWorks: 'Measurements with timestamps, values, tags. Range queries, aggregations, downsampling built in.',
    tip: 'Try different aggregate functions (avg, sum, min, max, count) and time ranges.',
    placeholder: '{"operation": "list_metrics", "params": {}}',
    color: 'bg-amber-600',
  },
  vector: {
    description: 'Vector database for high-dimensional embeddings. Semantic search and similarity matching.',
    howItWorks: 'Stores vectors (arrays of floats) with metadata. Cosine similarity measures closeness. Lower dimension = faster search.',
    tip: 'Compare text search vs vector similarity. Text matches keywords; vector matches meaning.',
    placeholder: '{"operation": "search_by_text", "params": {"query": "database"}}',
    color: 'bg-pink-600',
  },
};

const ENGINE_PRESETS = {
  sqlite: [
    { label: 'All Users', sql: 'SELECT * FROM users' },
    { label: 'Products + Categories', sql: "SELECT p.name, p.price, c.name as category FROM products p JOIN categories c ON p.category_id = c.id" },
    { label: 'User Orders', sql: "SELECT u.name, o.total, o.status FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.total DESC" },
    { label: 'Revenue by Category', sql: "SELECT c.name, SUM(oi.price * oi.quantity) as revenue FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN categories c ON p.category_id = c.id GROUP BY c.name ORDER BY revenue DESC" },
    { label: 'Users without orders', sql: "SELECT u.name FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE o.id IS NULL" },
    { label: 'Window function', sql: "SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) as rank FROM users u JOIN orders o ON u.id = o.user_id" },
  ],
  mongodb: [
    { label: 'Find all users', operation: 'find', params: { collection: 'users' } },
    { label: 'Find laptops', operation: 'find', params: { collection: 'products', filter: { category: 'laptops' } } },
    { label: 'Users in Tokyo', operation: 'find', params: { collection: 'users', filter: { 'address.city': 'Tokyo' } } },
    { label: 'Orders by status', operation: 'aggregate', params: { collection: 'orders', pipeline: [{ $group: { _id: '$status', count: { $count: {} }, total: { $sum: '$amount' } } }] } },
    { label: 'Unwind items', operation: 'aggregate', params: { collection: 'orders', pipeline: [{ $unwind: '$items' }, { $group: { _id: '$items.name', qty: { $sum: '$items.qty' } } }] } },
    { label: 'Insert product', operation: 'insertOne', params: { collection: 'products', doc: { name: 'Webcam', category: 'accessories', price: 79.99 } } },
  ],
  level: [
    { label: 'List All', operation: 'list', params: {} },
    { label: 'Get User', operation: 'get', params: { key: 'user:1' } },
    { label: 'Sessions', operation: 'list', params: { prefix: 'session:' } },
    { label: 'All Cache Keys', operation: 'list', params: { prefix: 'cache:' } },
    { label: 'Count', operation: 'count', params: {} },
  ],
  graph: [
    { label: 'BFS from Alice', operation: 'bfs', params: { from: 'alice', depth: 2 } },
    { label: 'Shortest Path', operation: 'shortest_path', params: { from: 'alice', to: 'charlie' } },
    { label: 'Neighbors', operation: 'neighbors', params: { node: 'alice' } },
    { label: 'Find People', operation: 'search', params: { query: 'person' } },
    { label: 'Find Skills', operation: 'search', params: { query: 'javascript' } },
  ],
  timeseries: [
    { label: 'List Metrics', operation: 'list_metrics', params: {} },
    { label: 'CPU 24h', operation: 'range', params: { metric: 'cpu_usage', from: Date.now() - 86400000, to: Date.now() } },
    { label: 'Avg CPU (7d)', operation: 'aggregate', params: { metric: 'cpu_usage', from: Date.now() - 7 * 86400000, to: Date.now(), func: 'avg' } },
    { label: 'Downsample Daily', operation: 'downsample', params: { metric: 'requests', from: Date.now() - 7 * 86400000, to: Date.now(), every: 86400000 } },
  ],
  vector: [
    { label: 'All Vectors', operation: 'list', params: {} },
    { label: 'Search: "database SQL"', operation: 'search_by_text', params: { query: 'database SQL' } },
    { label: 'Search: "machine learning"', operation: 'search_by_text', params: { query: 'machine learning neural' } },
    { label: 'Vector Similarity', operation: 'search', params: { vector: [0.9, 0.1, 0.8, 0.2, 0.5, 0.3], topK: 3 } },
  ],
};

export default function Sandbox() {
  const { engine: urlEngine } = useParams();
  const navigate = useNavigate();
  const [engines, setEngines] = useState([]);
  const [activeEngine, setActiveEngine] = useState(urlEngine || 'sqlite');
  const [info, setInfo] = useState(null);
  const [schema, setSchema] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('db-explorer-history') || '[]'); } catch { return []; }
  });

  useEffect(() => { getEngines().then(setEngines); }, []);
  useEffect(() => { if (urlEngine) setActiveEngine(urlEngine); }, [urlEngine]);
  useEffect(() => {
    if (!activeEngine) return;
    Promise.all([getEngineInfo(activeEngine), getSchema(activeEngine)])
      .then(([i, s]) => { setInfo(i); setSchema(s); });
    setResults(null); setQuery('');
  }, [activeEngine]);

  async function runQuery() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const parsed = tryParseQuery(query);
      const res = await executeQuery(activeEngine, parsed.operation || parsed.sql, parsed.params);
      setResults(res);
      addToHistory(activeEngine, query, res);
    } catch (err) { setResults({ error: err.message }); }
    setLoading(false);
  }

  function tryParseQuery(input) {
    if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(input)) return { sql: input };
    try {
      const obj = JSON.parse(input);
      return { operation: obj.operation || obj.query, params: obj.params };
    } catch { return { operation: input }; }
  }

  async function handleReset() {
    setResetting(true); await resetEngine(activeEngine); setResetting(false); setResults(null);
  }

  function runPreset(p) {
    if (p.sql) setQuery(p.sql);
    else setQuery(JSON.stringify({ operation: p.operation, params: p.params }, null, 2));
    setLoading(true);
    executeQuery(activeEngine, p.operation || p.sql, p.params)
      .then(r => { setResults(r); addToHistory(activeEngine, p.sql || JSON.stringify({ operation: p.operation, params: p.params }), r); })
      .catch(e => setResults({ error: e.message }))
      .finally(() => setLoading(false));
  }

  function addToHistory(eng, q, res) {
    const entry = { engine: eng, query: q, duration: res?.duration, rowCount: res?.rowCount || res?.count, ts: Date.now() };
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem('db-explorer-history', JSON.stringify(next));
  }

  function clearHistory() { setHistory([]); localStorage.removeItem('db-explorer-history'); }

  const presets = ENGINE_PRESETS[activeEngine] || ENGINE_PRESETS.sqlite;
  const engineStyle = ENGINE_INFO[activeEngine] || ENGINE_INFO.sqlite;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <div className={`w-9 h-9 rounded-lg ${engineStyle.color} flex items-center justify-center`}>
          <Terminal className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Query Sandbox</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-[48px]">Write and run queries against any database engine.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Engines */}
          <div className="card">
            <h3 className="section-title mb-3">Engine</h3>
            <div className="space-y-1">
              {engines.map(e => {
                const s = ENGINE_INFO[e] || {};
                return (
                  <button
                    key={e}
                    onClick={() => { setActiveEngine(e); navigate(`/sandbox/${e}`); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-colors ${
                      activeEngine === e ? 'bg-blue-600/15 text-blue-400' : 'text-gray-400 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${s.color || 'bg-gray-500'}`} />
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

          {/* How it works */}
          {engineStyle && (
            <div className="card">
              <h3 className="section-title mb-2">How it works</h3>
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">{engineStyle.howItWorks}</p>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium mb-1">
                  <Lightbulb className="w-3 h-3" /> Pro tip
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{engineStyle.tip}</p>
              </div>
            </div>
          )}

          {/* Schema */}
          {schema && (
            <div className="card">
              <h3 className="section-title mb-3 flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> Schema
              </h3>
              <SchemaViewer schema={schema} engine={activeEngine} />
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="section-title flex items-center gap-2">
                  <History className="w-3 h-3" /> History
                </h3>
                <button onClick={clearHistory} className="text-[10px] text-gray-600 hover:text-gray-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {history.slice(0, 8).map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(h.query)}
                    className="w-full text-left text-[11px] text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800/60 font-mono truncate transition-colors"
                  >
                    {h.query.slice(0, 40)}{h.query.length > 40 ? '...' : ''}
                    {h.duration !== undefined && <span className="text-gray-700 ml-1">({h.duration}ms)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main */}
        <div className="lg:col-span-3 space-y-4">
          {/* Presets */}
          <div className="card">
            <h3 className="section-title mb-3">Quick Queries</h3>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => runPreset(p)}
                  className="px-3 py-1.5 bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg text-xs transition-colors border border-gray-800"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Query</h3>
              <button onClick={handleReset} disabled={resetting} className="btn-danger text-xs flex items-center gap-1.5 py-1 px-2.5">
                <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
                Reset
              </button>
            </div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runQuery(); }}
              placeholder={engineStyle?.placeholder || 'Enter query...'}
              className="input w-full h-32 font-mono text-sm resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-gray-600">Ctrl+Enter to run</span>
              <button onClick={runQuery} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Query
              </button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="card">
              <h3 className="section-title mb-3">Results</h3>
              <QueryResult data={results} engine={activeEngine} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
