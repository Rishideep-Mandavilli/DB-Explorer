import React, { useState } from 'react';
import { Terminal, Globe, Search, ChevronDown, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TutorToolCallBadge({ toolCalls = [] }) {
  const [expanded, setExpanded] = useState(false);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="my-2 bg-gray-950/70 border border-gray-800 rounded-lg overflow-hidden text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-800/40 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-700/50">
            Otari Tools
          </span>
          {toolCalls.map((tc, idx) => {
            if (tc.type === 'otari_code_execution') {
              return (
                <span key={idx} className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>otari_code_execution (container: auto)</span>
                </span>
              );
            }
            if (tc.type === 'otari_web_fetch') {
              return (
                <span key={idx} className="flex items-center gap-1 text-sky-400 font-mono text-[11px]">
                  <Globe className="w-3.5 h-3.5" />
                  <span>otari_web_fetch ({tc.request?.domain || 'official docs'})</span>
                </span>
              );
            }
            if (tc.type === 'otari_web_search') {
              return (
                <span key={idx} className="flex items-center gap-1 text-purple-400 font-mono text-[11px]">
                  <Search className="w-3.5 h-3.5" />
                  <span>otari_web_search</span>
                </span>
              );
            }
            return (
              <span key={idx} className="text-gray-400 font-mono">
                {tc.type}
              </span>
            );
          })}
        </div>
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="p-3 border-t border-gray-800/80 bg-gray-950/90 space-y-2.5 font-mono text-[11px]">
          {toolCalls.map((tc, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-white font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {tc.type}
                </span>
                {tc.container && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-gray-800 text-gray-300 rounded">
                    container: {tc.container}
                  </span>
                )}
              </div>

              {tc.request?.url && (
                <div className="text-blue-400 truncate">
                  URL: <a href={tc.request.url} target="_blank" rel="noreferrer" className="underline hover:text-blue-300">{tc.request.url}</a>
                </div>
              )}

              {tc.input?.code && (
                <div className="bg-gray-900 p-2 rounded text-gray-300 overflow-x-auto whitespace-pre">
                  {tc.input.code}
                </div>
              )}

              {tc.output && (
                <div className="text-gray-400 text-[10px]">
                  Result: {typeof tc.output === 'object' ? JSON.stringify(tc.output) : tc.output}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
