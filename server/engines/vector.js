const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'vectors.json');
let vectors = [];

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      vectors = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch { vectors = []; }
}

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(vectors, null, 2));
}

function reset() {
  vectors = [];
  save();
  return { ok: true };
}

function cosineSimilarity(a, b) {
  if (a.length !== b.length) throw new Error('Dimension mismatch');
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function seed() {
  reset();
  const documents = [
    { id: 'doc1', text: 'PostgreSQL is a relational database with ACID compliance', category: 'database', vector: [0.9, 0.1, 0.8, 0.2, 0.5, 0.3] },
    { id: 'doc2', text: 'MongoDB stores data in flexible JSON-like documents', category: 'database', vector: [0.8, 0.3, 0.6, 0.4, 0.5, 0.2] },
    { id: 'doc3', text: 'Redis is an in-memory key-value store for caching', category: 'database', vector: [0.7, 0.5, 0.3, 0.6, 0.4, 0.8] },
    { id: 'doc4', text: 'Elasticsearch is a search engine based on Apache Lucene', category: 'search', vector: [0.6, 0.4, 0.5, 0.7, 0.3, 0.6] },
    { id: 'doc5', text: 'Neo4j is a native graph database platform', category: 'database', vector: [0.8, 0.2, 0.7, 0.3, 0.6, 0.4] },
    { id: 'doc6', text: 'InfluxDB is designed for time-series data at scale', category: 'database', vector: [0.7, 0.4, 0.6, 0.5, 0.7, 0.3] },
    { id: 'doc7', text: 'Vector databases store high-dimensional embeddings for AI', category: 'ai', vector: [0.5, 0.6, 0.4, 0.8, 0.2, 0.7] },
    { id: 'doc8', text: 'Machine learning models process numerical feature vectors', category: 'ai', vector: [0.4, 0.7, 0.3, 0.9, 0.1, 0.8] },
    { id: 'doc9', text: 'Neural networks learn representations from data', category: 'ai', vector: [0.3, 0.8, 0.2, 0.9, 0.1, 0.7] },
    { id: 'doc10', text: 'Apache Kafka handles real-time data streaming', category: 'streaming', vector: [0.6, 0.5, 0.4, 0.6, 0.5, 0.5] },
    { id: 'doc11', text: 'ClickHouse is a columnar OLAP database for analytics', category: 'database', vector: [0.8, 0.3, 0.7, 0.4, 0.6, 0.3] },
    { id: 'doc12', text: 'GraphQL provides a query language for APIs', category: 'api', vector: [0.5, 0.4, 0.6, 0.5, 0.3, 0.6] },
  ];
  vectors = documents;
  save();
  return { ok: true, count: documents.length };
}

function info() {
  return {
    name: 'Vector Database',
    type: 'vector',
    description: 'Stores and retrieves high-dimensional vectors using approximate nearest neighbor search.',
    strengths: ['Semantic search', 'Similarity matching', 'High-dimensional indexing', 'ANN algorithms'],
    useCases: ['RAG (Retrieval Augmented Generation)', 'Image similarity', 'Recommendation systems', 'Semantic search', 'Anomaly detection'],
    color: '#ec4899',
  };
}

function schema() {
  return {
    description: 'Vector databases store embeddings (arrays of floats) and enable similarity search.',
    fields: ['id', 'text', 'category', 'vector (embedding)'],
    dimension: vectors[0]?.vector?.length || 0,
  };
}

async function query(operation, params = {}) {
  load();
  const start = performance.now();

  switch (operation) {
    case 'insert': {
      vectors.push({
        id: params.id,
        text: params.text,
        category: params.category || 'general',
        vector: params.vector,
      });
      save();
      return { ok: true, count: vectors.length, duration: elapsed(start) };
    }
    case 'search': {
      const queryVector = params.vector;
      const topK = params.topK || 5;
      const results = vectors.map(v => ({
        ...v,
        score: cosineSimilarity(queryVector, v.vector),
      })).sort((a, b) => b.score - a.score).slice(0, topK);
      return { results, duration: elapsed(start) };
    }
    case 'search_by_text': {
      // Simple TF-IDF-like search for demonstration
      const query = (params.query || '').toLowerCase().split(/\s+/);
      const results = vectors.map(v => {
        const words = v.text.toLowerCase().split(/\s+/);
        const score = query.reduce((s, q) => s + words.filter(w => w.includes(q)).length, 0) / query.length;
        return { ...v, score };
      }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
      return { results, duration: elapsed(start) };
    }
    case 'list': {
      return { vectors, duration: elapsed(start) };
    }
    case 'delete': {
      vectors = vectors.filter(v => v.id !== params.id);
      save();
      return { ok: true, remaining: vectors.length, duration: elapsed(start) };
    }
    default:
      throw new Error(`Vector DB supports: insert, search, search_by_text, list, delete`);
  }
}

function elapsed(start) {
  return Math.round((performance.now() - start) * 100) / 100;
}

module.exports = { info, schema, query, reset, seed };
