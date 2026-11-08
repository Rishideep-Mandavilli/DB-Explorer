/**
 * Guardrails module for DB Explorer AI Tutor
 * Enforces safety on user queries and chat prompts.
 */

// Helper to strip SQL comments (both /* ... */ and -- ...) and normalize whitespace
function stripSqlCommentsAndNormalize(str = '') {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\/\*[\s\S]*?\*\//g, ' ') // Strip multi-line comments
    .replace(/--.*$/gm, ' ')          // Strip single-line comments
    .replace(/\s+/g, ' ')             // Collapse whitespace
    .trim();
}

// Destructive SQL patterns prohibited in educational tutor sandbox
const DESTRUCTIVE_SQL_PATTERNS = [
  { pattern: /\bDROP\s+(TABLE|DATABASE|VIEW|INDEX|TRIGGER|SCHEMA)\b/i, rule: 'DROP operations are forbidden in educational sandbox.' },
  { pattern: /\bTRUNCATE\b/i, rule: 'TRUNCATE statements are forbidden in educational sandbox.' },
  { pattern: /\bALTER\s+TABLE\b[\s\S]*\bDROP\b/i, rule: 'ALTER TABLE DROP COLUMN/CONSTRAINT is not permitted.' },
  { pattern: /\bDELETE\s+(FROM\s+)?["`\[]?[a-zA-Z0-9_]+["`\]]?(\s+WHERE\s+(1\s*=\s*1|true|1|\w+\s*=\s*\w+))?\s*(;|$)/i, rule: 'Unrestricted or destructive DELETE statements are prohibited.' },
  { pattern: /\bDELETE\b/i, rule: 'DELETE operations are restricted in educational sandbox to prevent data loss.' },
  { pattern: /\bATTACH(\s+DATABASE)?\b/i, rule: 'ATTACH DATABASE is blocked for sandbox isolation.' },
  { pattern: /\bDETACH(\s+DATABASE)?\b/i, rule: 'DETACH DATABASE is blocked for sandbox isolation.' },
  { pattern: /\bload_extension\b/i, rule: 'SQLite extension loading is disabled.' },
  { pattern: /\bPRAGMA\s+writable_schema\b/i, rule: 'Tampering with database schema via PRAGMA is forbidden.' },
];

// Prompt injection patterns targeted by Otari input guardrail policy
const PROMPT_INJECTION_PATTERNS = [
  { pattern: /ignore\s+(all\s+)?(previous|prior|above|existing)\s+(instructions|prompts|rules|commands)/i, rule: 'Attempt to override system prompt detected.' },
  { pattern: /disregard\s+(all\s+)?(previous|prior|above|existing)\s+(instructions|prompts|rules|commands)/i, rule: 'Instruction bypass attempt blocked.' },
  { pattern: /\b(you\s+are\s+now|act\s+as|switch\s+to)\s+(DAN|jailbreak|unrestricted|god\s+mode|chaos\s+mode)\b/i, rule: 'Jailbreak persona detected.' },
  { pattern: /\b(reveal|show|print|leak|display|output)\s+(your\s+)?(system\s+prompt|hidden\s+instructions|api\s*key|secret)/i, rule: 'System prompt / secret leakage probe blocked.' },
  { pattern: /\b(system\s+override|developer\s+mode\s+enabled|super\s+admin\s+mode)\b/i, rule: 'System override directive detected.' },
];

/**
 * Validates chat prompt and any associated SQL against security guardrails
 * @param {string} text - User chat input text
 * @param {string} [sql] - SQL query being submitted or analyzed
 * @returns {{ allowed: boolean, reason?: string, type?: 'prompt_injection' | 'destructive_sql', rule?: string }}
 */
function checkGuardrails(text = '', sql = '') {
  const safeText = typeof text === 'string' ? text : String(text || '');
  const safeSql = typeof sql === 'string' ? sql : String(sql || '');

  // 1. Check for prompt injection attempts across combined input
  const combined = `${safeText} ${safeSql}`;
  for (const item of PROMPT_INJECTION_PATTERNS) {
    if (item.pattern.test(combined)) {
      return {
        allowed: false,
        type: 'prompt_injection',
        reason: `[Otari Guardrail Blocked] ${item.rule}`,
        rule: item.rule,
      };
    }
  }

  // 2. Sanitize SQL (strip comment-obfuscation like DROP/**/TABLE)
  const normalizedSql = stripSqlCommentsAndNormalize(safeSql);
  const normalizedText = stripSqlCommentsAndNormalize(safeText);

  // 3. Check for destructive SQL patterns in both dedicated SQL and user text
  for (const item of DESTRUCTIVE_SQL_PATTERNS) {
    if (item.pattern.test(normalizedSql) || item.pattern.test(normalizedText)) {
      return {
        allowed: false,
        type: 'destructive_sql',
        reason: `[Safety Guardrail Blocked] ${item.rule}`,
        rule: item.rule,
      };
    }
  }

  return { allowed: true };
}

module.exports = {
  checkGuardrails,
  stripSqlCommentsAndNormalize,
  DESTRUCTIVE_SQL_PATTERNS,
  PROMPT_INJECTION_PATTERNS,
};
