import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Loader2, Lightbulb, Code2, ChevronDown, ChevronRight, Copy, Check, BookOpen, CheckCircle2 } from 'lucide-react';
import { getLesson, executeQuery } from '../utils/api';
import QueryResult from '../components/QueryResult';
import GraphVisualizer from '../components/GraphVisualizer';
import TimeSeriesChart from '../components/TimeSeriesChart';
import CapExplorer from '../components/CapExplorer';
import ComparisonView from '../components/ComparisonView';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ExplanationBlock({ content }) {
  if (!content) return null;
  const lines = content.split('\n');
  return (
    <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 space-y-2.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h4 key={i} className="text-white font-semibold mt-3 first:mt-0">{line.replace(/\*\*/g, '')}</h4>;
        }
        if (line.startsWith('• ')) {
          const parts = line.slice(2).split(' — ');
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-blue-400 mt-0.5">▸</span>
              <span>
                <strong className="text-gray-200">{parts[0]}</strong>
                {parts[1] && <span className="text-gray-400"> — {parts[1]}</span>}
              </span>
            </div>
          );
        }
        if (line.startsWith('| ')) {
          return <div key={i} className="text-xs font-mono text-gray-500 pl-1">{line}</div>;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-gray-300">{line}</p>;
      })}
    </div>
  );
}

function QueryCard({ q, result, running, onRun, engine, showCode = true }) {
  const [showExplanation, setShowExplanation] = useState(true);
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm">{q.label}</span>
          {q.concept && (
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
              {q.concept}
            </span>
          )}
        </div>
        <button
          onClick={() => onRun(q)}
          disabled={running === q.label}
          className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
        >
          {running === q.label ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          Run
        </button>
      </div>

      {showCode && q.sql && (
        <div className="relative">
          <div className="code-block text-green-400 text-xs pr-10">{q.sql}</div>
          <div className="absolute top-2 right-2">
            <CopyButton text={q.sql} />
          </div>
        </div>
      )}

      {showCode && q.operation && (
        <div className="relative">
          <div className="code-block text-xs text-gray-400 pr-10">
            <span className="text-purple-400">operation</span>: <span className="text-green-400">"{q.operation}"</span>
            {q.params && <>
              <br />
              <span className="text-purple-400">params</span>: <span className="text-amber-400">{JSON.stringify(q.params)}</span>
            </>}
          </div>
          <div className="absolute top-2 right-2">
            <CopyButton text={JSON.stringify({ operation: q.operation, params: q.params }, null, 2)} />
          </div>
        </div>
      )}

      {q.explanation && (
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mt-3 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          {showExplanation ? 'Hide' : 'Show'} explanation
          {showExplanation ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      )}
      {showExplanation && q.explanation && (
        <div className="mt-2 text-sm text-gray-400 leading-relaxed bg-gray-800/30 rounded-lg p-3 border-l-2 border-blue-500">
          {q.explanation}
        </div>
      )}

      {result && (
        <div className="mt-3">
          {result.error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300">
              {result.error}
            </div>
          ) : (
            <QueryResult data={result} engine={engine} />
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('db-explorer-completed') || '{}'); } catch { return {}; }
  });

  useEffect(() => { getLesson(id).then(l => { setLesson(l); setLoading(false); }); }, [id]);

  async function runDemoQuery(q) {
    const key = q.label || 'custom';
    setRunning(key);
    try {
      const res = await executeQuery(lesson.engine, q.sql || q.operation, q.params);
      setResults(prev => ({ ...prev, [key]: res }));
    } catch (err) {
      setResults(prev => ({ ...prev, [key]: { error: err.message } }));
    }
    setRunning(null);
  }

  async function runCustomQuery() {
    if (!customQuery.trim()) return;
    setRunning('custom');
    try {
      const res = await executeQuery(lesson.engine, customQuery);
      setResults(prev => ({ ...prev, custom: res }));
    } catch (err) {
      setResults(prev => ({ ...prev, custom: { error: err.message } }));
    }
    setRunning(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!lesson) return <div className="text-center py-20 text-gray-500">Lesson not found</div>;

  const demo = lesson.demo;

  function markComplete() {
    const next = { ...completed, [lesson.id]: !completed[lesson.id] };
    setCompleted(next);
    localStorage.setItem('db-explorer-completed', JSON.stringify(next));
  }

  const isDone = completed[lesson.id];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to lessons</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-600 font-mono">Lesson {lesson.id}/30</span>
          <button
            onClick={markComplete}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors ${
              isDone ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-500 hover:text-gray-300 border border-gray-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isDone ? 'Completed' : 'Mark complete'}
          </button>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{lesson.title}</h1>
        <p className="text-gray-400 text-base leading-relaxed max-w-3xl">{lesson.description}</p>
      </div>

      {/* Concepts */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">Key Concepts</h2>
        <div className="flex flex-wrap gap-1.5">
          {lesson.concepts.map(c => (
            <span key={c} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Intro */}
      {demo.intro && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-white">{demo.intro.title}</h2>
          </div>
          <ExplanationBlock content={demo.intro.content} />
        </div>
      )}

      {/* Explanation-only */}
      {demo.type === 'explanation' && demo.sections && (
        <div className="space-y-5">
          {demo.sections.map((section, i) => (
            <div key={i} className="card">
              <h2 className="text-base font-semibold text-white mb-3">{section.heading}</h2>
              <ExplanationBlock content={section.content} />
            </div>
          ))}
        </div>
      )}

      {/* SQL queries */}
      {demo.type === 'queries' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Try It Yourself</h2>
          </div>
          <p className="text-gray-500 text-sm mb-2">Click "Run" to execute each query against a live database with sample data.</p>

          {demo.queries.map((q, i) => (
            <QueryCard
              key={i}
              q={q}
              result={results[q.label]}
              running={running}
              onRun={runDemoQuery}
              engine={lesson.engine}
            />
          ))}

          {lesson.engine && (
            <div className="card border-dashed border-gray-700">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-sm text-white">
                <Code2 className="w-4 h-4 text-gray-500" />
                Write your own {lesson.engine.toUpperCase()} query
              </h3>
              <textarea
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runCustomQuery(); }}
                placeholder={
                  lesson.engine === 'sqlite'
                    ? 'SELECT u.name, COUNT(o.id) as orders\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.name'
                    : lesson.engine === 'mongodb'
                      ? '{"operation": "find", "params": {"collection": "users"}}'
                      : 'Enter query...'
                }
                className="input w-full h-28 font-mono text-sm resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-600">Ctrl+Enter to run</span>
                <button onClick={runCustomQuery} disabled={running === 'custom'} className="btn-primary text-sm flex items-center gap-2">
                  {running === 'custom' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run
                </button>
              </div>
              {results.custom && (
                <div className="mt-3">
                  {results.custom.error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300">
                      {results.custom.error}
                    </div>
                  ) : (
                    <QueryResult data={results.custom} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Key-Value operations */}
      {demo.type === 'operations' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-red-400" />
            <h2 className="text-lg font-semibold text-white">Key-Value Operations</h2>
          </div>
          <p className="text-gray-500 text-sm mb-2">Key-value stores support get, put, del, and scan. Simple — and that's the point.</p>

          {demo.operations.map((op, i) => (
            <QueryCard
              key={i}
              q={op}
              result={results[op.label]}
              running={running}
              onRun={(q) => runDemoQuery({ label: q.label, operation: q.operation, params: q.params })}
              engine={lesson.engine}
            />
          ))}
        </div>
      )}

      {/* Graph queries */}
      {demo.type === 'graph_queries' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Graph Exploration</h2>
          </div>
          <p className="text-gray-500 text-sm mb-2">Graph databases excel at relationship queries. The visualization shows nodes and edges.</p>

          {demo.queries.map((q, i) => (
            <QueryCard
              key={i}
              q={q}
              result={results[q.label]}
              running={running}
              onRun={(query) => runDemoQuery({ label: query.label, operation: query.operation, params: query.params })}
              engine={lesson.engine}
              showCode={false}
            />
          ))}
        </div>
      )}

      {/* Time-series queries */}
      {demo.type === 'ts_queries' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Time-Series Operations</h2>
          </div>
          <p className="text-gray-500 text-sm mb-2">Query timestamped data — range scans, aggregations, downsampling.</p>

          {demo.queries.map((q, i) => (
            <QueryCard
              key={i}
              q={q}
              result={results[q.label]}
              running={running}
              onRun={(query) => runDemoQuery({ label: query.label, operation: query.operation, params: query.params })}
              engine={lesson.engine}
              showCode={false}
            />
          ))}
        </div>
      )}

      {/* Vector queries */}
      {demo.type === 'vector_queries' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-pink-400" />
            <h2 className="text-lg font-semibold text-white">Vector Similarity Search</h2>
          </div>
          <p className="text-gray-500 text-sm mb-2">Semantic search finds meaning, not just keywords. Results ranked by cosine similarity.</p>

          {demo.queries.map((q, i) => (
            <QueryCard
              key={i}
              q={q}
              result={results[q.label]}
              running={running}
              onRun={(query) => runDemoQuery({ label: query.label, operation: query.operation, params: query.params })}
              engine={lesson.engine}
              showCode={false}
            />
          ))}
        </div>
      )}

      {/* MongoDB */}
      {demo.type === 'mongodb_queries' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-green-400" />
            <h2 className="text-lg font-semibold text-white">MongoDB Operations</h2>
          </div>
          <p className="text-gray-500 text-sm mb-2">Run find, aggregate, insert operations against a live document database.</p>

          {demo.queries.map((q, i) => (
            <QueryCard
              key={i}
              q={q}
              result={results[q.label]}
              running={running}
              onRun={(query) => runDemoQuery({ label: query.label, operation: query.operation, params: query.params })}
              engine={lesson.engine}
              showCode={false}
            />
          ))}
        </div>
      )}

      {demo.type === 'cap_explorer' && <CapExplorer data={demo} />}
      {demo.type === 'comparison' && <ComparisonView data={demo} />}
    </div>
  );
}
