const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const sqliteEngine = require('./engines/sqlite');
const levelEngine = require('./engines/level');
const graphEngine = require('./engines/graph');
const timeseriesEngine = require('./engines/timeseries');
const vectorEngine = require('./engines/vector');
const mongodbEngine = require('./engines/mongodb');
const supabaseEngine = require('./engines/supabase');
const firestoreEngine = require('./engines/firestore');

const app = express();
const http = createServer(app);
const io = new Server(http, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Serve static client build in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

const engines = {
  sqlite: sqliteEngine,
  level: levelEngine,
  graph: graphEngine,
  timeseries: timeseriesEngine,
  vector: vectorEngine,
  mongodb: mongodbEngine,
};

const providers = {
  supabase: supabaseEngine,
  firestore: firestoreEngine,
};

// Cloud provider endpoints
app.get('/api/providers', (req, res) => {
  res.json(Object.keys(providers).map(k => ({ id: k, ...providers[k].info() })));
});

app.get('/api/providers/:provider', (req, res) => {
  const provider = providers[req.params.provider];
  if (!provider) return res.status(404).json({ error: 'Provider not found' });
  res.json(provider.info());
});

app.post('/api/providers/:provider/query', async (req, res) => {
  const provider = providers[req.params.provider];
  if (!provider) return res.status(404).json({ error: 'Provider not found' });
  try {
    const result = await provider.query(req.body.operation, req.body.params);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List available engines
app.get('/api/engines', (req, res) => {
  res.json(Object.keys(engines));
});

// Get engine info
app.get('/api/engines/:engine', (req, res) => {
  const engine = engines[req.params.engine];
  if (!engine) return res.status(404).json({ error: 'Engine not found' });
  res.json(engine.info());
});

// Execute query on any engine
app.post('/api/engines/:engine/query', async (req, res) => {
  const engine = engines[req.params.engine];
  if (!engine) return res.status(404).json({ error: 'Engine not found' });
  try {
    const result = await engine.query(req.body.operation || req.body.query, req.body.params);
    io.emit('query-result', { engine: req.params.engine, query: req.body.operation || req.body.query, result });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get schema/structure
app.get('/api/engines/:engine/schema', (req, res) => {
  const engine = engines[req.params.engine];
  if (!engine) return res.status(404).json({ error: 'Engine not found' });
  res.json(engine.schema());
});

// Reset engine data
app.post('/api/engines/:engine/reset', (req, res) => {
  const engine = engines[req.params.engine];
  if (!engine) return res.status(404).json({ error: 'Engine not found' });
  engine.reset();
  res.json({ ok: true });
});

// Compare query across engines
app.post('/api/compare', async (req, res) => {
  const { concept, params } = req.body;
  const results = {};
  for (const [name, engine] of Object.entries(engines)) {
    if (engine.hasConcept && engine.hasConcept(concept)) {
      try {
        results[name] = await engine.query(concept, params);
      } catch (err) {
        results[name] = { error: err.message };
      }
    }
  }
  res.json(results);
});

// Progressive lessons
app.get('/api/lessons', (req, res) => {
  res.json(require('./lessons'));
});

app.get('/api/lessons/:id', (req, res) => {
  const lessons = require('./lessons');
  const lesson = lessons.find(l => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  res.json(lesson);
});

// Catch-all: serve client for any non-API route (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 3001;

// Auto-seed databases on first start
function autoSeed() {
  try {
    console.log('Seeding databases...');
    Object.values(engines).forEach(e => {
      if (e.reset) e.reset();
      if (e.seed) e.seed();
    });
    console.log('Databases seeded successfully.');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}
autoSeed();

http.listen(PORT, () => {
  console.log(`DB Explorer server running on port ${PORT}`);
  console.log('Engines:', Object.keys(engines).join(', '));
  console.log(`Client: http://localhost:${PORT}`);
});
