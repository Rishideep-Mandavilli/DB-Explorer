let admin = null;

function getClient() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!projectId || !serviceAccount) return null;
  if (!admin) {
    const firebaseAdmin = require('firebase-admin');
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(JSON.parse(serviceAccount)),
    });
    admin = firebaseAdmin;
  }
  return admin;
}

function info() {
  const connected = !!getClient();
  return {
    name: 'Firebase Firestore',
    type: 'cloud-document',
    description: 'Google\'s NoSQL document database. Real-time sync, offline support, automatic scaling.',
    connected,
    strengths: ['Real-time sync', 'Offline-first', 'Automatic scaling', 'Rich query language'],
    useCases: ['Mobile apps', 'Real-time chat', 'Gaming leaderboards', 'Collaborative editing'],
    color: '#f59e0b',
    setup: connected ? null : {
      steps: [
        'Go to console.firebase.google.com',
        'Create a project or select existing',
        'Generate a service account key (Project Settings → Service Accounts)',
        'Set FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT',
        'Restart the server',
      ],
      env: { FIREBASE_PROJECT_ID: 'your-project-id', FIREBASE_SERVICE_ACCOUNT: 'JSON string' },
    },
  };
}

async function query(operation, params = {}) {
  const client = getClient();
  if (!client) {
    return {
      demo: true,
      message: 'Firebase not configured. Here\'s how Firestore works:',
      code: getQueryCode(operation, params),
      explanation: getQueryExplanation(operation),
    };
  }

  const db = client.firestore();
  const collection = params.collection || 'users';
  const start = performance.now();

  switch (operation) {
    case 'get': {
      if (params.id) {
        const doc = await db.collection(collection).doc(params.id).get();
        return { data: doc.exists ? { id: doc.id, ...doc.data() } : null, duration: elapsed(start) };
      }
      const snapshot = await db.collection(collection).limit(params.limit || 10).get();
      const rows = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return { rows, duration: elapsed(start) };
    }
    case 'add': {
      const ref = await db.collection(collection).add(params.data);
      return { id: ref.id, duration: elapsed(start) };
    }
    case 'set': {
      await db.collection(collection).doc(params.id).set(params.data);
      return { ok: true, duration: elapsed(start) };
    }
    case 'update': {
      await db.collection(collection).doc(params.id).update(params.update);
      return { ok: true, duration: elapsed(start) };
    }
    case 'delete': {
      await db.collection(collection).doc(params.id).delete();
      return { ok: true, duration: elapsed(start) };
    }
    case 'query': {
      let ref = db.collection(collection);
      if (params.where) {
        params.where.forEach(w => { ref = ref.where(w.field, w.op, w.value); });
      }
      ref = ref.orderBy(params.orderBy || 'createdAt', params.direction || 'desc').limit(params.limit || 10);
      const snapshot = await ref.get();
      return { rows: snapshot.docs.map(d => ({ id: d.id, ...d.data() })), duration: elapsed(start) };
    }
    default:
      throw new Error(`Firestore supports: get, add, set, update, delete, query`);
  }
}

function getQueryCode(op, params) {
  const col = params.collection || 'users';
  switch (op) {
    case 'get':
      return `// Get all documents in '${col}'\nconst snapshot = await db.collection('${col}').get();\nsnapshot.forEach(doc => {\n  console.log(doc.id, doc.data());\n});`;
    case 'query':
      return `// Query with filters\nconst snapshot = await db.collection('${col}')\n  .where('age', '>=', 18)\n  .orderBy('name')\n  .limit(10)\n  .get();`;
    case 'add':
      return `// Add a new document (auto-generated ID)\nconst ref = await db.collection('${col}').add({\n  name: 'Alice',\n  age: 30,\n  createdAt: firebase.firestore.FieldValue.serverTimestamp()\n});\nconsole.log('Added:', ref.id);`;
    case 'subscribe':
      return `// Real-time listener (Firestore's killer feature)\ndb.collection('${col}')\n  .onSnapshot(snapshot => {\n    snapshot.docChanges().forEach(change => {\n      console.log(change.type, change.doc.data());\n    });\n  });`;
    default: return `// ${op} on ${col}`;
  }
}

function getQueryExplanation(op) {
  return {
    get: 'Firestore stores data as documents in collections. Each document has a unique ID and a JSON-like structure.',
    query: 'Firestore queries work across a single collection. No JOINs — denormalize your data instead.',
    subscribe: 'Firestore\'s real-time listeners use WebSockets to push changes. This is its biggest advantage over traditional databases.',
    add: 'Firestore auto-generates document IDs and supports offline writes that sync when reconnected.',
  }[op] || '';
}

function elapsed(start) {
  return Math.round((performance.now() - start) * 100) / 100;
}

module.exports = { info, query };
