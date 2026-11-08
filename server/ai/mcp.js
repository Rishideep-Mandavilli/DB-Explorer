/**
 * Lightweight Model Context Protocol (MCP) Server for DB Explorer
 * Exposes read-only run_query and describe_schema tools over DB Explorer engines.
 * Serves as Backup Feature #8 for the Mozilla Otari Hackathon.
 */

const sqliteEngine = require('../engines/sqlite');
const mongodbEngine = require('../engines/mongodb');
const graphEngine = require('../engines/graph');
const timeseriesEngine = require('../engines/timeseries');
const vectorEngine = require('../engines/vector');
const levelEngine = require('../engines/level');
const { checkGuardrails, stripSqlCommentsAndNormalize } = require('./guardrails');

const engines = {
  sqlite: sqliteEngine,
  mongodb: mongodbEngine,
  graph: graphEngine,
  timeseries: timeseriesEngine,
  vector: vectorEngine,
  level: levelEngine,
};

// Declared MCP Tools
const MCP_TOOLS = [
  {
    name: 'run_query',
    description: 'Execute a read-only query on one of DB Explorer engines (sqlite, mongodb, graph, timeseries, vector, level).',
    inputSchema: {
      type: 'object',
      properties: {
        engine: {
          type: 'string',
          enum: Object.keys(engines),
          description: 'The target database engine.',
        },
        query: {
          type: 'string',
          description: 'The read-only query or operation payload.',
        },
        params: {
          type: 'object',
          description: 'Optional query parameters.',
        },
      },
      required: ['engine', 'query'],
    },
  },
  {
    name: 'describe_schema',
    description: 'Retrieve schema structure and available tables/collections for a DB Explorer engine.',
    inputSchema: {
      type: 'object',
      properties: {
        engine: {
          type: 'string',
          enum: Object.keys(engines),
          description: 'The target database engine to inspect.',
        },
      },
      required: ['engine'],
    },
  },
];

// Read-only operation whitelist for non-relational engines
const READ_ONLY_OPERATIONS = {
  mongodb: ['find', 'findOne', 'aggregate', 'count'],
  level: ['get', 'scan'],
  graph: ['bfs', 'dfs', 'find', 'path', 'shortest_path', 'neighbors'],
  timeseries: ['query', 'range', 'aggregate', 'list_metrics'],
  vector: ['search', 'search_by_text', 'search_by_vector', 'similarity'],
};

/**
 * Handle MCP Tool Calls with Strict Read-Only Validation
 */
async function handleMcpToolCall(name, args = {}) {
  const { engine: engineName, query, params } = args;

  if (name === 'describe_schema') {
    const engine = engines[engineName || 'sqlite'];
    if (!engine) {
      throw new Error(`Engine '${engineName}' not found`);
    }
    const schema = engine.schema ? engine.schema() : { info: engine.info() };
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  if (name === 'run_query') {
    const engine = engines[engineName || 'sqlite'];
    if (!engine) {
      throw new Error(`Engine '${engineName}' not found`);
    }

    const queryString = typeof query === 'string' ? query : JSON.stringify(query);

    // 1. Check security guardrails
    const guardrailCheck = checkGuardrails('', queryString);
    if (!guardrailCheck.allowed) {
      throw new Error(`Guardrail violation: ${guardrailCheck.reason}`);
    }

    // 2. Engine-specific read-only verification
    if (engineName === 'sqlite') {
      const normalized = stripSqlCommentsAndNormalize(queryString).toUpperCase();
      if (!normalized.startsWith('SELECT') && !normalized.startsWith('EXPLAIN') && !normalized.startsWith('WITH')) {
        throw new Error('MCP run_query only permits read-only SELECT, WITH, and EXPLAIN statements');
      }
      if (normalized.includes('PRAGMA') && !normalized.startsWith('PRAGMA TABLE_INFO')) {
        throw new Error('Arbitrary PRAGMA operations are restricted in MCP');
      }
    } else if (READ_ONLY_OPERATIONS[engineName]) {
      const allowedOps = READ_ONLY_OPERATIONS[engineName];
      let op = queryString;
      try {
        const parsed = JSON.parse(queryString);
        op = parsed.operation || op;
      } catch {
        // use raw string as op
      }
      if (!allowedOps.includes(op.toLowerCase().trim())) {
        throw new Error(`Operation '${op}' is not permitted in read-only MCP mode for engine '${engineName}'. Allowed: ${allowedOps.join(', ')}`);
      }
    }

    const result = await engine.query(query, params);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown MCP tool: ${name}`);
}

module.exports = {
  MCP_TOOLS,
  handleMcpToolCall,
};
