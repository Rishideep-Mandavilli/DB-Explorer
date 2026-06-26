import { useState } from 'react';
import { GitCompare, Play, Loader2, Lightbulb, Clock, BarChart3, Zap, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { executeQuery } from '../utils/api';
import QueryResult from '../components/QueryResult';

const SCENARIOS = [
  {
    id: 'user-lookup',
    title: 'User Profile Lookup',
    description: 'Find a user by ID — the most basic access pattern.',
    insight: 'Key-value stores give O(1) lookups, but relational databases give you JOINs. If you only need get-by-ID, KV is faster. If you need "user + orders + preferences", relational is better.',
    decisionGuide: { bestChoice: 'Key-Value for simple lookups, Relational for complex queries', tradeoff: 'KV: fast but limited. SQL: flexible but slower per-query.' },
    queries: [
      { engine: 'sqlite', sql: "SELECT * FROM users WHERE id = 1", label: 'SQLite (SQL)', why: 'Full row with JOIN capability' },
      { engine: 'level', operation: 'get', params: { key: 'user:1' }, label: 'LevelDB (KV)', why: 'O(1) direct lookup' },
    ],
  },
  {
    id: 'social-graph',
    title: 'Social Graph Traversal',
    description: 'Find friends-of-friends — relationship traversal.',
    insight: 'Graph databases store relationships as first-class citizens. Traversal is O(k) where k is connections found. In SQL, 3-hop relationships require recursive CTEs — O(n²) or worse.',
    decisionGuide: { bestChoice: 'Graph for deep traversal, SQL for simple relationships', tradeoff: 'Graph: O(1) per hop. SQL: O(log n) per JOIN, compounds with depth.' },
    queries: [
      { engine: 'graph', operation: 'bfs', params: { from: 'alice', depth: 2 }, label: 'Graph BFS', why: 'Follows edges directly' },
      { engine: 'sqlite', sql: "SELECT u2.name FROM users u1 JOIN orders o ON u1.id = o.user_id JOIN users u2 ON u2.id != u1.id LIMIT 5", label: 'SQL JOINs', why: 'Requires multiple JOINs' },
    ],
  },
  {
    id: 'metrics',
    title: 'Time-Range Aggregation',
    description: 'Analyze metrics over a time window.',
    insight: 'Time-series databases partition data by time. Range queries hit only the relevant partition — O(1). In SQL, every row must be scanned — O(n).',
    decisionGuide: { bestChoice: 'Time-series for temporal data, SQL for small datasets', tradeoff: 'TSDB: optimized for time ranges. SQL: general purpose but slower at scale.' },
    queries: [
      { engine: 'timeseries', operation: 'aggregate', params: { metric: 'cpu_usage', from: Date.now() - 86400000, to: Date.now(), func: 'avg' }, label: 'TSDB avg', why: 'Time partition pruning' },
      { engine: 'timeseries', operation: 'downsample', params: { metric: 'requests', from: Date.now() - 7 * 86400000, to: Date.now(), every: 86400000 }, label: 'TSDB downsample', why: 'Built-in resolution reduction' },
    ],
  },
  {
      id: 'semantic-search',
    title: 'Semantic Search',
    description: 'Find documents by meaning, not just keywords.',
    insight: 'Keyword search matches exact words. Vector search matches meaning through embeddings. "Exception handling" and "error handling" have similar vectors.',
    decisionGuide: { bestChoice: 'Vector for meaning, keyword for exact matches', tradeoff: 'Vector: finds related concepts. Keyword: precise but misses synonyms.' },
    queries: [
      { engine: 'vector', operation: 'search_by_text', params: { query: 'database SQL storage' }, label: 'Keyword match', why: 'Word overlap scoring' },
      { engine: 'vector', operation: 'search', params: { vector: [0.9, 0.1, 0.8, 0.2, 0.5, 0.3], topK: 3 }, label: 'Vector similarity', why: 'Cosine similarity ranking' },
    ],
  },
  {
    id: 'caching',
    title: 'Cache / Session Store',
    description: 'High-speed data retrieval on every request.',
    insight: 'Sessions are read-heavy. KV stores in-memory (Redis) give sub-millisecond reads. SQL overhead adds 1-5ms per query.',
    decisionGuide: { bestChoice: 'KV for hot data, SQL for persistent storage', tradeoff: 'KV: blazing fast but no complex queries. SQL: slower but full query power.' },
    queries: [
      { engine: 'level', operation: 'get', params: { key: 'session:abc123' }, label: 'KV session', why: 'Sub-ms read' },
      { engine: 'level', operation: 'get', params: { key: 'cache:homepage' }, label: 'KV cache', why: 'TTL-based expiry' },
    ],
  },
  {
    id: 'document-flexibility',
    title: 'Flexible Schema',
    description: 'Store varying product attributes without schema changes.',
    insight: 'Relational databases require ALTER TABLE for new columns. Document databases accept any fields — laptops have RAM specs, books have ISBNs, no schema migration needed.',
    decisionGuide: { bestChoice: 'Document for evolving schemas, SQL for stable schemas', tradeoff: 'Document: flexible but no JOINs. SQL: rigid but consistent.' },
    queries: [
      { engine: 'mongodb', operation: 'find', params: { collection: 'products', filter: { category: 'laptops' } }, label: 'MongoDB laptops', why: 'Flexible nested fields' },
      { engine: 'mongodb', operation: 'find', params: { collection: 'users', filter: { tags: 'admin' } }, label: 'MongoDB admins', why: 'Array field queries' },
    ],
  },
  {
    id: 'aggregation',
    title: 'Complex Aggregation',
    description: 'Group, count, and summarize data across collections.',
    insight: 'MongoDB aggregation pipelines are more expressive than SQL GROUP BY. They support $unwind (flatten arrays), $lookup (JOINs), and $project (reshape).',
    decisionGuide: { bestChoice: 'MongoDB for nested data aggregation, SQL for flat data', tradeoff: 'MongoDB: pipeline stages compose. SQL: GROUP BY + HAVING.' },
    queries: [
      { engine: 'mongodb', operation: 'aggregate', params: { collection: 'orders', pipeline: [{ $group: { _id: '$status', count: { $count: {} }, total: { $sum: '$amount' } } }] }, label: 'MongoDB pipeline', why: 'Composable pipeline stages' },
      { engine: 'sqlite', sql: "SELECT status, COUNT(*) as cnt, SUM(total) as revenue FROM orders GROUP BY status", label: 'SQL GROUP BY', why: 'Classic aggregation' },
    ],
  },
  {
    id: 'relationship-traversal',
    title: 'Graph vs SQL Paths',
    description: 'Find shortest paths and connections.',
    insight: 'In SQL, finding "shortest path between two users" requires recursive CTEs. In a graph database, it\'s a single built-in function — the graph IS the relationships.',
    decisionGuide: { bestChoice: 'Graph for path queries, SQL for flat relationships', tradeoff: 'Graph: native path algorithms. SQL: manual recursive traversal.' },
    queries: [
      { engine: 'graph', operation: 'shortest_path', params: { from: 'alice', to: 'charlie' }, label: 'Graph shortest path', why: 'Built-in BFS' },
      { engine: 'graph', operation: 'neighbors', params: { node: 'alice' }, label: 'Graph neighbors', why: 'O(1) adjacency access' },
    ],
  },
  {
    id: 'multi-dimension',
    title: 'Multi-Dimensional Filtering',
    description: 'Filter by multiple attributes simultaneously.',
    insight: 'Document databases handle nested filtering natively. Relational needs JOINs or composite indexes. Time-series uses tags for dimensional filtering.',
    decisionGuide: { bestChoice: 'Match the filter pattern to the database strength', tradeoff: 'Document: flexible filters. SQL: structured filters. TSDB: tag-based.' },
    queries: [
      { engine: 'mongodb', operation: 'find', params: { collection: 'products', filter: { category: 'laptops', price: { $gt: 100 } } }, label: 'MongoDB filter', why: 'Nested field filtering' },
      { engine: 'sqlite', sql: "SELECT p.name, p.price, c.name as cat FROM products p JOIN categories c ON p.category_id = c.id WHERE p.price > 50", label: 'SQL JOIN+filter', why: 'JOIN + WHERE' },
      { engine: 'timeseries', operation: 'range', params: { metric: 'cpu_usage', from: Date.now() - 3600000, to: Date.now() }, label: 'TSDB range', why: 'Time-range filter' },
    ],
  },
  {
    id: 'write-patterns',
    title: 'Write Patterns Compared',
    description: 'How different databases handle writes.',
    insight: 'SQL writes require parsing + locking. KV writes are O(1) appends. Document writes are flexible. Graph writes must maintain edge consistency.',
    decisionGuide: { bestChoice: 'Match write pattern to database architecture', tradeoff: 'KV/TSDB: fastest writes. SQL: safest writes. Document: flexible writes.' },
    queries: [
      { engine: 'sqlite', sql: "INSERT INTO users (name, email) VALUES ('Test', 'test@example.com')", label: 'SQL INSERT', why: 'Parsed, locked, logged' },
      { engine: 'mongodb', operation: 'insertOne', params: { collection: 'users', doc: { name: 'Test', email: 'test@example.com' } }, label: 'Mongo insert', why: 'Document-level locking' },
      { engine: 'timeseries', operation: 'write', params: { metric: 'cpu_usage', value: 45.2, tags: { host: 'test' } }, label: 'TSDB write', why: 'Append-only, no locks' },
    ],
  },
];

export default function Compare() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [runAll, setRunAll] = useState(false);

  async function runComparison(scenario) {
    setActiveScenario(scenario);
    setResults({});
    for (const q of scenario.queries) {
      setLoading(q.label);
      try {
        const res = await executeQuery(q.engine, q.operation || q.sql, q.params);
        setResults(prev => ({ ...prev, [q.label]: res }));
      } catch (err) {
        if (err.message.includes('not available')) setServerError(true);
        setResults(prev => ({ ...prev, [q.label]: { error: err.message } }));
      }
      setLoading(null);
    }
  }

  async function runAllQueries() {
    setRunAll(true);
    await runComparison(activeScenario);
    setRunAll(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center">
          <GitCompare className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Compare Databases</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-[48px]">Same problem, different solutions. Run queries, compare timing, understand trade-offs.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Scenario list */}
        <div className="space-y-1.5">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => runComparison(s)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeScenario.id === s.id ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-800/60 border border-transparent'
              }`}
            >
              <span className="font-medium text-xs">{s.title}</span>
              <span className="block text-[11px] text-gray-600 mt-0.5">{s.description}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">{activeScenario.title}</h2>
              <p className="text-gray-400 text-sm">{activeScenario.description}</p>
            </div>
            <button
              onClick={runAllQueries}
              disabled={runAll}
              className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 shrink-0 ml-4"
            >
              {runAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run All
            </button>
          </div>

          {/* Insight */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1.5">
              <Lightbulb className="w-4 h-4" /> Why this matters
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{activeScenario.insight}</p>
          </div>

          {/* Decision guide */}
          {activeScenario.decisionGuide && (
            <div>
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors mb-2"
              >
                {showGuide ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                Decision guide — when to choose which
              </button>
              {showGuide && (
                <div className="bg-green-600/5 border border-green-600/20 rounded-lg p-4 space-y-2">
                  <div className="flex gap-3 text-xs">
                    <span className="text-gray-500 shrink-0 w-24">Best choice:</span>
                    <span className="text-green-400">{activeScenario.decisionGuide.bestChoice}</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-gray-500 shrink-0 w-24">Tradeoff:</span>
                    <span className="text-gray-400">{activeScenario.decisionGuide.tradeoff}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Query results */}
          <div className="space-y-3">
            {activeScenario.queries.map(q => (
              <div key={q.label} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200">{q.label}</span>
                    <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded font-mono">{q.engine}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {results[q.label]?.duration !== undefined && (
                      <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {results[q.label].duration}ms
                      </span>
                    )}
                    <button
                      onClick={() => runComparison({ ...activeScenario, queries: [q] })}
                      disabled={loading === q.label}
                      className="btn-primary text-xs flex items-center gap-1.5 py-1 px-2.5"
                    >
                      {loading === q.label ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      Run
                    </button>
                  </div>
                </div>
                {q.why && <p className="text-[11px] text-gray-500 mb-2">{q.why}</p>}
                <div className="code-block text-xs text-gray-400 mb-2">
                  {q.sql || JSON.stringify({ operation: q.operation, params: q.params }, null, 2)}
                </div>
                {results[q.label] && <QueryResult data={results[q.label]} engine={q.engine} compact />}
              </div>
            ))}
          </div>

          {/* Timing comparison */}
          {Object.keys(results).length > 1 && (
            <TimingComparison results={results} queries={activeScenario.queries} />
          )}
        </div>
      </div>
    </div>
  );
}

function TimingComparison({ results, queries }) {
  const timings = queries
    .filter(q => results[q.label]?.duration !== undefined)
    .map(q => ({ label: q.label, engine: q.engine, duration: results[q.label].duration }));

  if (timings.length < 2) return null;

  const maxDuration = Math.max(...timings.map(t => t.duration));

  return (
    <div className="card">
      <h3 className="section-title mb-3 flex items-center gap-2">
        <BarChart3 className="w-3 h-3" /> Performance Comparison
      </h3>
      <div className="space-y-2">
        {timings.sort((a, b) => a.duration - b.duration).map(t => (
          <div key={t.label} className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 w-32 truncate">{t.label}</span>
            <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
              <div
                className={`h-full rounded ${t.duration === maxDuration && timings.length > 1 ? 'bg-amber-600/60' : 'bg-blue-600/60'}`}
                style={{ width: `${Math.max(5, (t.duration / maxDuration) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 font-mono w-16 text-right">{t.duration}ms</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-600 mt-2">Faster is better. Bar width = relative performance.</p>
    </div>
  );
}
