/**
 * Per-User Budget & Spend Controller
 * Interacts with Mozilla Otari's End-User Budgets API (GET /api/v1/end-users?external_id=...)
 * Enforces per-learner credit caps ($0.05/day) and provides friendly reset counters.
 */

const { OTARI_BASE_URL, isOtariConfigured } = require('./otariClient');

const DAILY_BUDGET_USD = parseFloat(process.env.OTARI_DAILY_USER_BUDGET || '0.05');
const RPM_LIMIT = 15;
const MAX_LEDGER_ENTRIES = 5000;

// Bounded local ledger for development and fallback simulation
const userLedger = new Map();

/**
 * Prunes the local ledger if it exceeds max size to prevent memory leaks
 */
function pruneLedgerIfNeeded() {
  if (userLedger.size > MAX_LEDGER_ENTRIES) {
    const keysToRemove = Array.from(userLedger.keys()).slice(0, 1000);
    for (const key of keysToRemove) {
      userLedger.delete(key);
    }
  }
}

/**
 * Gets or initializes a local user ledger record with sliding-window RPM
 */
function getOrCreateRecord(userId) {
  const now = Date.now();
  if (!userLedger.has(userId)) {
    pruneLedgerIfNeeded();
    userLedger.set(userId, {
      spend: 0.008, // Initial spend from preliminary exploration
      requestsThisMinute: 0,
      windowStart: now,
      lastRequestTime: now,
    });
  }

  const record = userLedger.get(userId);

  // Sliding window: reset requestsThisMinute after 60 seconds
  if (!record.windowStart || now - record.windowStart >= 60000) {
    record.windowStart = now;
    record.requestsThisMinute = 0;
  }

  return record;
}

/**
 * Calculates the next UTC midnight timestamp for budget resets
 */
function getNextUtcMidnight() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return tomorrow.toISOString();
}

/**
 * Calculates seconds remaining until next UTC midnight
 */
function getSecondsUntilMidnight() {
  const now = Date.now();
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return Math.max(60, Math.floor((tomorrow.getTime() - now) / 1000));
}

/**
 * Fetches the current budget, spend, and rate limits for a learner
 * @param {string} userId - Learner's anonymous persistent ID
 * @param {boolean} [forceExhaust=false] - Testing flag to simulate budget exhaustion
 */
async function getUserBudget(userId = 'anonymous-learner', forceExhaust = false) {
  // 1. Try querying Otari Gateway end-users API if configured
  if (isOtariConfigured() && !forceExhaust) {
    try {
      const fetchFn = globalThis.fetch || (await import('node-fetch')).default;
      const res = await fetchFn(`${OTARI_BASE_URL}/end-users?external_id=${encodeURIComponent(userId)}`, {
        headers: {
          Authorization: `Bearer ${process.env.OTARI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const userObj = Array.isArray(data) ? data[0] : (data.users ? data.users[0] : data);
        if (userObj) {
          const spend = parseFloat(userObj.spend || userObj.current_spend || 0);
          const totalBudget = parseFloat(userObj.budget || DAILY_BUDGET_USD);
          const remaining = Math.max(0, totalBudget - spend);
          return {
            userId,
            totalBudget,
            spend,
            remaining,
            currency: 'USD',
            isExceeded: remaining <= 0,
            resetTime: userObj.resets_at || getNextUtcMidnight(),
            rpmLimit: RPM_LIMIT,
            rpmRemaining: userObj.rpm_remaining || RPM_LIMIT - 1,
            source: 'otari-gateway',
          };
        }
      }
    } catch (err) {
      console.warn('Otari End-User Budget API query failed, using local ledger:', err.message);
    }
  }

  // 2. High-fidelity local simulation ledger
  const record = getOrCreateRecord(userId);

  if (forceExhaust) {
    record.spend = DAILY_BUDGET_USD;
  }

  const spend = Math.min(DAILY_BUDGET_USD, parseFloat(record.spend.toFixed(4)));
  const remaining = Math.max(0, parseFloat((DAILY_BUDGET_USD - spend).toFixed(4)));
  const isExceeded = remaining <= 0;

  return {
    userId,
    totalBudget: DAILY_BUDGET_USD,
    spend,
    remaining,
    currency: 'USD',
    isExceeded,
    resetTime: getNextUtcMidnight(),
    retryAfterSeconds: isExceeded ? getSecondsUntilMidnight() : 0,
    rpmLimit: RPM_LIMIT,
    rpmRemaining: Math.max(0, RPM_LIMIT - record.requestsThisMinute),
    source: isOtariConfigured() ? 'otari-gateway-fallback' : 'otari-mock-ledger',
  };
}

/**
 * Atomically reserve budget before executing an LLM completion (avoids TOCTOU race condition)
 */
function reserveBudget(userId = 'anonymous-learner', estimatedCost = 0.002) {
  const record = getOrCreateRecord(userId);
  if (record.spend + estimatedCost > DAILY_BUDGET_USD) {
    return false; // Insufficient credits
  }
  record.spend = parseFloat((record.spend + estimatedCost).toFixed(4));
  record.requestsThisMinute += 1;
  record.lastRequestTime = Date.now();
  return true;
}

/**
 * Release reserved budget if request fails or is rejected
 */
function releaseBudget(userId = 'anonymous-learner', amount = 0.002) {
  if (userLedger.has(userId)) {
    const record = userLedger.get(userId);
    record.spend = Math.max(0, parseFloat((record.spend - amount).toFixed(4)));
  }
}

/**
 * Record a completion's cost against the learner's budget
 */
function recordUsage(userId = 'anonymous-learner', costUsd = 0.002) {
  const record = getOrCreateRecord(userId);
  record.spend = parseFloat((record.spend + costUsd).toFixed(4));
  record.requestsThisMinute += 1;
  record.lastRequestTime = Date.now();
  return record;
}

/**
 * Reset a user's simulated budget for live demo video purposes
 */
async function resetUserBudget(userId = 'anonymous-learner') {
  const now = Date.now();
  userLedger.set(userId, { spend: 0.000, requestsThisMinute: 0, windowStart: now, lastRequestTime: now });
  return await getUserBudget(userId);
}

module.exports = {
  getUserBudget,
  reserveBudget,
  releaseBudget,
  recordUsage,
  resetUserBudget,
  DAILY_BUDGET_USD,
};
