const express = require('express');
const router = express.Router();
const { otariClient, isOtariConfigured, OTARI_BASE_URL } = require('./otariClient');

// Health and gateway status check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: OTARI_BASE_URL,
    configured: isOtariConfigured(),
  });
});

// Minimal route to forward tutor chat completions through Otari Gateway
router.post('/chat', async (req, res) => {
  const { message, user = 'anonymous-learner', model = 'google/gemma-2-9b-it' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    if (!isOtariConfigured()) {
      // Local development simulation fallback when key is not yet set
      return res.json({
        reply: `[Otari Gateway Mock] Connected to ${OTARI_BASE_URL}. Model: ${model}. Response to: "${message}"`,
        model,
        simulated: true,
      });
    }

    const completion = await otariClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: message }],
      user,
    });

    res.json({
      reply: completion.choices[0]?.message?.content || '',
      model: completion.model || model,
      raw: completion,
    });
  } catch (error) {
    console.error('Otari Gateway Error:', error.message);
    res.status(error.status || 500).json({
      error: error.message || 'Otari Gateway request failed',
    });
  }
});

module.exports = router;
