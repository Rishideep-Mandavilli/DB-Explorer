const { Level } = require('level');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'leveldb');
let db;

function getDb() {
  if (!db) {
    db = new Level(DB_PATH, { valueEncoding: 'json' });
  }
  return db;
}

function reset() {
  if (db) {
    db.close();
    db = null;
  }
  const fs = require('fs');
  fs.rmSync(DB_PATH, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  return { ok: true };
}

function seed() {
  const d = getDb();
  const data = {
    'user:1': { name: 'Alice', email: 'alice@example.com' },
    'user:2': { name: 'Bob', email: 'bob@example.com' },
    'user:3': { name: 'Charlie', email: 'charlie@example.com' },
    'session:abc123': { userId: 1, expires: Date.now() + 86400000 },
    'session:def456': { userId: 2, expires: Date.now() + 86400000 },
    'cache:homepage': { data: { title: 'Welcome', items: [1, 2, 3] }, ttl: 3600 },
    'counter:pageviews': 1042,
    'config:app': { theme: 'dark', lang: 'en', debug: false },
  };
  const ops = Object.entries(data).map(([k, v]) => ({ type: 'put', key: k, value: v }));
  d.batch(ops);
  return { ok: true, inserted: Object.keys(data).length };
}

function info() {
  return {
    name: 'LevelDB',
    type: 'key-value',
    description: 'Google\'s fast key-value storage library. Ordered, persistent, single-process.',
    strengths: ['Extremely fast reads', 'LSM-tree based', 'Compression built-in', 'Ordered keys'],
    useCases: ['Caching', 'Session storage', 'Counter/stats', 'Configuration', 'Blockchain storage'],
    color: '#ef4444',
  };
}

async function query(operation, params = {}) {
  const d = getDb();
  const start = performance.now();

  switch (operation) {
    case 'get': {
      const val = await d.get(params.key);
      return { row: { key: params.key, value: val }, duration: elapsed(start) };
    }
    case 'put': {
      await d.put(params.key, params.value);
      return { ok: true, duration: elapsed(start) };
    }
    case 'del': {
      await d.del(params.key);
      return { ok: true, duration: elapsed(start) };
    }
    case 'list': {
      const prefix = params.prefix || '';
      const limit = params.limit || 50;
      const rows = [];
      for await (const [key, value] of d.iterator({ gte: prefix, lte: prefix + '\xff', limit })) {
        rows.push({ key, value });
      }
      return { rows, duration: elapsed(start) };
    }
    case 'count': {
      let count = 0;
      for await (const _ of d.iterator()) count++;
      return { count, duration: elapsed(start) };
    }
    case 'batch': {
      const ops = (params.operations || []).map(op => ({
        type: op.type,
        key: op.key,
        value: op.value,
      }));
      await d.batch(ops);
      return { ok: true, processed: ops.length, duration: elapsed(start) };
    }
    default:
      throw new Error(`LevelDB supports: get, put, del, list, count, batch. Got: ${operation}`);
  }
}

function elapsed(start) {
  return Math.round((performance.now() - start) * 100) / 100;
}

function schema() {
  return { description: 'Key-value store has no enforced schema. Data is stored as key→value pairs with key naming conventions.' };
}

module.exports = { info, schema, query, reset, seed, hasConcept: (c) => ['get', 'put', 'del', 'list', 'count', 'batch'].includes(c) };
