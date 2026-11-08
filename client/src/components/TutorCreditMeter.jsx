import React, { useState, useEffect, useRef } from 'react';
import { Coins, Clock, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { fetchUserBudget, resetTutorBudget } from '../utils/tutorApi';

export default function TutorCreditMeter({ onBudgetUpdate, refreshTrigger }) {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dropdownRef = useRef(null);

  async function loadBudget(exhaust = false) {
    try {
      setLoading(true);
      const data = await fetchUserBudget(exhaust);
      setBudget(data);
      if (onBudgetUpdate) onBudgetUpdate(data);
    } catch (err) {
      console.warn('Failed to load budget:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    try {
      setLoading(true);
      await resetTutorBudget();
      await loadBudget(false);
    } catch (err) {
      console.warn('Reset failed:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudget();
  }, [refreshTrigger]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  if (!budget) return null;

  const pct = Math.min(100, Math.max(0, (budget.remaining / budget.totalBudget) * 100));
  const isLow = budget.remaining <= 0.01;
  const isExceeded = budget.isExceeded;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setExpanded(!expanded)}
        title="Otari Per-Learner Credit Budget"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
          isExceeded
            ? 'bg-red-950/80 text-red-300 border-red-700/60 animate-pulse'
            : isLow
            ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
            : 'bg-gray-900/80 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60'
        }`}
      >
        <Coins className="w-3.5 h-3.5" />
        <span>${budget.remaining.toFixed(3)}</span>
        <span className="text-gray-500 text-[10px]">/ ${budget.totalBudget.toFixed(2)}</span>
      </button>

      {expanded && (
        <div className="absolute right-0 top-8 z-50 w-72 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-xl p-3.5 shadow-2xl text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-400" />
              Daily Tutor Credit (Otari)
            </span>
            <span className="text-[10px] text-gray-400">RPM: {budget.rpmRemaining}/{budget.rpmLimit}</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>Remaining: ${budget.remaining.toFixed(4)}</span>
              <span>Total: ${budget.totalBudget.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isExceeded ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 bg-gray-950/60 p-2 rounded-lg border border-gray-800">
            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Resets daily at 00:00 UTC</span>
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-gray-800 text-[11px]">
            <button
              onClick={() => loadBudget(true)}
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Simulate Cap
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Reset Credits
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
