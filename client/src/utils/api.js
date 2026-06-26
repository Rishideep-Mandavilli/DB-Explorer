const API = '/api';

export async function fetchJSON(url, opts = {}) {
  try {
    const res = await fetch(`${API}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Request failed (${res.status})`);
    }
    return res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Backend server not available. Start the server with: npm run dev');
    }
    throw err;
  }
}

export async function getEngines() {
  return fetchJSON('/engines');
}

export async function getEngineInfo(engine) {
  return fetchJSON(`/engines/${engine}`);
}

export async function getSchema(engine) {
  return fetchJSON(`/engines/${engine}/schema`);
}

export async function executeQuery(engine, queryOrOperation, params) {
  return fetchJSON(`/engines/${engine}/query`, {
    method: 'POST',
    body: JSON.stringify({ query: queryOrOperation, operation: queryOrOperation, params }),
  });
}

export async function resetEngine(engine) {
  return fetchJSON(`/engines/${engine}/reset`, { method: 'POST' });
}

export async function getLessons() {
  return fetchJSON('/lessons');
}

export async function getLesson(id) {
  return fetchJSON(`/lessons/${id}`);
}
