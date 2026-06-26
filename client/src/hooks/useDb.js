import { useState, useEffect, useCallback } from 'react';

export function useQuery(engine, query, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (q, p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/engines/' + engine + '/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q || query, params: p || params }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [engine, query, params]);

  return { data, loading, error, run };
}

export function useEngine(engine) {
  const [info, setInfo] = useState(null);
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    if (!engine) return;
    Promise.all([
      fetch('/api/engines/' + engine).then(r => r.json()),
      fetch('/api/engines/' + engine + '/schema').then(r => r.json()),
    ]).then(([i, s]) => { setInfo(i); setSchema(s); });
  }, [engine]);

  return { info, schema };
}
