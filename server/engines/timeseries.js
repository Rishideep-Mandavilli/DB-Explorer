const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'timeseries.json');
let store = {};

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      store = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch { store = {}; }
}

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2));
}

function reset() {
  store = {};
  save();
  return { ok: true };
}

function seed() {
  reset();
  const now = Date.now();
  const hour = 3600000;
  const metrics = ['cpu_usage', 'memory_usage', 'requests', 'errors', 'latency'];

  store = {};
  metrics.forEach(metric => {
    store[metric] = [];
    for (let i = 0; i < 168; i++) { // 7 days of hourly data
      const ts = now - (168 - i) * hour;
      const base = { cpu_usage: 45, memory_usage: 62, requests: 1200, errors: 5, latency: 50 };
      const variance = { cpu_usage: 20, memory_usage: 10, requests: 400, errors: 3, latency: 20 };
      const hourly = Math.sin(i / 24 * Math.PI) * 15; // daily pattern
      const value = Math.max(0, base[metric] + (Math.random() - 0.5) * variance[metric] + hourly);
      store[metric].push({
        timestamp: ts,
        value: Math.round(value * 100) / 100,
        tags: { host: 'web-01', region: i % 2 === 0 ? 'us-east' : 'eu-west' },
      });
    }
  });
  save();
  return { ok: true, metrics: Object.keys(store), pointsPerMetric: 168 };
}

function info() {
  return {
    name: 'InfluxDB-style',
    type: 'time-series',
    description: 'Time-series database for metrics, events, and IoT data. Optimized for timestamped writes and range queries.',
    strengths: ['Fast time-range queries', 'Downsampling', 'Retention policies', 'Tags for dimensional queries'],
    useCases: ['Monitoring & observability', 'IoT sensor data', 'Application metrics', 'Financial market data', 'DevOps metrics'],
    color: '#f59e0b',
  };
}

function schema() {
  return {
    description: 'Time-series data is organized by measurement name, timestamp, value, and optional tags.',
    measurements: Object.keys(store).map(name => ({
      name,
      points: (store[name] || []).length,
      tags: store[name]?.[0] ? Object.keys(store[name][0].tags) : [],
    })),
  };
}

async function query(operation, params = {}) {
  load();
  const start = performance.now();

  switch (operation) {
    case 'write': {
      if (!store[params.metric]) store[params.metric] = [];
      store[params.metric].push({
        timestamp: params.timestamp || Date.now(),
        value: params.value,
        tags: params.tags || {},
      });
      save();
      return { ok: true, duration: elapsed(start) };
    }
    case 'range': {
      const metric = store[params.metric] || [];
      const from = params.from || 0;
      const to = params.to || Date.now();
      const rows = metric.filter(p => p.timestamp >= from && p.timestamp <= to);
      return { rows, duration: elapsed(start) };
    }
    case 'aggregate': {
      const metric = store[params.metric] || [];
      const from = params.from || 0;
      const to = params.to || Date.now();
      const points = metric.filter(p => p.timestamp >= from && p.timestamp <= to);
      const values = points.map(p => p.value);
      const fn = params.func || 'avg';
      const aggFns = {
        avg: arr => arr.reduce((a, b) => a + b, 0) / arr.length,
        sum: arr => arr.reduce((a, b) => a + b, 0),
        min: arr => Math.min(...arr),
        max: arr => Math.max(...arr),
        count: arr => arr.length,
        first: arr => arr[0],
        last: arr => arr[arr.length - 1],
      };
      const value = aggFns[fn] ? aggFns[fn](values) : null;
      return { value: Math.round(value * 100) / 100, func: fn, points: values.length, duration: elapsed(start) };
    }
    case 'downsample': {
      const metric = store[params.metric] || [];
      const from = params.from || 0;
      const to = params.to || Date.now();
      const every = params.every || 3600000; // 1 hour
      const points = metric.filter(p => p.timestamp >= from && p.timestamp <= to);
      const buckets = {};
      points.forEach(p => {
        const bucket = Math.floor(p.timestamp / every) * every;
        if (!buckets[bucket]) buckets[bucket] = [];
        buckets[bucket].push(p.value);
      });
      const rows = Object.entries(buckets).map(([ts, vals]) => ({
        timestamp: Number(ts),
        value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100,
        points: vals.length,
      }));
      return { rows, duration: elapsed(start) };
    }
    case 'list_metrics': {
      return {
        metrics: Object.keys(store).map(name => ({
          name,
          points: store[name].length,
          first: store[name][0]?.timestamp,
          last: store[name][store[name].length - 1]?.timestamp,
        })),
        duration: elapsed(start),
      };
    }
    default:
      throw new Error(`TimeSeries supports: write, range, aggregate, downsample, list_metrics`);
  }
}

function elapsed(start) {
  return Math.round((performance.now() - start) * 100) / 100;
}

module.exports = { info, schema, query, reset, seed };
