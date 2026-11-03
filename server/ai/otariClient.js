const OpenAI = require('openai');
require('dotenv').config();

const OTARI_BASE_URL = process.env.OTARI_BASE_URL || 'https://api.otari.ai/v1';
const OTARI_API_KEY = process.env.OTARI_API_KEY;

// Official Otari Open-Weight Models & Routing Policies
const MODELS = {
  EXPLAINER: process.env.OTARI_EXPLAINER_MODEL || 'google/gemma-2-9b-it',
  CODER_POLICY: process.env.OTARI_CODER_MODEL || 'tutor-sql',
  CODER_FALLBACK: process.env.OTARI_CODER_FALLBACK_MODEL || 'qwen/qwen-2.5-coder-32b-instruct',
  CODER_DIRECT: 'qwen/qwen-2.5-coder-32b-instruct',
};

// Create OpenAI client configured exclusively for the hosted Mozilla Otari Gateway
const otariClient = new OpenAI({
  baseURL: OTARI_BASE_URL,
  apiKey: OTARI_API_KEY || 'mock',
});

/**
 * Checks whether real Otari gateway credentials are provided
 */
function isOtariConfigured() {
  return Boolean(
    OTARI_API_KEY &&
    OTARI_API_KEY !== 'mock' &&
    !OTARI_API_KEY.includes('unconfigured') &&
    OTARI_API_KEY.length > 5
  );
}

/**
 * Tools available on the Mozilla Otari Gateway
 */
const OTARI_TOOLS = {
  codeExecution: {
    type: 'otari_code_execution',
    otari_code_execution: {
      container: 'auto',
      timeout: 30,
    },
  },
  webFetch: {
    type: 'otari_web_fetch',
    otari_web_fetch: {
      allowed_domains: [
        'sqlite.org',
        'postgresql.org',
        'dev.mysql.com',
        'mongodb.com',
        'redis.io',
      ],
    },
  },
  webSearch: {
    type: 'otari_web_search',
    otari_web_search: {
      allowed_domains: [
        'sqlite.org',
        'postgresql.org',
        'dev.mysql.com',
        'mongodb.com',
        'redis.io',
      ],
    },
  },
};

module.exports = {
  otariClient,
  isOtariConfigured,
  OTARI_BASE_URL,
  MODELS,
  OTARI_TOOLS,
};
