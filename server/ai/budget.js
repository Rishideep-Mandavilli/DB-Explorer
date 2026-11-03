/**
 * Per-User Budget & Spend Controller
 * Interacts with Mozilla Otari's End-User Budgets API (GET /api/v1/end-users?external_id=...)
 * Enforces per-learner credit caps ($0.05/day) and provides friendly reset counters.
 */

const { OTARI_BASE_URL, isOtariConfigured } = require('./otariClient');

const DAILY_BUDGET_USD = parseFloat(process.env.OTARI_DAILY_USER_BUDGET || '0.05');
const RPM_LIMIT = 15;

// Local ledger for development and fallback simulation
const userLedger = new Map();

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
      const fetch = (await import('node-fetch')).default || global.fetch;
      const res = await fetch(`${OTARI_BASE_URL}/end-users?external_id=${encodeURIComponent(userId)}`, {
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
  if (!userLedger.has(userId)) {
    userLedger.set(userId, {
      spend: 0.008, // Initial spend from preliminary queries
      requestsThisMinute: 1,
      lastRequestTime: Date.now(),
    });
  }

  const record = userLedger.get(userId);

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
 * Record a completion's cost against the learner's budget
 */
function recordUsage(userId = 'anonymous-learner', costUsd = 0.002) {
  if (!userLedger.has(userId)) {
    userLedger.set(userId, { spend: 0, requestsThisMinute: 0, lastRequestTime: Date.now() });
  }
  const record = userLedger.get(userId);
  record.spend += costUsd;
  record.requestsThisMinute += 1;
  record.lastRequestTime = Date.now();
  return record;
}

/**
 * Reset a user's simulated budget for live demo video purposes
 */
function resetUserBudget(userId = 'anonymous-learner') {
  userLedger.set(userId, { spend: 0.000, requestsThisMinute: 0, lastRequestTime: Date.now() });
  return getUserBudget(userId);
}

module.exports = {
  getUserBudget,
  recordUsage,
  resetUserBudget,
  DAILY_BUDGET_USD,
};
