import React from 'react';
import { Bug, X, ShieldAlert, Cpu, Activity, User, Server, RefreshCw } from 'lucide-react';
import { getLearnerId, resetLearnerId } from '../utils/tutorApi';

export default function TutorDebugDrawer({
  isOpen,
  onClose,
  latestHeaders = {},
  forceFallback,
  setForceFallback,
  onTriggerDemoFlow,
}) {
  if (!isOpen) return null;

  const learnerId = getLearnerId();
  const isFallback = latestHeaders['otari-fallback'] === 'true' || forceFallback;
  const attempts = latestHeaders['otari-attempt-count'] || (isFallback ? '2' : '1');
  const currentModel = latestHeaders['otari-model'] || (isFallback ? 'qwen/qwen-2.5-coder-32b-instruct (backup)' : 'tutor-sql (primary)');

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-gray-950 border-l border-gray-800 shadow-2xl z-50 flex flex-col text-xs font-mono">
      <div className="p-3.5 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Bug className="w-4 h-4 text-amber-400" />
          <span>Otari Gateway Telemetry</span>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Gateway Endpoint */}
        <div className="space-y-1">
          <span className="text-gray-400 text-[11px] flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            Gateway Endpoint
          </span>
          <div className="bg-gray-900 p-2 rounded border border-gray-800 text-gray-300 select-all">
            https://api.otari.ai/v1
          </div>
        </div>

        {/* Model & Routing Policy */}
        <div className="space-y-1">
          <span className="text-gray-400 text-[11px] flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Active Model (Otari-Model)
          </span>
          <div className="bg-gray-900 p-2 rounded border border-gray-800 text-white font-semibold flex items-center justify-between">
            <span className="truncate">{currentModel}</span>
          </div>
        </div>

        {/* Routing Fallback Telemetry (Hackathon Feature #2) */}
        <div className="space-y-1">
          <span className="text-gray-400 text-[11px] flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Fallback Policy (tutor-sql)
          </span>
          <div className="bg-gray-900 p-2.5 rounded border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Otari-Fallback:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isFallback
                  ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {isFallback ? 'TRUE (BACKUP)' : 'FALSE'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Otari-Attempt-Count:</span>
              <span className="font-bold text-white">{attempts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Sandbox Container:</span>
              <span className="text-emerald-400">auto (persisted)</span>
            </div>
          </div>
        </div>

        {/* Learner Identity & Budgets (Hackathon Feature #6) */}
        <div className="space-y-1">
          <span className="text-gray-400 text-[11px] flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-sky-400" />
            Learner (user field)
          </span>
          <div className="bg-gray-900 p-2 rounded border border-gray-800 space-y-1">
            <div className="text-gray-300 truncate select-all">{learnerId}</div>
            <div className="text-[10px] text-gray-500">
              Passes to Otari completions "user" for isolated daily spend tracking.
            </div>
          </div>
        </div>

        {/* Interactive Demo Triggers for Video Recording */}
        <div className="space-y-2 pt-2 border-t border-gray-800">
          <span className="text-gray-400 text-[11px] font-semibold flex items-center gap-1">
            Video Demo Fast-Triggers:
          </span>

          <button
            onClick={() => setForceFallback(!forceFallback)}
            className={`w-full py-1.5 px-2.5 rounded text-left transition-colors border flex items-center justify-between ${
              forceFallback
                ? 'bg-amber-950/80 border-amber-600 text-amber-200'
                : 'bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-300'
            }`}
          >
            <span>Force Fallback Policy</span>
            <span className="text-[10px] font-bold">{forceFallback ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => onTriggerDemoFlow('flow_a')}
            className="w-full py-1.5 px-2.5 rounded text-left bg-gray-900 border border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            Demo Flow A: Gemma + Docs Citation
          </button>

          <button
            onClick={() => onTriggerDemoFlow('flow_b')}
            className="w-full py-1.5 px-2.5 rounded text-left bg-gray-900 border border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            Demo Flow B: Coder + Code Execution
          </button>

          <button
            onClick={() => onTriggerDemoFlow('flow_c_injection')}
            className="w-full py-1.5 px-2.5 rounded text-left bg-red-950/40 border border-red-800/60 hover:bg-red-900/40 text-red-300"
          >
            Demo Flow C: Prompt Injection Guardrail
          </button>

          <button
            onClick={() => onTriggerDemoFlow('flow_c_drop')}
            className="w-full py-1.5 px-2.5 rounded text-left bg-red-950/40 border border-red-800/60 hover:bg-red-900/40 text-red-300"
          >
            Demo Flow C: Destructive DROP Guardrail
          </button>

          <button
            onClick={() => onTriggerDemoFlow('flow_e_budget')}
            className="w-full py-1.5 px-2.5 rounded text-left bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/40 text-amber-300"
          >
            Demo Flow E: Daily Credit Cap (403)
          </button>
        </div>
      </div>
    </div>
  );
}
