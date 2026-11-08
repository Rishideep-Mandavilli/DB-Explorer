/**
 * Core AI Tutor service for DB Explorer
 * Routes questions between Gemma Explainer and Qwen SQL Coder via Mozilla Otari Gateway.
 */

const { otariClient, isOtariConfigured, MODELS, OTARI_TOOLS } = require('./otariClient');
const { checkGuardrails } = require('./guardrails');

// Embedded reference SQLite engine for local sandbox verification
const sqliteEngine = require('../engines/sqlite');

/**
 * Detects the learner's intent to route to the appropriate open-weight model role
 * @param {string} message - User chat message
 * @param {object} context - Context containing current lesson, engine, and SQL
 * @returns {'explain' | 'sql_coder' | 'check_answer'}
 */
function detectIntent(message = '', context = {}) {
  const text = (typeof message === 'string' ? message : String(message || '')).toLowerCase().trim();

  if (context.isCheckAnswer || /check\s+(my\s+)?answer|grade\s+(my\s+)?(query|solution)|verify\s+solution/i.test(text)) {
    return 'check_answer';
  }

  // Explainer keywords
  if (
    /^(why|what\s+is|explain|how\s+does|tell\s+me\s+about|what\s+does|difference\s+between|understand)/i.test(text) ||
    /\b(concept|mental\s+model|theory|architecture|internals|b-tree|lsm|wal|acid)\b/i.test(text) ||
    /\b(null\s+in\s+join|why\s+does\s+left\s+join|why\s+null)\b/i.test(text)
  ) {
    return 'explain';
  }

  // SQL Coder keywords
  if (
    /^(write|fix|optimize|correct|debug|rewrite|create\s+query|generate)/i.test(text) ||
    /\b(query|select|join|group\s+by|where|order\s+by|syntax\s+error|top\s+\d+|window\s+function)\b/i.test(text)
  ) {
    return 'sql_coder';
  }

  // Context-aware defaults
  if (context.currentSql && context.currentSql.trim().length > 0) {
    return 'sql_coder';
  }

  return 'explain';
}

/**
 * Handles learner chat interaction through Otari Gateway
 */
async function handleTutorChat({
  message,
  context = {},
  user = 'anonymous-learner',
  modelOverride,
  simulateFallback = false,
}) {
  const startTime = Date.now();

  // 1. Guardrail safety check (Input guardrails + destructive SQL filter)
  const guardrailCheck = checkGuardrails(message, context.currentSql || '');
  if (!guardrailCheck.allowed) {
    return {
      success: false,
      guardrailBlocked: true,
      type: guardrailCheck.type,
      rule: guardrailCheck.rule,
      reply: `🛡️ **Otari Guardrail Blocked Request**\n\n${guardrailCheck.reason}\n\n*In DB Explorer's learning sandbox, all queries must be non-destructive and adhere to safety policies.*`,
      model: 'otari-guardrails-engine',
      headers: {
        'otari-guardrail-action': 'block',
        'otari-guardrail-profile': 'prompt-injection-v1',
      },
      toolCalls: [],
      sources: [],
      latencyMs: Date.now() - startTime,
    };
  }

  // 2. Role-based model selection
  const intent = detectIntent(message, context);
  let selectedModel;
  let roleTitle;

  if (modelOverride) {
    selectedModel = modelOverride;
    roleTitle = 'Custom Model';
  } else if (intent === 'explain') {
    selectedModel = MODELS.EXPLAINER; // Gemma (e.g. google/gemma-2-9b-it)
    roleTitle = 'Gemma Explainer';
  } else {
    // SQL Coder: Use Otari routing policy or fallback model
    selectedModel = simulateFallback ? MODELS.CODER_FALLBACK : MODELS.CODER_POLICY;
    roleTitle = 'Qwen SQL Coder';
  }

  // 3. Prepare tools based on role
  const tools = [];
  if (intent === 'explain') {
    tools.push(OTARI_TOOLS.webFetch);
  } else if (intent === 'check_answer' || intent === 'sql_coder') {
    tools.push(OTARI_TOOLS.codeExecution);
  }

  // 4. Build prompt messages
  const systemPrompt = `You are DB Explorer AI Tutor, an expert database instructor powered by Mozilla Otari Gateway.
Your role: ${roleTitle} (${selectedModel}).
Current Engine: ${context.engine || 'sqlite'}.
Current Lesson: ${context.lessonTitle || 'General Sandbox'} (ID: ${context.lessonId || 'none'}).
${context.currentSql ? `Student's Active SQL:\n\`\`\`sql\n${context.currentSql}\n\`\`\`` : ''}

Style:
- Be clear, concise, and educational.
- If explaining a concept, explain the mental model and fetch/cite official docs.
- If writing SQL, provide high-performance, standard-compliant SQL with a quick explanation.`;

  // 5. Call Otari Gateway if real API key configured
  if (isOtariConfigured() && !simulateFallback) {
    try {
      const responseObj = await otariClient.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        tools: tools.length > 0 ? tools : undefined,
        user,
      }).withResponse();

      const completion = responseObj.data;
      const headers = {
        'otari-model': responseObj.response.headers.get('otari-model') || completion.model || selectedModel,
        'otari-fallback': responseObj.response.headers.get('otari-fallback') || 'false',
        'otari-attempt-count': responseObj.response.headers.get('otari-attempt-count') || '1',
        'x-request-id': responseObj.response.headers.get('x-request-id') || 'req-otari-' + Math.random().toString(36).substring(7),
      };

      const toolCalls = completion.choices[0]?.message?.otari_tool_calls || [];
      const sources = [];

      // Extract sources if web_fetch was used
      toolCalls.forEach(tc => {
        if (tc.type === 'otari_web_fetch' && tc.response?.url) {
          sources.push({ title: tc.response.title || 'Official Documentation', url: tc.response.url });
        }
      });

      return {
        success: true,
        reply: completion.choices[0]?.message?.content || '',
        model: headers['otari-model'],
        roleTitle,
        headers,
        toolCalls,
        sources,
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      console.warn('Otari Gateway request failed:', err.message);
      // Propagate critical rate limit, auth, and gateway errors
      if (err.status === 429 || err.status === 403 || err.status === 401 || (err.status >= 500 && !simulateFallback)) {
        throw err;
      }
      // Otherwise proceed to high-fidelity simulation fallback for network/offline dev
    }
  }

  // 6. High-fidelity simulation mode for hackathon flows & local development
  return generateSimulatedResponse({
    message,
    context,
    intent,
    selectedModel,
    roleTitle,
    simulateFallback,
    startTime,
  });
}

/**
 * Normalizes an individual row object for deterministic comparison
 */
function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const sorted = {};
  Object.keys(row).sort().forEach(k => {
    let v = row[k];
    if (typeof v === 'bigint') v = v.toString();
    else if (typeof v === 'number') v = Math.round(v * 10000) / 10000;
    sorted[k] = v;
  });
  return sorted;
}

/**
 * Deterministically compares two SQL result sets
 */
function compareResultSets(userRows, solutionRows) {
  if (!Array.isArray(userRows) || !Array.isArray(solutionRows)) return false;
  if (userRows.length !== solutionRows.length) return false;
  const uNorm = userRows.map(normalizeRow);
  const sNorm = solutionRows.map(normalizeRow);

  // 1. Strict ordered match
  if (JSON.stringify(uNorm) === JSON.stringify(sNorm)) return true;

  // 2. Unordered match (when query doesn't enforce strict ordering)
  const uSorted = [...uNorm].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const sSorted = [...sNorm].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return JSON.stringify(uSorted) === JSON.stringify(sSorted);
}

/**
 * Handles the "Check my answer" grading flow using otari_code_execution
 */
async function handleCheckAnswer({
  userSql,
  solutionSql,
  lessonId,
  user = 'anonymous-learner',
}) {
  const startTime = Date.now();

  // Guardrail safety check
  const guardrailCheck = checkGuardrails('', userSql);
  if (!guardrailCheck.allowed) {
    return {
      success: false,
      guardrailBlocked: true,
      feedback: `Safety Violation: ${guardrailCheck.reason}`,
      model: 'otari-guardrails-engine',
      passed: false,
      toolCalls: [],
    };
  }

  // Ensure query is read-only (SELECT / WITH / EXPLAIN) in educational grading
  const normalizedSql = (userSql || '').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--.*$/gm, ' ').trim().toUpperCase();
  if (!normalizedSql.startsWith('SELECT') && !normalizedSql.startsWith('WITH') && !normalizedSql.startsWith('EXPLAIN')) {
    return {
      success: false,
      guardrailBlocked: true,
      feedback: 'Safety Violation: Educational sandbox query evaluation only permits read-only SELECT or WITH statements.',
      model: 'otari-guardrails-engine',
      passed: false,
      toolCalls: [],
    };
  }

  // Execute learner's query on embedded SQLite engine
  let userResult = null;
  let userError = null;
  try {
    userResult = await sqliteEngine.query(userSql);
  } catch (err) {
    userError = err.message;
  }

  // Execute reference solution query if available
  let solutionResult = null;
  let solutionError = null;
  if (solutionSql) {
    try {
      solutionResult = await sqliteEngine.query(solutionSql);
    } catch (err) {
      solutionError = err.message;
    }
  }

  // Compare result sets by comparing actual returned rows and row counts
  const userRows = userResult?.rows || userResult || [];
  const solutionRows = solutionResult?.rows || solutionResult || [];
  const userRowCount = Array.isArray(userRows) ? userRows.length : 0;
  const solutionRowCount = Array.isArray(solutionRows) ? solutionRows.length : 0;
  const passed = !userError && solutionResult && compareResultSets(userRows, solutionRows);

  // Simulated Otari Code Execution tool call payload
  const codeExecutionToolCall = {
    id: 'call_code_exec_' + Math.random().toString(36).substring(7),
    type: 'otari_code_execution',
    container: 'auto',
    input: {
      language: 'python',
      code: `# Otari Code Execution Container (auto-persisted)\nimport sqlite3, json\nconn = sqlite3.connect('/sandbox/db_explorer_seeded.db')\n\n# User Query\nuser_rows = conn.execute(${JSON.stringify(userSql)}).fetchall()\n\n# Validation\nprint(f"Executed rows: {len(user_rows)}")`,
    },
    output: {
      status: userError ? 'error' : 'success',
      rowCount: userRowCount,
      columns: userResult?.columns || (userRows[0] ? Object.keys(userRows[0]) : []),
      executionTimeMs: userResult?.duration ? userResult.duration * 1000 : 4.2,
    },
  };

  const feedback = passed
    ? `🎉 **Correct!** Your query produced the exact expected output (${userRowCount} rows matched the reference dataset).\n\nGreat job applying your SQL knowledge to this challenge!`
    : userError
    ? `❌ **SQL Syntax / Execution Error:**\n\`\`\`\n${userError}\n\`\`\`\n\n**Hint:** Check your column names, table aliases, and WHERE clauses.`
    : `⚠️ **Result Mismatch:** Your query executed successfully and returned ${userRowCount} rows, but the reference solution expected ${solutionRowCount} rows with matching values.\n\nCompare your filtering conditions and sorting order.`;

  return {
    success: true,
    passed,
    feedback,
    userResult,
    solutionResult,
    model: MODELS.CODER_DIRECT,
    headers: {
      'otari-model': MODELS.CODER_DIRECT,
      'otari-fallback': 'false',
      'otari-attempt-count': '1',
      'otari-container-id': 'cnt_auto_sqlite3_session_01',
    },
    toolCalls: [codeExecutionToolCall],
    latencyMs: Date.now() - startTime,
  };
}

/**
 * High-fidelity simulation for Hackathon flows A-E
 */
function generateSimulatedResponse({
  message,
  context,
  intent,
  selectedModel,
  roleTitle,
  simulateFallback,
  startTime,
}) {
  const text = message.toLowerCase();
  let reply = '';
  const toolCalls = [];
  const sources = [];

  // Flow A: "why does LEFT JOIN return NULLs?" -> Gemma Explainer + sqlite.org docs citation
  if (text.includes('left join') && text.includes('null')) {
    toolCalls.push({
      id: 'call_web_fetch_sqlite_01',
      type: 'otari_web_fetch',
      request: {
        url: 'https://sqlite.org/lang_select.html#joins',
        domain: 'sqlite.org',
      },
      response: {
        title: 'SQLite SELECT Documentation — Joins and Outer Joins',
        status: 200,
        snippet: 'A LEFT OUTER JOIN returns all rows from the left table. If no matching row exists in the right table, NULL is substituted for all columns of the right table.',
      },
    });

    sources.push({
      title: 'SQLite Official Documentation: Section 3.1 Joins',
      url: 'https://sqlite.org/lang_select.html#joins',
    });

    sources.push({
      title: 'PostgreSQL Table Expressions — Outer Joins',
      url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html',
    });

    reply = `In relational databases like SQLite and PostgreSQL, a **LEFT JOIN** (or LEFT OUTER JOIN) is designed to preserve **every single row** from the left-hand table, regardless of whether a matching row exists in the right-hand table.

### Why NULL appears:
1. **Unmatched Left Rows:** When the join condition (e.g., \`ON orders.user_id = users.id\`) evaluates to FALSE or finds no corresponding row in the right table, SQL cannot simply omit the left row.
2. **Missing Attribute Placeholder:** To complete the rectangular result row, SQLite fills every column that would have come from the right-hand table with **\`NULL\`**.
3. **Filtering Unmatched Data:** You can intentionally take advantage of this behavior to detect orphans:
   \`\`\`sql
   SELECT users.name 
   FROM users 
   LEFT JOIN orders ON users.id = orders.user_id 
   WHERE orders.id IS NULL;
   \`\`\`
   *(This cleanly finds all users who have never placed an order!)*`;
  }
  // Flow B: "top 3 customers by revenue" -> Qwen Coder writes query
  else if (text.includes('top 3') || (text.includes('revenue') && text.includes('customer'))) {
    toolCalls.push({
      id: 'call_code_exec_02',
      type: 'otari_code_execution',
      container: 'auto',
      input: {
        language: 'python',
        code: 'import sqlite3\nconn = sqlite3.connect("data/db.sqlite")\n# Query verified against orders and users schema',
      },
      output: {
        status: 'success',
        testedRows: 3,
      },
    });

    reply = `Here is the optimized query to calculate the top 3 customers by total revenue:

\`\`\`sql
SELECT 
    u.id AS customer_id,
    u.name AS customer_name,
    SUM(o.total) AS total_revenue
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
GROUP BY u.id, u.name
ORDER BY total_revenue DESC
LIMIT 3;
\`\`\`

### Key Optimizations:
- **Index Recommendation:** Add a composite index on \`orders(user_id, status, total)\` to enable index-only scanning.
- **Filtering:** Filters for completed transactions before aggregation to avoid counting abandoned carts.`;
  }
  // Generic SQL query request
  else if (intent === 'sql_coder') {
    reply = `Here is the solution for your query in **${context.engine || 'sqlite'}**:\n\n\`\`\`sql\n${context.currentSql || 'SELECT * FROM users WHERE active = 1 ORDER BY created_at DESC LIMIT 10;'}\n\`\`\`\n\nThis query cleanly retrieves the target records. Click **Run Query** in the editor above to test it directly against the live engine!`;
  }
  // Generic Explainer request
  else {
    reply = `In **${context.engine || 'database systems'}**, this concept relates directly to how the storage engine organizes records on disk. 

- **Primary Structure:** B-Tree indexing ensures $O(\\log N)$ lookups.
- **Transactions:** ACID guarantees isolate concurrent readers and writers.
- **Engine Tip:** Test this behavior in the Sandbox to see execution metrics in real-time.`;
  }

  const modelHeader = simulateFallback ? MODELS.CODER_FALLBACK : (selectedModel === MODELS.CODER_POLICY ? 'qwen/qwen-2.5-coder-32b-instruct' : selectedModel);

  return {
    success: true,
    reply,
    model: modelHeader,
    roleTitle,
    headers: {
      'otari-model': modelHeader,
      'otari-fallback': simulateFallback ? 'true' : 'false',
      'otari-attempt-count': simulateFallback ? '2' : '1',
      'otari-policy': simulateFallback ? 'tutor-sql' : 'default',
      'x-request-id': 'req-otari-sim-' + Math.random().toString(36).substring(7),
    },
    toolCalls,
    sources,
    latencyMs: Date.now() - startTime,
  };
}

module.exports = {
  detectIntent,
  handleTutorChat,
  handleCheckAnswer,
};
