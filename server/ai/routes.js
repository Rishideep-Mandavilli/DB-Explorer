const express = require('express');
const router = express.Router();
const { isOtariConfigured, OTARI_BASE_URL, MODELS } = require('./otariClient');
const { handleTutorChat, handleCheckAnswer } = require('./tutor');
const { getUserBudget, reserveBudget, releaseBudget, recordUsage, resetUserBudget, DAILY_BUDGET_USD } = require('./budget');
const { MCP_TOOLS, handleMcpToolCall } = require('./mcp');

// Health and gateway status check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: OTARI_BASE_URL,
    configured: isOtariConfigured(),
    models: {
      explainer: MODELS.EXPLAINER,
      coderPolicy: MODELS.CODER_POLICY,
      coderFallback: MODELS.CODER_FALLBACK,
    },
    spendingCeiling: {
      workspaceDailyCapUsd: 10.0,
      userDailyBudgetUsd: DAILY_BUDGET_USD,
    },
  });
});

// Model catalog metadata
router.get('/models', (req, res) => {
  res.json({
    explainer: {
      id: MODELS.EXPLAINER,
      name: 'Gemma 3 12B Instruct',
      type: 'open-weight',
      role: 'Explainer (Conceptual clarity, official doc citations)',
    },
    coder: {
      id: MODELS.CODER_POLICY,
      name: 'Otari Policy: tutor-sql (Primary: Qwen3 Coder 30B)',
      type: 'open-weight routing policy',
      role: 'SQL Coder (Query authoring, optimization, grading)',
      fallback: MODELS.CODER_FALLBACK,
    },
  });
});

// Per-User Budget Meter & Status
router.get('/budget', async (req, res) => {
  try {
    const userId = req.query.user || 'anonymous-learner';
    const forceExhaust = req.query.exhaust === 'true';
    const budgetInfo = await getUserBudget(userId, forceExhaust);
    res.json(budgetInfo);
  } catch (error) {
    console.error('Budget error:', error);
    res.status(500).json({ error: 'Failed to retrieve user budget' });
  }
});

// Reset user budget (for demo & testing purposes)
router.post('/budget/reset', async (req, res) => {
  try {
    const userId = (req.body && req.body.user) || req.query.user || 'anonymous-learner';
    const resetInfo = await resetUserBudget(userId);
    res.json({ ok: true, budget: resetInfo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset user budget: ' + err.message });
  }
});

// Main chat route for interactive AI tutor
router.post('/chat', async (req, res) => {
  const { message, context, user = 'anonymous-learner', modelOverride, simulateFallback, exhaustBudget } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // 1. Enforce Per-Learner Budget Cap ($0.05/day)
  const userBudget = await getUserBudget(user, Boolean(exhaustBudget));
  if (userBudget.isExceeded) {
    return res.status(403).json({
      error: 'Daily tutor credit limit exceeded ($0.05/learner/day). Your credit will reset at midnight UTC.',
      budgetExceeded: true,
      resetTime: userBudget.resetTime,
      retryAfter: userBudget.retryAfterSeconds || 86400,
      budget: userBudget,
    });
  }

  // 2. Atomically reserve estimated budget to prevent concurrency TOCTOU bypass
  const reserved = reserveBudget(user, 0.002);
  if (!reserved && !exhaustBudget) {
    return res.status(403).json({
      error: 'Daily tutor credit limit reached for this session. Your credit will reset at midnight UTC.',
      budgetExceeded: true,
      resetTime: userBudget.resetTime,
      retryAfter: 86400,
    });
  }

  try {
    const result = await handleTutorChat({
      message,
      context,
      user,
      modelOverride,
      simulateFallback: Boolean(simulateFallback),
    });

    res.json(result);
  } catch (error) {
    // Release reserved credit on failed completion
    releaseBudget(user, 0.002);

    console.error('Tutor Chat Error:', error);
    const validStatus = Number.isInteger(error.status) && error.status >= 100 && error.status <= 599
      ? error.status
      : (error.message?.includes('budget') ? 403 : 500);

    res.status(validStatus).json({
      error: error.message || 'Error communicating with AI Tutor via Otari Gateway',
      budgetExceeded: validStatus === 403,
      retryAfter: error.headers?.['retry-after'] || '86400',
    });
  }
});

// Specialized grading route with otari_code_execution
router.post('/check-answer', async (req, res) => {
  try {
    const { userSql, solutionSql, lessonId, user = 'anonymous-learner' } = req.body || {};

    if (!userSql) {
      return res.status(400).json({ error: 'userSql is required' });
    }

    const result = await handleCheckAnswer({
      userSql,
      solutionSql,
      lessonId,
      user,
    });

    recordUsage(user, 0.001);

    res.json(result);
  } catch (error) {
    console.error('Check Answer Error:', error);
    res.status(500).json({ error: error.message || 'Check answer verification failed' });
  }
});

// MCP integration routes (Backup Feature #8)
router.get('/mcp/tools', (req, res) => {
  res.json({ tools: MCP_TOOLS });
});

router.post('/mcp/call', async (req, res) => {
  try {
    const { name, arguments: toolArgs } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: 'Tool name is required' });
    }
    const result = await handleMcpToolCall(name, toolArgs);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
