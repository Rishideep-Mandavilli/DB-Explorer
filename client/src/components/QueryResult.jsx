import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Clock, Hash, CheckCircle2 } from 'lucide-react';

export default function QueryResult({ data, engine, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);

  if (!data) return null;

  if (data.error) {
    return (
      <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
        <div>
          <span className="text-sm text-red-300 font-medium">Error</span>
          <p className="text-xs text-red-400/80 mt-0.5">{data.error}</p>
        </div>
      </div>
    );
  }

  const duration = data.duration;
  const rows = data.rows || (data.row ? [data.row] : null);
  const count = data.rowCount || data.count || rows?.length || 0;

  return (
    <div className="space-y-2">
      {/* Stats bar */}
      <div className="flex items-center gap-3 text-[11px] text-gray-500">
        {count > 0 && (
          <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-0.5 rounded-md">
            <Hash className="w-3 h-3" /> {count} {count === 1 ? 'row' : 'rows'}
          </span>
        )}
        {duration !== undefined && (
          <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" /> {duration}ms
          </span>
        )}
        {!compact && rows && rows.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 hover:text-gray-300 transition-colors ml-auto">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'collapse' : 'expand'}
          </button>
        )}
      </div>

      {/* Table */}
      {expanded && rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-800/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/30">
                {(data.columns || Object.keys(rows[0])).map(col => (
                  <th key={col} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((row, i) => (
                <tr key={i} className="border-t border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-3 py-2 text-gray-300 font-mono text-xs">
                      {val === null ? <span className="text-gray-600 italic">null</span> :
                       typeof val === 'object' ? <span className="text-gray-500">{JSON.stringify(val)}</span> :
                       String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 20 && (
            <div className="px-3 py-2 text-[10px] text-gray-600 border-t border-gray-800/30 bg-gray-800/10">
              Showing 20 of {rows.length} rows
            </div>
          )}
        </div>
      )}

      {/* Aggregation result */}
      {expanded && !rows && data.value !== undefined && (
        <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-800/30">
          <div className="text-3xl font-mono font-bold text-blue-400">{data.value}</div>
          {data.func && <div className="text-xs text-gray-500 mt-1.5">{data.func}() over {data.points} data points</div>}
        </div>
      )}

      {/* Count result */}
      {expanded && !rows && data.count !== undefined && (
        <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-800/30">
          <div className="text-3xl font-mono font-bold text-blue-400">{data.count}</div>
        </div>
      )}

      {/* Success */}
      {expanded && !rows && data.ok !== undefined && (
        <div className="bg-green-500/8 border border-green-500/15 rounded-xl p-3 flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          Success {data.processed ? `(${data.processed} operations)` : ''}
        </div>
      )}

      {/* Fallback JSON */}
      {expanded && !rows && data.value === undefined && data.count === undefined && data.ok === undefined && data.found === undefined && (
        <pre className="code-block text-xs text-gray-400">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
