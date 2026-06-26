import { useState } from 'react';
import { Play, Loader2, Lightbulb, Clock, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { executeQuery } from '../utils/api';
import QueryResult from './QueryResult';

export default function ComparisonView({ data }) {
  const [activeScenario, setActiveScenario] = useState(data.scenarios[0]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(null);
  const [showContext, setShowContext] = useState(true);
  const [runAll, setRunAll] = useState(false);

  async function runSolution(sol) {
    setLoading(sol.label);
    try {
      const res = await executeQuery(sol.engine, sol.operation || sol.sql, sol.params);
      setResults(prev => ({ ...prev, [sol.label]: res }));
    } catch (err) {
      setResults(prev => ({ ...prev, [sol.label]: { error: err.message } }));
    }
    setLoading(null);
  }

  async function runAllSolutions() {
    setRunAll(true);
    setResults({});
    for (const sol of activeScenario.solutions) {
      await runSolution(sol);
    }
    setRunAll(false);
  }

  const timings = activeScenario.solutions
    .filter(s => results[s.label]?.duration !== undefined)
    .map(s => ({ label: s.label, duration: results[s.label].duration }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {data.scenarios.map(s => (
          <button
            key={s.title}
            onClick={() => { setActiveScenario(s); setResults({}); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeScenario.title === s.title
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800 border border-gray-800'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-white mb-1">{activeScenario.title}</h3>
            <p className="text-gray-400 text-sm">{activeScenario.description}</p>
          </div>
          <button
            onClick={runAllSolutions}
            disabled={runAll}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 shrink-0 ml-4"
          >
            {runAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run All
          </button>
        </div>

        {activeScenario.context && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 mb-4">
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-1.5 text-xs text-blue-400 font-medium"
            >
              {showContext ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Lightbulb className="w-3 h-3" /> Context
            </button>
            {showContext && (
              <p className="text-xs text-gray-400 leading-relaxed mt-2">{activeScenario.context}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {activeScenario.solutions.map(sol => (
            <div key={sol.label} className="bg-gray-800/30 rounded-lg p-4 border border-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-200">{sol.label}</span>
                  {results[sol.label]?.duration !== undefined && (
                    <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {results[sol.label].duration}ms
                    </span>
                  )}
                </div>
                <button
                  onClick={() => runSolution(sol)}
                  disabled={loading === sol.label}
                  className="btn-primary text-xs flex items-center gap-1.5 py-1 px-2.5"
                >
                  {loading === sol.label ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Run
                </button>
              </div>
              {sol.why && <p className="text-xs text-gray-400 mb-2 leading-relaxed">{sol.why}</p>}
              <div className="code-block text-xs mb-2 text-gray-400">
                {sol.sql || JSON.stringify({ operation: sol.operation, params: sol.params }, null, 2)}
              </div>
              {results[sol.label] && <QueryResult data={results[sol.label]} engine={sol.engine} compact />}
            </div>
          ))}
        </div>

        {/* Timing comparison */}
        {timings.length >= 2 && (
          <div className="mt-4 p-4 bg-gray-800/20 rounded-lg border border-gray-800/30">
            <h4 className="text-xs font-semibold text-gray-400 mb-3">Performance</h4>
            <div className="space-y-1.5">
              {timings.sort((a, b) => a.duration - b.duration).map(t => {
                const max = Math.max(...timings.map(x => x.duration));
                return (
                  <div key={t.label} className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400 w-28 truncate">{t.label}</span>
                    <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${t.duration === max ? 'bg-amber-600/50' : 'bg-blue-600/50'}`}
                        style={{ width: `${Math.max(5, (t.duration / max) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono w-14 text-right">{t.duration}ms</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
