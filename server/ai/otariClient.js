const OpenAI = require('openai');
require('dotenv').config();

const OTARI_BASE_URL = process.env.OTARI_BASE_URL || 'https://otari.ai/api/v1';
const OTARI_API_KEY = process.env.OTARI_API_KEY;

// Official Otari Open-Weight Models & Routing Policies
const MODELS = {
  EXPLAINER: process.env.OTARI_EXPLAINER_MODEL || 'google/gemma-3-12b-it',
  CODER_POLICY: process.env.OTARI_CODER_MODEL || 'tutor-sql',
  // Backup model configured in the tutor-sql routing policy (answers when the primary fails)
  CODER_FALLBACK: process.env.OTARI_CODER_FALLBACK_MODEL || 'meta/llama-3.1-70b-instruct',
  // Primary model inside the tutor-sql routing policy
  CODER_DIRECT: process.env.OTARI_CODER_PRIMARY_MODEL || 'alibaba/qwen3-coder-30b-a3b-instruct',
  // Doc fetcher: Gemma on Otari does not emit tool calls, so official-doc citations
  // are fetched by a tool-capable open-weight model via otari_web_fetch.
  DOCS: process.env.OTARI_DOCS_MODEL || 'meta/llama-3.1-70b-instruct',
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
// Otari gateway-run tools. Hosted Otari accepts only the `type` field on these
// declarations; the allowed doc domains (sqlite.org, postgresql.org, dev.mysql.com,
// mongodb.com, redis.io) are enforced by the workspace's Web Access allowlist.
const OTARI_TOOLS = {
  codeExecution: { type: 'otari_code_execution' },
  webFetch: { type: 'otari_web_fetch' },
  webSearch: { type: 'otari_web_search' },
};
// Domains configured in the Otari workspace Web Access allowlist (for display/tests)
const DOC_DOMAINS = ['sqlite.org', 'postgresql.org', 'dev.mysql.com', 'mongodb.com', 'redis.io'];


module.exports = {
  otariClient,
  isOtariConfigured,
  OTARI_BASE_URL,
  MODELS,
  OTARI_TOOLS,
  DOC_DOMAINS,
};
