import { useState, useEffect } from 'react';
import { Cloud, Play, Loader2, CheckCircle2, Copy, Code2, Server, Database, Lock, Zap, Globe, ArrowRight } from 'lucide-react';
import QueryResult from '../components/QueryResult';
import ServerNotice from '../components/ServerNotice';

const PROVIDER_EDUCATION = {
  supabase: {
    title: 'Supabase — Open Source Firebase Alternative',
    architecture: `Supabase wraps PostgreSQL with a REST API layer, real-time subscriptions, authentication, and file storage.

**Architecture:**
Client → Supabase JS SDK → HTTPS REST API → PostgREST → PostgreSQL
                                  ↕
                            Real-time (WebSocket) ← PostgreSQL WAL

**Key concepts:**
• **PostgREST** — Automatically generates REST API from your PostgreSQL schema. No backend code needed.
• **Row Level Security (RLS)** — PostgreSQL policies that control which rows each user can read/write.
• **Real-time** — Supabase listens to PostgreSQL's WAL (Write-Ahead Log) and pushes changes via WebSocket.
• **Edge Functions** — Serverless Deno functions for custom logic.
• **Auth** — Built-in authentication with social logins, magic links, and OTP.`,
    integration: {
      language: 'JavaScript / TypeScript',
      sdk: '@supabase/supabase-js',
      setup: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)`,
      operations: [
        {
          name: 'SELECT (Read)',
          code: `// Fetch all users
const { data, error } = await supabase
  .from('users')
  .select('*')

// With filters
const { data, error } = await supabase
  .from('products')
  .select('name, price')
  .eq('category_id', 1)
  .gt('price', 50)
  .order('price', { ascending: false })
  .limit(10)

// With foreign key join
const { data, error } = await supabase
  .from('orders')
  .select('*, user:users(name, email)')
  .limit(5)`,
          explanation: 'The query builder generates SQL under the hood. Each method adds a clause: .from() → FROM, .select() → SELECT, .eq() → WHERE x = y. The SDK sends this as a GET request to PostgREST.',
        },
        {
          name: 'INSERT (Create)',
          code: `// Insert one row
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'Alice', email: 'alice@example.com' })

// Insert multiple rows
const { data, error } = await supabase
  .from('products')
  .insert([
    { name: 'Laptop', price: 999 },
    { name: 'Mouse', price: 29 }
  ])

// Upsert (insert or update)
const { data, error } = await supabase
  .from('users')
  .upsert({ id: 1, name: 'Alice Updated' })
  .select()`,
          explanation: 'Insert sends a POST request. The response includes inserted row(s) with auto-generated IDs. RLS policies checked automatically. Upsert handles both insert and update.',
        },
        {
          name: 'UPDATE',
          code: `// Update with filter
const { data, error } = await supabase
  .from('products')
  .update({ price: 29.99 })
  .eq('id', 1)

// Update with returning
const { data, error } = await supabase
  .from('users')
  .update({ email: 'new@example.com' })
  .eq('id', 1)
  .select()`,
          explanation: 'Update sends a PATCH request. Always specify a WHERE clause to avoid updating all rows. Use .select() to return the updated row.',
        },
        {
          name: 'Real-time Subscription',
          code: `// Listen for changes on a table
const channel = supabase
  .channel('user-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('Change type:', payload.eventType)
      console.log('New data:', payload.new)
      console.log('Old data:', payload.old)
    }
  )
  .subscribe()`,
          explanation: 'Under the hood: Supabase runs a PostgreSQL logical replication listener. When a row is inserted/updated/deleted, the WAL entry triggers the WebSocket push. More efficient than polling.',
        },
        {
          name: 'Delete',
          code: `// Delete with filter
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', 1)`,
          explanation: 'Delete sends a DELETE request. Always specify a WHERE clause. RLS policies are enforced — users can only delete what their policies allow.',
        },
      ],
    },
  },
  firestore: {
    title: 'Firebase Firestore — Real-time Document Database',
    architecture: `Firestore is a NoSQL document database from Google. Data lives in collections of documents (JSON-like objects).

**Architecture:**
Client → Firestore SDK → gRPC → Firestore Backend → Storage (LSM-tree)
                                  ↕
                            Real-time sync (WebSocket/long-polling)

**Key concepts:**
• **Collections** — Groups of documents (like a table). No fixed schema.
• **Documents** — JSON objects with fields. Can be nested (subcollections).
• **Real-time listeners** — onSnapshot() pushes updates automatically.
• **Offline support** — SDK caches data locally, syncs when reconnected.
• **Security rules** — Declarative access control (no backend code needed).
• **Batch writes** — Atomic operations on up to 500 documents.
• **Transactions** — Read-then-write atomically across documents.`,
    integration: {
      language: 'JavaScript / TypeScript (Web), Java/Kotlin (Android), Swift (iOS)',
      sdk: 'firebase/firestore',
      setup: `import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const app = initializeApp({
  projectId: 'your-project-id',
  // Service account for admin SDK
})
const db = getFirestore(app)`,
      operations: [
        {
          name: 'Read Documents',
          code: `// Get all documents in a collection
const snapshot = await getDocs(collection(db, 'users'))
snapshot.forEach(doc => {
  console.log(doc.id, doc.data())
})

// Query with filters
import { query, where, orderBy, limit } from 'firebase/firestore'

const q = query(
  collection(db, 'products'),
  where('price', '>', 50),
  orderBy('price', 'desc'),
  limit(10)
)
const snapshot = await getDocs(q)`,
          explanation: 'Firestore queries work across a single collection. No JOINs! Denormalize data to avoid expensive cross-collection queries. This is the key difference from SQL.',
        },
        {
          name: 'Write Documents',
          code: `// Add with auto-generated ID
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

const ref = await addDoc(collection(db, 'users'), {
  name: 'Alice',
  age: 30,
  createdAt: serverTimestamp()
})

// Set with specific ID
import { setDoc, doc } from 'firebase/firestore'

await setDoc(doc(db, 'users', 'custom-id'), {
  name: 'Bob',
  age: 25
})

// Update specific fields
import { updateDoc } from 'firebase/firestore'

await updateDoc(doc(db, 'users', 'custom-id'), {
  age: 26,
  email: 'bob@example.com'
})`,
          explanation: 'addDoc() generates a random ID. setDoc() lets you specify the ID. serverTimestamp() creates a server-side timestamp. Writes are atomic at the document level.',
        },
        {
          name: 'Real-time Listener',
          code: `// Listen for real-time updates
import { onSnapshot, collection } from 'firebase/firestore'

const unsubscribe = onSnapshot(
  collection(db, 'users'),
  (snapshot) => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') console.log('New:', change.doc.data())
      if (change.type === 'modified') console.log('Modified:', change.doc.data())
      if (change.type === 'removed') console.log('Removed:', change.doc.id)
    })
  }
)

// Later: unsubscribe() to stop listening`,
          explanation: 'onSnapshot() is Firestore\'s killer feature. It maintains a persistent connection and pushes changes instantly. The SDK handles reconnection, offline caching, and conflict resolution.',
        },
        {
          name: 'Batch Write & Transaction',
          code: `// Batch write (atomic, up to 500 ops)
import { writeBatch, doc } from 'firebase/firestore'

const batch = writeBatch(db)
batch.set(doc(db, 'users', 'u1'), { name: 'Alice' })
batch.set(doc(db, 'users', 'u2'), { name: 'Bob' })
batch.delete(doc(db, 'users', 'u3'))
await batch.commit()

// Transaction (read-then-write atomic)
import { runTransaction } from 'firebase/firestore'

await runTransaction(db, async (transaction) => {
  const snap = await transaction.get(doc(db, 'counters', 'views'))
  const newCount = snap.data().count + 1
  transaction.update(doc(db, 'counters', 'views'), { count: newCount })
})`,
          explanation: 'Batches group writes into one atomic operation — all succeed or all fail. Transactions read data first, then write based on what was read, ensuring consistency even with concurrent changes.',
        },
      ],
    },
  },
};

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(null);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    fetch('/api/providers')
      .then(r => r.json())
      .then(setProviders)
      .catch(() => setServerError(true));
  }, []);

  async function runQuery(provider, operation, params) {
    setLoading(operation);
    try {
      const res = await fetch(`/api/providers/${provider}/query`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, params }),
      });
      const data = await res.json();
      setResults(prev => ({ ...prev, [operation]: data }));
    } catch (err) {
      setResults(prev => ({ ...prev, [operation]: { error: err.message } }));
    }
    setLoading(null);
  }

  return (
    <div className="animate-fade-in">
      {serverError && <ServerNotice message="Cloud providers require the backend server. Set environment variables and restart the server to connect." />}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center">
          <Cloud className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Cloud Providers</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-[48px]">Learn how real cloud databases work — APIs, SDKs, and architecture.</p>

      {/* How cloud DBs work */}
      <div className="card mb-6">
        <h2 className="text-base font-semibold text-white mb-3">How Cloud Database Integrations Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
              <Globe className="w-4 h-4" /> Client SDK
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your app uses a client library (JS, Python, etc.) that wraps HTTP API calls. Handles auth tokens, retries, and connection pooling automatically.
            </p>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
              <Server className="w-4 h-4" /> REST/gRPC API
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              The SDK sends HTTPS requests to the provider's API. Supabase uses PostgREST (auto-generated). Firestore uses gRPC (binary, faster than JSON).
            </p>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-2">
              <Database className="w-4 h-4" /> Database Engine
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Supabase runs PostgreSQL. Firestore runs Google's proprietary engine. The API layer translates requests into database-native operations.
            </p>
          </div>
        </div>
        <div className="bg-gray-800/20 rounded-lg p-3 border border-gray-800/30">
          <h4 className="text-[11px] font-medium text-gray-400 mb-2">API call lifecycle:</h4>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 flex-wrap">
            <span className="bg-blue-600/15 text-blue-400 px-2 py-1 rounded">SDK call</span>
            <ArrowRight className="w-3 h-3 text-gray-700" />
            <span className="bg-gray-700/40 text-gray-400 px-2 py-1 rounded">Serialize</span>
            <ArrowRight className="w-3 h-3 text-gray-700" />
            <span className="bg-gray-700/40 text-gray-400 px-2 py-1 rounded">HTTPS</span>
            <ArrowRight className="w-3 h-3 text-gray-700" />
            <span className="bg-gray-700/40 text-gray-400 px-2 py-1 rounded">Auth</span>
            <ArrowRight className="w-3 h-3 text-gray-700" />
            <span className="bg-gray-700/40 text-gray-400 px-2 py-1 rounded">Execute</span>
            <ArrowRight className="w-3 h-3 text-gray-700" />
            <span className="bg-green-600/15 text-green-400 px-2 py-1 rounded">Response</span>
          </div>
        </div>
      </div>

      {/* Provider cards */}
      <div className="space-y-6">
        {providers.map(p => {
          const edu = PROVIDER_EDUCATION[p.id];
          return (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-600/20 flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{p.name}</h2>
                    <span className="text-xs text-gray-500">{p.type} • {edu?.integration?.language}</span>
                  </div>
                </div>
                <span className={`badge text-[10px] ${p.connected ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-700/50 text-gray-500 border-gray-700'}`}>
                  {p.connected ? 'Connected' : 'Demo Mode'}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{p.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {p.strengths?.map(s => (
                  <div key={s} className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>

              {/* Setup */}
              {!p.connected && p.setup && (
                <div className="bg-gray-800/40 rounded-lg p-4 mb-5 border border-gray-700/50">
                  <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> Setup Instructions
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-400 mb-4">
                    {p.setup.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="space-y-1">
                    {Object.entries(p.setup.env).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-[11px] font-mono bg-gray-900/60 px-3 py-1.5 rounded">
                        <span className="text-amber-400">{key}</span>
                        <span className="text-gray-600">=</span>
                        <span className="text-gray-500 flex-1 truncate">{val}</span>
                        <button onClick={() => navigator.clipboard?.writeText(`export ${key}="${val}"`)} className="text-gray-600 hover:text-gray-400 shrink-0">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Architecture */}
              {edu?.architecture && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-cyan-400" /> Architecture
                  </h4>
                  <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                    {edu.architecture.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <h5 key={i} className="text-xs font-semibold text-white mt-3 first:mt-0 mb-1">{line.replace(/\*\*/g, '')}</h5>;
                      }
                      if (line.startsWith('• ')) {
                        const parts = line.slice(2).split(' — ');
                        return (
                          <div key={i} className="flex gap-2 text-[11px] ml-2 mb-1">
                            <span className="text-blue-400">▸</span>
                            <span><strong className="text-gray-200">{parts[0]}</strong>{parts[1] && <span className="text-gray-500"> — {parts[1]}</span>}</span>
                          </div>
                        );
                      }
                      if (line.trim() === '') return <div key={i} className="h-1" />;
                      return <p key={i} className="text-[11px] text-gray-400 font-mono leading-relaxed">{line}</p>;
                    })}
                  </div>
                </div>
              )}

              {/* Integration code */}
              {edu?.integration && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-green-400" /> Integration ({edu.integration.language})
                  </h4>
                  <div className="bg-gray-950 rounded-lg p-4 border border-gray-800 mb-3">
                    <div className="text-[11px] text-gray-500 mb-2">
                      <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">npm install {edu.integration.sdk}</span>
                    </div>
                    <pre className="text-[11px] text-green-400 font-mono leading-relaxed overflow-x-auto">{edu.integration.setup}</pre>
                  </div>

                  <div className="space-y-3">
                    {edu.integration.operations.map(op => (
                      <div key={op.name} className="bg-gray-800/30 rounded-lg p-4 border border-gray-800/50">
                        <h5 className="text-sm font-medium text-gray-200 mb-2">{op.name}</h5>
                        <pre className="text-[11px] text-green-400 font-mono leading-relaxed bg-gray-950 rounded-lg p-3 mb-2 overflow-x-auto">{op.code}</pre>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{op.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Try it */}
              <div>
                <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" /> Try It (Demo Mode)
                </h4>
                <p className="text-[11px] text-gray-500 mb-3">
                  {!p.connected ? 'Without credentials, these show what the API call would look like. Set env vars to connect to a real instance.' : 'Connected! Running real queries.'}
                </p>
                <div className="space-y-1.5">
                  {(p.id === 'supabase' ? [
                    { label: 'SELECT from users', operation: 'select', params: { table: 'users' } },
                    { label: 'INSERT a user', operation: 'insert', params: { table: 'users', row: { name: 'Demo User' } } },
                    { label: 'Real-time subscribe', operation: 'subscribe', params: { table: 'users' } },
                  ] : [
                    { label: 'GET documents', operation: 'get', params: { collection: 'users' } },
                    { label: 'QUERY with filters', operation: 'query', params: { collection: 'users', limit: 5 } },
                    { label: 'ADD document', operation: 'add', params: { collection: 'users', data: { name: 'Test', age: 25 } } },
                  ]).map(q => (
                    <div key={q.label}>
                      <button
                        onClick={() => runQuery(p.id, q.operation, q.params)}
                        disabled={loading === q.operation}
                        className="w-full text-left px-3 py-2.5 bg-gray-800/40 hover:bg-gray-800/70 rounded-lg text-sm flex items-center justify-between transition-colors border border-gray-800/50"
                      >
                        <span className="text-gray-300 text-xs">{q.label}</span>
                        {loading === q.operation ? <Loader2 className="w-3 h-3 animate-spin text-gray-500" /> : <Play className="w-3 h-3 text-gray-500" />}
                      </button>
                      {results[q.operation] && (
                        <div className="mt-1.5 p-3 bg-gray-950 rounded-lg border border-gray-800">
                          {results[q.operation].demo ? (
                            <div>
                              <p className="text-[11px] text-gray-500 mb-2">{results[q.operation].message}</p>
                              <pre className="text-[11px] text-green-400 font-mono leading-relaxed mb-2">{results[q.operation].code}</pre>
                              {results[q.operation].explanation && (
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2">
                                  <p className="text-[11px] text-blue-400 leading-relaxed">{results[q.operation].explanation}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <QueryResult data={results[q.operation]} compact />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
