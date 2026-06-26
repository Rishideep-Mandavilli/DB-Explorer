let supabase = null;

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!supabase) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(url, key);
  }
  return supabase;
}

function info() {
  const connected = !!getClient();
  return {
    name: 'Supabase',
    type: 'cloud-relational',
    description: 'Open source Firebase alternative built on PostgreSQL. Provides REST API, real-time subscriptions, auth, and storage.',
    connected,
    strengths: ['PostgreSQL under the hood', 'Real-time subscriptions', 'Row-level security', 'Auto-generated REST API'],
    useCases: ['Web app backends', 'Real-time features', 'User authentication', 'File storage'],
    color: '#10b981',
    setup: connected ? null : {
      steps: [
        'Create account at supabase.com',
        'Create a new project',
        'Get your Project URL and Anon Key from Settings → API',
        'Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables',
        'Restart the server',
      ],
      env: { SUPABASE_URL: 'your-project-url', SUPABASE_ANON_KEY: 'your-anon-key' },
    },
  };
}

async function query(operation, params = {}) {
  const client = getClient();
  if (!client) {
    return {
      demo: true,
      message: 'Supabase not configured. Here\'s what the query would look like:',
      code: getQueryCode(operation, params),
      explanation: getQueryExplanation(operation),
    };
  }

  const start = performance.now();
  const table = params.table || 'users';

  switch (operation) {
    case 'select': {
      const { data, error } = await client.from(table).select(params.columns || '*').limit(params.limit || 100);
      if (error) throw new Error(error.message);
      return { rows: data, duration: elapsed(start) };
    }
    case 'insert': {
      const { data, error } = await client.from(table).insert(params.row);
      if (error) throw new Error(error.message);
      return { data, duration: elapsed(start) };
    }
    case 'update': {
      const { data, error } = await client.from(table).update(params.update).eq('id', params.id);
      if (error) throw new Error(error.message);
      return { data, duration: elapsed(start) };
    }
    case 'delete': {
      const { data, error } = await client.from(table).delete().eq('id', params.id);
      if (error) throw new Error(error.message);
      return { data, duration: elapsed(start) };
    }
    case 'rpc': {
      const { data, error } = await client.rpc(params.function, params.args || {});
      if (error) throw new Error(error.message);
      return { data, duration: elapsed(start) };
    }
    case 'subscribe': {
      // Real-time subscription demo
      return {
        demo: true,
        code: `const channel = supabase\n  .channel('changes')\n  .on('postgres_changes',\n    { event: '*', schema: 'public', table: '${table}' },\n    (payload) => console.log(payload)\n  )\n  .subscribe()`,
        explanation: 'Real-time subscriptions push changes to your client as they happen.',
      };
    }
    default:
      throw new Error(`Supabase supports: select, insert, update, delete, rpc, subscribe`);
  }
}

function getQueryCode(op, params) {
  const table = params.table || 'users';
  switch (op) {
    case 'select': return `const { data, error } = await supabase\n  .from('${table}')\n  .select('${params.columns || '*'}')\n  .limit(${params.limit || 10})`;
    case 'insert': return `const { data, error } = await supabase\n  .from('${table}')\n  .insert(${JSON.stringify(params.row || {}, null, 2)})`;
    case 'subscribe': return `supabase\n  .channel('table-changes')\n  .on('postgres_changes',\n    { event: '*', schema: 'public', table: '${table}' },\n    (payload) => console.log(payload)\n  )\n  .subscribe()`;
    default: return `// ${op} on ${table}`;
  }
}

function getQueryExplanation(op) {
  const explanations = {
    select: 'Supabase auto-generates a REST API from your PostgreSQL tables. No backend code needed.',
    insert: 'Insert rows via the client library. Supabase handles validation, auth, and RLS policies.',
    subscribe: 'Real-time: Supabase listens to PostgreSQL\'s WAL (Write-Ahead Log) and pushes changes instantly.',
  };
  return explanations[op] || '';
}

function elapsed(start) {
  return Math.round((performance.now() - start) * 100) / 100;
}

module.exports = { info, query };
