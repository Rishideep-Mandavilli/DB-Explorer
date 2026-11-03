const express = require('express');
const router = express.Router();
const { isOtariConfigured, OTARI_BASE_URL, MODELS } = require('./otariClient');
const { handleTutorChat, handleCheckAnswer } = require('./tutor');

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
  });
});

// Model catalog metadata
router.get('/models', (req, res) => {
  res.json({
    explainer: {
      id: MODELS.EXPLAINER,
      name: 'Gemma 2 9B Instruct',
      type: 'open-weight',
      role: 'Explainer (Conceptual clarity, official doc citations)',
    },
    coder: {
      id: MODELS.CODER_POLICY,
      name: 'Otari Policy: tutor-sql (Primary: Qwen Coder 32B)',
      type: 'open-weight routing policy',
      role: 'SQL Coder (Query authoring, optimization, grading)',
      fallback: MODELS.CODER_FALLBACK,
    },
  });
});

// Main chat route for interactive AI tutor
router.post('/chat', async (req, res) => {
  try {
    const { message, context, user, modelOverride, simulateFallback } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await handleTutorChat({
      message,
      context,
      user,
      modelOverride,
      simulateFallback: Boolean(simulateFallback),
    });

    res.json(result);
  } catch (error) {
    console.error('Tutor Chat Error:', error);
    const status = error.status || (error.message?.includes('budget') ? 403 : 500);
    res.status(status).json({
      error: error.message || 'Error communicating with AI Tutor via Otari Gateway',
      budgetExceeded: status === 403,
      retryAfter: error.headers?.['retry-after'] || '86400',
    });
  }
});

// Specialized grading route with otari_code_execution
router.post('/check-answer', async (req, res) => {
  try {
    const { userSql, solutionSql, lessonId, user } = req.body;

    if (!userSql) {
      return res.status(400).json({ error: 'userSql is required' });
    }

    const result = await handleCheckAnswer({
      userSql,
      solutionSql,
      lessonId,
      user,
    });

    res.json(result);
  } catch (error) {
    console.error('Check Answer Error:', error);
    res.status(500).json({ error: error.message || 'Check answer verification failed' });
  }
});

module.exports = router;
