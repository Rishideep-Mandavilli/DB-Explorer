const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'sqlite.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function reset() {
  const d = getDb();
  d.exec(`
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;
  `);
  d.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      stock INTEGER DEFAULT 0
    );
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id),
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );
  `);
  return { ok: true };
}

function seed() {
  const d = getDb();
  const insertUser = d.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  const insertCat = d.prepare('INSERT INTO categories (name) VALUES (?)');
  const insertProduct = d.prepare('INSERT INTO products (name, price, category_id, stock) VALUES (?, ?, ?, ?)');
  const insertOrder = d.prepare('INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)');
  const insertItem = d.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');

  const users = [
    ['Alice', 'alice@example.com'],
    ['Bob', 'bob@example.com'],
    ['Charlie', 'charlie@example.com'],
  ];
  const cats = ['Electronics', 'Books', 'Clothing'];
  const products = [
    ['Laptop', 999.99, 1, 50],
    ['Mouse', 29.99, 1, 200],
    ['Database Design Book', 49.99, 2, 100],
    ['T-Shirt', 19.99, 3, 500],
  ];
  const orders = [
    [1, 1029.98, 'completed'],
    [2, 49.99, 'pending'],
    [1, 19.99, 'completed'],
  ];
  const items = [
    [1, 1, 1, 999.99],
    [1, 2, 1, 29.99],
    [2, 3, 1, 49.99],
    [3, 4, 1, 19.99],
  ];

  const tx = d.transaction(() => {
    users.forEach(u => insertUser.run(...u));
    cats.forEach(c => insertCat.run(c));
    products.forEach(p => insertProduct.run(...p));
    orders.forEach(o => insertOrder.run(...o));
    items.forEach(i => insertItem.run(...i));
  });
  tx();
  return { ok: true, inserted: { users: users.length, categories: cats.length, products: products.length, orders: orders.length } };
}

function info() {
  return {
    name: 'SQLite',
    type: 'relational',
    description: 'The most widely deployed database engine. Serverless, zero-configuration, transactional SQL database.',
    strengths: ['Zero config', 'ACID compliant', 'Single-file storage', 'Full SQL support'],
    useCases: ['Embedded apps', 'Mobile apps', 'Prototyping', 'Local data storage'],
    color: '#3b82f6',
  };
}

function schema() {
  const d = getDb();
  try {
    const tables = d.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    const schema = {};
    for (const { name } of tables) {
      schema[name] = d.prepare(`PRAGMA table_info(${name})`).all();
    }
    return schema;
  } catch {
    reset();
    return schema();
  }
}

async function query(sql, params = []) {
  const d = getDb();
  const start = performance.now();
  try {
    const stmt = d.prepare(sql);
    const result = stmt.all(...params);
    const duration = performance.now() - start;
    return {
      rows: result,
      rowCount: result.length,
      duration: Math.round(duration * 100) / 100,
      columns: result.length > 0 ? Object.keys(result[0]) : [],
    };
  } catch (err) {
    throw new Error(`SQLite error: ${err.message}`);
  }
}

module.exports = { info, schema, query, reset, seed, hasConcept: () => true };
