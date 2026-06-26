const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'graph.json');
let graph = { nodes: [], edges: [] };

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      graph = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch { graph = { nodes: [], edges: [] }; }
}

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(graph, null, 2));
}

function reset() {
  graph = { nodes: [], edges: [] };
  save();
  return { ok: true };
}

function seed() {
  reset();
  graph = {
    nodes: [
      { id: 'alice', type: 'Person', props: { name: 'Alice', age: 30 } },
      { id: 'bob', type: 'Person', props: { name: 'Bob', age: 25 } },
      { id: 'charlie', type: 'Person', props: { name: 'Charlie', age: 35 } },
      { id: 'db1', type: 'Project', props: { name: 'DB Explorer', lang: 'JavaScript' } },
      { id: 'db2', type: 'Project', props: { name: 'Graph Engine', lang: 'Python' } },
      { id: 'tokyo', type: 'City', props: { name: 'Tokyo', country: 'Japan' } },
      { id: 'paris', type: 'City', props: { name: 'Paris', country: 'France' } },
      { id: 'js', type: 'Skill', props: { name: 'JavaScript', level: 9 } },
      { id: 'python', type: 'Skill', props: { name: 'Python', level: 7 } },
      { id: 'sql', type: 'Skill', props: { name: 'SQL', level: 8 } },
    ],
    edges: [
      { from: 'alice', to: 'db1', type: 'WORKS_ON', props: { since: 2023 } },
      { from: 'bob', to: 'db1', type: 'WORKS_ON', props: { since: 2024 } },
      { from: 'charlie', to: 'db2', type: 'WORKS_ON', props: { since: 2023 } },
      { from: 'alice', to: 'bob', type: 'FRIENDS_WITH', props: {} },
      { from: 'bob', to: 'charlie', type: 'FRIENDS_WITH', props: {} },
      { from: 'alice', to: 'tokyo', type: 'LIVES_IN', props: {} },
      { from: 'bob', to: 'paris', type: 'LIVES_IN', props: {} },
      { from: 'alice', to: 'js', type: 'KNOWS', props: { years: 5 } },
      { from: 'alice', to: 'sql', type: 'KNOWS', props: { years: 3 } },
      { from: 'bob', to: 'python', type: 'KNOWS', props: { years: 4 } },
      { from: 'charlie', to: 'python', type: 'KNOWS', props: { years: 6 } },
      { from: 'charlie', to: 'sql', type: 'KNOWS', props: { years: 5 } },
    ],
  };
  save();
  return { ok: true, nodes: graph.nodes.length, edges: graph.edges.length };
}

function info() {
  return {
    name: 'Graph Database',
    type: 'graph',
    description: 'In-memory graph database simulating Neo4j/JanusGraph. Nodes and edges with properties.',
    strengths: ['Relationship queries', 'Path finding', 'Pattern matching', 'Traversal performance'],
    useCases: ['Social networks', 'Recommendations', 'Knowledge graphs', 'Fraud detection', 'Network topology'],
    color: '#8b5cf6',
  };
}

function schema() {
  return {
    description: 'Graph databases have nodes (entities) and edges (relationships). Both can have properties.',
    nodeTypes: [...new Set(graph.nodes.map(n => n.type))],
    edgeTypes: [...new Set(graph.edges.map(e => e.type))],
    stats: {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
    },
  };
}

function bfs(startId, maxDepth = 3) {
  const visited = new Set();
  const result = { nodes: [], edges: [] };
  const queue = [{ id: startId, depth: 0 }];
  visited.add(startId);

  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    if (depth > maxDepth) continue;

    const node = graph.nodes.find(n => n.id === id);
    if (node) result.nodes.push(node);

    graph.edges.filter(e => e.from === id || e.to === id).forEach(e => {
      result.edges.push(e);
      const next = e.from === id ? e.to : e.from;
      if (!visited.has(next)) {
        visited.add(next);
        queue.push({ id: next, depth: depth + 1 });
      }
    });
  }
  return result;
}

function findPath(start, end, maxDepth = 5) {
  const visited = new Map();
  const queue = [{ id: start, path: [start] }];
  visited.set(start, 0);

  while (queue.length > 0) {
    const { id, path: currentPath } = queue.shift();
    if (currentPath.length > maxDepth) continue;

    if (id === end) {
      return {
        path: currentPath.map(id => graph.nodes.find(n => n.id === id)).filter(Boolean),
        edges: currentPath.slice(1).map((id, i) =>
          graph.edges.find(e =>
            (e.from === currentPath[i] && e.to === id) ||
            (e.from === id && e.to === currentPath[i])
          )
        ).filter(Boolean),
      };
    }

    graph.edges.filter(e => e.from === id || e.to === id).forEach(e => {
      const next = e.from === id ? e.to : e.from;
      if (!visited.has(next)) {
        visited.set(next, (visited.get(id) || 0) + 1);
        queue.push({ id: next, path: [...currentPath, next] });
      }
    });
  }
  return null;
}

async function query(operation, params = {}) {
  load();
  const start = performance.now();

  switch (operation) {
    case 'bfs': {
      const result = bfs(params.from, params.depth || 3);
      return { ...result, duration: elapsed(start) };
    }
    case 'shortest_path': {
      const result = findPath(params.from, params.to, params.depth || 5);
      return { found: !!result, ...result, duration: elapsed(start) };
    }
    case 'neighbors': {
      const node = graph.nodes.find(n => n.id === params.node);
      const edges = graph.edges.filter(e => e.from === params.node || e.to === params.node);
      const neighbors = edges.map(e => {
        const nextId = e.from === params.node ? e.to : e.from;
        return { ...graph.nodes.find(n => n.id === nextId), edge: e };
      });
      return { node, neighbors, duration: elapsed(start) };
    }
    case 'add_node': {
      graph.nodes.push({ id: params.id, type: params.type, props: params.props || {} });
      save();
      return { ok: true, node: graph.nodes[graph.nodes.length - 1], duration: elapsed(start) };
    }
    case 'add_edge': {
      graph.edges.push({ from: params.from, to: params.to, type: params.type, props: params.props || {} });
      save();
      return { ok: true, edge: graph.edges[graph.edges.length - 1], duration: elapsed(start) };
    }
    case 'search': {
      const q = (params.query || '').toLowerCase();
      const nodes = graph.nodes.filter(n =>
        n.id.includes(q) || n.type.toLowerCase().includes(q) ||
        Object.values(n.props).some(v => String(v).toLowerCase().includes(q))
      );
      return { nodes, duration: elapsed(start) };
    }
    default:
      throw new Error(`Graph supports: bfs, shortest_path, neighbors, add_node, add_edge, search`);
  }
}

function elapsed(start) {
  return Math.round((performance.now() - start) * 100) / 100;
}

module.exports = { info, schema, query, reset, seed };
