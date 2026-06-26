const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mongodb.json');
let collections = {};

function load() {
  try { if (fs.existsSync(DB_PATH)) collections = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { collections = {}; }
}

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(collections, null, 2));
}

function reset() { collections = {}; save(); return { ok: true }; }

function seed() {
  reset();
  collections = {
    users: [
      { _id: 'u1', name: 'Alice', email: 'alice@example.com', age: 30, tags: ['admin', 'developer'], address: { city: 'Tokyo', country: 'Japan' }, createdAt: new Date('2024-01-15').toISOString() },
      { _id: 'u2', name: 'Bob', email: 'bob@example.com', age: 25, tags: ['developer'], address: { city: 'Paris', country: 'France' }, createdAt: new Date('2024-02-20').toISOString() },
      { _id: 'u3', name: 'Charlie', email: 'charlie@example.com', age: 35, tags: ['designer', 'admin'], address: { city: 'London', country: 'UK' }, createdAt: new Date('2024-03-10').toISOString() },
      { _id: 'u4', name: 'Diana', email: 'diana@example.com', age: 28, tags: ['developer'], address: { city: 'Tokyo', country: 'Japan' }, createdAt: new Date('2024-04-05').toISOString() },
      { _id: 'u5', name: 'Eve', email: 'eve@example.com', age: 32, tags: ['manager'], address: { city: 'Berlin', country: 'Germany' }, createdAt: new Date('2024-05-12').toISOString() },
    ],
    orders: [
      { _id: 'o1', userId: 'u1', product: 'Laptop', amount: 999.99, status: 'completed', items: [{ name: 'MacBook Pro', qty: 1, price: 999.99 }], createdAt: new Date('2024-06-01').toISOString() },
      { _id: 'o2', userId: 'u1', product: 'Mouse', amount: 29.99, status: 'completed', items: [{ name: 'Magic Mouse', qty: 2, price: 14.99 }], createdAt: new Date('2024-06-05').toISOString() },
      { _id: 'o3', userId: 'u2', product: 'Keyboard', amount: 149.99, status: 'pending', items: [{ name: 'Mechanical KB', qty: 1, price: 149.99 }], createdAt: new Date('2024-06-10').toISOString() },
      { _id: 'o4', userId: 'u3', product: 'Monitor', amount: 599.99, status: 'completed', items: [{ name: '4K Display', qty: 1, price: 599.99 }], createdAt: new Date('2024-06-15').toISOString() },
      { _id: 'o5', userId: 'u2', product: 'Cable', amount: 19.99, status: 'cancelled', items: [{ name: 'USB-C Cable', qty: 3, price: 6.66 }], createdAt: new Date('2024-06-20').toISOString() },
      { _id: 'o6', userId: 'u4', product: 'Laptop', amount: 1299.99, status: 'completed', items: [{ name: 'ThinkPad X1', qty: 1, price: 1299.99 }], createdAt: new Date('2024-06-25').toISOString() },
    ],
    products: [
      { _id: 'p1', name: 'MacBook Pro', category: 'laptops', price: 999.99, specs: { ram: 16, storage: 512, cpu: 'M2' }, inStock: true },
      { _id: 'p2', name: 'ThinkPad X1', category: 'laptops', price: 1299.99, specs: { ram: 32, storage: 1024, cpu: 'i7' }, inStock: true },
      { _id: 'p3', name: 'Magic Mouse', category: 'accessories', price: 14.99, specs: { color: 'white', wireless: true }, inStock: true },
      { _id: 'p4', name: 'Mechanical KB', category: 'accessories', price: 149.99, specs: { switches: 'cherry-mx', backlit: true }, inStock: false },
      { _id: 'p5', name: '4K Display', category: 'monitors', price: 599.99, specs: { size: 27, resolution: '4K', panel: 'IPS' }, inStock: true },
    ],
  };
  save();
  return { ok: true, collections: Object.keys(collections).map(k => k + ':' + collections[k].length) };
}

function info() {
  return {
    name: 'MongoDB (Document)',
    type: 'document',
    description: 'Document-oriented NoSQL database. Stores JSON-like documents with flexible schemas. The most popular NoSQL database.',
    strengths: ['Flexible schema', 'Rich query language', 'Horizontal scaling', 'Aggregation pipeline'],
    useCases: ['Content management', 'User profiles', 'Product catalogs', 'Real-time analytics', 'Mobile backends'],
    color: '#10b981',
  };
}

function schema() {
  return {
    description: 'Documents are stored in collections (like tables). Each document has a unique _id and flexible fields.',
    collections: Object.entries(collections).map(([name, docs]) => ({
      name,
      count: docs.length,
      fields: docs.length > 0 ? [...new Set(docs.flatMap(d => Object.keys(d)))] : [],
    })),
  };
}

function matchFilter(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  return Object.entries(filter).every(([key, val]) => {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      if ('$gt' in val && !(doc[key] > val.$gt)) return false;
      if ('$gte' in val && !(doc[key] >= val.$gte)) return false;
      if ('$lt' in val && !(doc[key] < val.$lt)) return false;
      if ('$lte' in val && !(doc[key] <= val.$lte)) return false;
      if ('$in' in val && !val.$in.includes(doc[key])) return false;
      if ('$ne' in val && doc[key] === val.$ne) return false;
      if ('$exists' in val) {
        if (val.$exists && doc[key] === undefined) return false;
        if (!val.$exists && doc[key] !== undefined) return false;
      }
      if ('$elemMatch' in val) {
        if (!Array.isArray(doc[key])) return false;
        return doc[key].some(item => matchFilter(item, val.$elemMatch));
      }
      // Nested field matching (e.g., "address.city")
      return Object.keys(val).every(k => {
        if (k.startsWith('$')) return true;
        return matchFilter(doc[key] || {}, { [k]: val[k] });
      });
    }
    if (typeof val === 'string' && key.includes('.')) {
      const parts = key.split('.');
      let current = doc;
      for (const p of parts) { current = current?.[p]; }
      return current === val;
    }
    return doc[key] === val;
  });
}

function applyProjection(doc, projection) {
  if (!projection || Object.keys(projection).length === 0) return doc;
  const result = { _id: doc._id };
  Object.entries(projection).forEach(([key, val]) => {
    if (val === 1) result[key] = doc[key];
    if (val === 0 && key !== '_id') delete result._id; // exclude
  });
  return result;
}

async function query(operation, params = {}) {
  load();
  const start = performance.now();

  switch (operation) {
    case 'find': {
      const col = collections[params.collection] || [];
      const filtered = col.filter(doc => matchFilter(doc, params.filter));
      const projected = params.projection ? filtered.map(d => applyProjection(d, params.projection)) : filtered;
      const sorted = params.sort ? projected.sort((a, b) => {
        for (const [k, v] of Object.entries(params.sort)) {
          if (a[k] < b[k]) return -v;
          if (a[k] > b[k]) return v;
        }
        return 0;
      }) : projected;
      const result = params.limit ? sorted.slice(0, params.limit) : sorted;
      return { docs: result, count: result.length, duration: elapsed(start) };
    }
    case 'findOne': {
      const col = collections[params.collection] || [];
      const doc = col.find(d => matchFilter(d, params.filter));
      return { doc: doc || null, duration: elapsed(start) };
    }
    case 'insertOne': {
      if (!collections[params.collection]) collections[params.collection] = [];
      const doc = { _id: 'auto_' + Date.now(), ...params.doc };
      collections[params.collection].push(doc);
      save();
      return { insertedId: doc._id, duration: elapsed(start) };
    }
    case 'updateOne': {
      const col = collections[params.collection] || [];
      const doc = col.find(d => matchFilter(d, params.filter));
      if (doc) {
        if (params.update.$set) Object.assign(doc, params.update.$set);
        if (params.update.$inc) {
          for (const [k, v] of Object.entries(params.update.$inc)) {
            doc[k] = (doc[k] || 0) + v;
          }
        }
        if (params.update.$push) {
          for (const [k, v] of Object.entries(params.update.$push)) {
            if (!Array.isArray(doc[k])) doc[k] = [];
            doc[k].push(v);
          }
        }
        save();
      }
      return { matched: doc ? 1 : 0, modified: doc ? 1 : 0, duration: elapsed(start) };
    }
    case 'deleteOne': {
      const col = collections[params.collection] || [];
      const idx = col.findIndex(d => matchFilter(d, params.filter));
      if (idx !== -1) col.splice(idx, 1);
      save();
      return { deleted: idx !== -1 ? 1 : 0, duration: elapsed(start) };
    }
    case 'aggregate': {
      const col = [...(collections[params.collection] || [])];
      let pipeline = params.pipeline || [];
      let results = col;

      for (const stage of pipeline) {
        if (stage.$match) {
          results = results.filter(d => matchFilter(d, stage.$match));
        }
        if (stage.$group) {
          const groups = {};
          results.forEach(doc => {
            let key;
            if (stage.$group._id === null) key = '__all__';
            else if (typeof stage.$group._id === 'string' && stage.$group._id.startsWith('$')) {
              key = doc[stage.$group._id.slice(1)];
            } else key = JSON.stringify(stage.$group._id);
            if (!groups[key]) groups[key] = [];
            groups[key].push(doc);
          });
          results = Object.entries(groups).map(([key, docs]) => {
            const result = { _id: key === '__all__' ? null : key };
            for (const [field, op] of Object.entries(stage.$group)) {
              if (field === '_id') continue;
              if (op.$sum) result[field] = docs.reduce((s, d) => s + (typeof op.$sum === 'string' ? (d[op.$sum.slice(1)] || 0) : op.$sum), 0);
              if (op.$avg) result[field] = docs.reduce((s, d) => s + (d[op.$avg.slice(1)] || 0), 0) / docs.length;
              if (op.$max) result[field] = Math.max(...docs.map(d => d[op.$max.slice(1)] || 0));
              if (op.$min) result[field] = Math.min(...docs.map(d => d[op.$min.slice(1)] || 0));
              if (op.$count) result[field] = docs.length;
              if (op.$push) result[field] = docs.map(d => d[op.$push.slice(1)]);
              if (op.$first) result[field] = docs[0][op.$first.slice(1)];
              if (op.$last) result[field] = docs[docs.length - 1][op.$last.slice(1)];
            }
            return result;
          });
        }
        if (stage.$sort) {
          results.sort((a, b) => {
            for (const [k, v] of Object.entries(stage.$sort)) {
              if (a[k] < b[k]) return -v;
              if (a[k] > b[k]) return v;
            }
            return 0;
          });
        }
        if (stage.$limit) results = results.slice(0, stage.$limit);
        if (stage.$skip) results = results.slice(stage.$skip);
        if (stage.$project) {
          results = results.map(doc => applyProjection(doc, stage.$project));
        }
        if (stage.$unwind) {
          const field = stage.$unwind.startsWith('$') ? stage.$unwind.slice(1) : stage.$unwind;
          const unwound = [];
          results.forEach(doc => {
            if (Array.isArray(doc[field])) {
              doc[field].forEach(item => unwound.push({ ...doc, [field]: item }));
            } else {
              unwound.push(doc);
            }
          });
          results = unwound;
        }
      }
      return { docs: results, count: results.length, duration: elapsed(start) };
    }
    default:
      throw new Error(`MongoDB supports: find, findOne, insertOne, updateOne, deleteOne, aggregate`);
  }
}

function elapsed(start) { return Math.round((performance.now() - start) * 100) / 100; }

module.exports = { info, schema, query, reset, seed };
