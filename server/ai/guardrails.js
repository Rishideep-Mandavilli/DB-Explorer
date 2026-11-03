/**
 * Guardrails module for DB Explorer AI Tutor
 * Enforces safety on user queries and chat prompts.
 */

// Destructive SQL patterns prohibited in educational tutor sandbox
const DESTRUCTIVE_SQL_PATTERNS = [
  { pattern: /\bDROP\s+(TABLE|DATABASE|VIEW|INDEX|TRIGGER|SCHEMA)\b/i, rule: 'DROP operations are forbidden in educational sandbox.' },
  { pattern: /\bTRUNCATE\b/i, rule: 'TRUNCATE statements are forbidden in educational sandbox.' },
  { pattern: /\bALTER\s+TABLE\b.*\bDROP\b/i, rule: 'ALTER TABLE DROP COLUMN/CONSTRAINT is not permitted.' },
  { pattern: /\bDELETE\s+FROM\s+([a-zA-Z0-9_]+)(?!\s+WHERE\b)/i, rule: 'DELETE statements without a WHERE clause are prohibited to prevent accidental data wipe.' },
  { pattern: /\bATTACH(\s+DATABASE)?\b/i, rule: 'ATTACH DATABASE is blocked for sandbox isolation.' },
  { pattern: /\bload_extension\b/i, rule: 'SQLite extension loading is disabled.' },
];

// Prompt injection patterns targeted by Otari input guardrail policy
const PROMPT_INJECTION_PATTERNS = [
  { pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i, rule: 'Attempt to override system prompt detected.' },
  { pattern: /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i, rule: 'Instruction bypass attempt blocked.' },
  { pattern: /\b(you\s+are\s+now|act\s+as)\s+(DAN|jailbreak|unrestricted|god\s+mode)\b/i, rule: 'Jailbreak persona detected.' },
  { pattern: /\b(reveal|show|print|leak|display)\s+(your\s+)?(system\s+prompt|hidden\s+instructions|api\s*key|secret)/i, rule: 'System prompt / secret leakage probe blocked.' },
  { pattern: /\b(system\s+override|developer\s+mode\s+enabled)\b/i, rule: 'System override directive detected.' },
];

/**
 * Validates chat prompt and any associated SQL against security guardrails
 * @param {string} text - User chat input text
 * @param {string} [sql] - SQL query being submitted or analyzed
 * @returns {{ allowed: boolean, reason?: string, type?: 'prompt_injection' | 'destructive_sql', rule?: string }}
 */
function checkGuardrails(text = '', sql = '') {
  const combined = `${text} ${sql}`;

  // 1. Check for prompt injection attempts
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

  // 2. Check for destructive SQL in both text and dedicated SQL field
  for (const item of DESTRUCTIVE_SQL_PATTERNS) {
    if (item.pattern.test(sql) || (item.pattern.test(text) && /\b(table|from|database)\b/i.test(text))) {
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
  DESTRUCTIVE_SQL_PATTERNS,
  PROMPT_INJECTION_PATTERNS,
};
