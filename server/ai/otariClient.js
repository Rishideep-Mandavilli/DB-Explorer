const OpenAI = require('openai');
require('dotenv').config();

const OTARI_BASE_URL = process.env.OTARI_BASE_URL || 'https://api.otari.ai/v1';
const OTARI_API_KEY = process.env.OTARI_API_KEY;

// Create OpenAI client configured exclusively for the Mozilla Otari Gateway
const otariClient = new OpenAI({
  baseURL: OTARI_BASE_URL,
  apiKey: OTARI_API_KEY || 'unconfigured_otari_key',
});

/**
 * Checks whether the Otari gateway has a real API key configured
 */
function isOtariConfigured() {
  return Boolean(OTARI_API_KEY && OTARI_API_KEY !== 'mock' && !OTARI_API_KEY.includes('unconfigured'));
}

module.exports = {
  otariClient,
  isOtariConfigured,
  OTARI_BASE_URL,
};
