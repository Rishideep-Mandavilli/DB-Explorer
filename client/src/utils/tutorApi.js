/**
 * Client API utility for the DB Explorer AI Tutor
 * Handles anonymous learner identity and Otari Gateway endpoints
 */

const STORAGE_KEY = 'db_explorer_learner_id';

/**
 * Returns or creates a persistent anonymous learner ID
 */
export function getLearnerId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `learner_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/**
 * Reset learner ID (e.g. for testing new user budget simulation)
 */
export function resetLearnerId() {
  const newId = `learner_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
  localStorage.setItem(STORAGE_KEY, newId);
  return newId;
}

/**
 * Send a chat prompt to the AI Tutor routed via Otari
 */
export async function sendTutorMessage({
  message,
  context = {},
  modelOverride,
  simulateFallback = false,
  exhaustBudget = false,
}) {
  const user = getLearnerId();
  const res = await fetch('/api/tutor/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      context,
      user,
      modelOverride,
      simulateFallback,
      exhaustBudget,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || 'Failed to communicate with AI Tutor');
    error.status = res.status;
    error.budgetExceeded = Boolean(data.budgetExceeded);
    error.resetTime = data.resetTime;
    error.retryAfter = data.retryAfter;
    error.data = data;
    throw error;
  }
  return data;
}

/**
 * Verify a student's SQL answer against reference solution via Otari code execution
 */
export async function checkAnswerWithTutor({
  userSql,
  solutionSql,
  lessonId,
}) {
  const user = getLearnerId();
  const res = await fetch('/api/tutor/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userSql,
      solutionSql,
      lessonId,
      user,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to verify solution');
  }
  return data;
}

/**
 * Fetch daily tutor credit budget for the current learner
 */
export async function fetchUserBudget(exhaust = false) {
  const user = getLearnerId();
  const res = await fetch(`/api/tutor/budget?user=${encodeURIComponent(user)}${exhaust ? '&exhaust=true' : ''}`);
  if (!res.ok) {
    throw new Error('Failed to fetch tutor budget');
  }
  return res.json();
}

/**
 * Reset the daily credit budget for current learner (Demo feature)
 */
export async function resetTutorBudget() {
  const user = getLearnerId();
  const res = await fetch('/api/tutor/budget/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user }),
  });
  if (!res.ok) {
    throw new Error('Failed to reset budget');
  }
  return res.json();
}

/**
 * Fetch Otari Gateway metadata and open-weight models
 */
export async function fetchTutorHealth() {
  const res = await fetch('/api/tutor/health');
  if (!res.ok) throw new Error('Failed to fetch tutor health');
  return res.json();
}
