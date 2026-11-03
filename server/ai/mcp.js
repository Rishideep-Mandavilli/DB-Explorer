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

/**
 * Handle MCP Tool Calls
 */
async function handleMcpToolCall(name, args = {}) {
  const { engine: engineName, query } = args;

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

    // Safety: ensure read-only
    if (engineName === 'sqlite') {
      const trimmed = (query || '').trim().toUpperCase();
      if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('PRAGMA') && !trimmed.startsWith('EXPLAIN')) {
        throw new Error('MCP run_query only permits read-only SELECT statements');
      }
    }

    const result = await engine.query(query);
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
