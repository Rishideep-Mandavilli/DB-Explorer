/**
 * Client API utility for the DB Explorer AI Tutor
 * Handles anonymous learner identity and Otari Gateway endpoints
 */

const STORAGE_KEY = 'db_explorer_learner_id';
let inMemoryLearnerId = null;

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return inMemoryLearnerId;
  }
}

function safeStorageSet(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
    inMemoryLearnerId = val;
  }
}

/**
 * Returns or creates a persistent anonymous learner ID
 */
export function getLearnerId() {
  let id = safeStorageGet(STORAGE_KEY);
  if (!id) {
    id = `learner_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    safeStorageSet(STORAGE_KEY, id);
  }
  return id;
}

/**
 * Reset learner ID (e.g. for testing new user budget simulation)
 */
export function resetLearnerId() {
  const newId = `learner_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
  safeStorageSet(STORAGE_KEY, newId);
  return newId;
}

/**
 * Safely parse HTTP responses avoiding SyntaxErrors on HTML/non-JSON error bodies
 */
async function safeParseResponse(res, fallbackMessage) {
  const contentType = res.headers.get('content-type') || '';
  let data = {};

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = { error: 'Failed to parse JSON response from server' };
    }
  } else {
    try {
      const text = await res.text();
      data = { error: text.slice(0, 300) || fallbackMessage };
    } catch {
      data = { error: fallbackMessage };
    }
  }

  if (!res.ok) {
    const error = new Error(data.error || fallbackMessage || `HTTP ${res.status}`);
    error.status = res.status;
    error.budgetExceeded = Boolean(data.budgetExceeded || res.status === 403);
    error.resetTime = data.resetTime;
    error.retryAfter = data.retryAfter;
    error.data = data;
    throw error;
  }

  return data;
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

  return safeParseResponse(res, 'Failed to communicate with AI Tutor via Otari Gateway');
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

  return safeParseResponse(res, 'Failed to verify solution');
}

/**
 * Fetch daily tutor credit budget for the current learner
 */
export async function fetchUserBudget(exhaust = false) {
  const user = getLearnerId();
  const res = await fetch(`/api/tutor/budget?user=${encodeURIComponent(user)}${exhaust ? '&exhaust=true' : ''}`);
  return safeParseResponse(res, 'Failed to fetch tutor budget');
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
  return safeParseResponse(res, 'Failed to reset budget');
}

/**
 * Fetch Otari Gateway metadata and open-weight models
 */
export async function fetchTutorHealth() {
  const res = await fetch('/api/tutor/health');
  return safeParseResponse(res, 'Failed to fetch tutor health');
}
