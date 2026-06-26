import { Server, Play } from 'lucide-react';

export default function ServerNotice({ message }) {
  return (
    <div className="card border-dashed border-gray-700 bg-gray-900/40">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-3">
          <Server className="w-6 h-6 text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Backend Server Required</h3>
        <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-3">
          {message || 'This feature requires the Express backend server to be running. The server handles database queries and engine operations.'}
        </p>
        <div className="code-block text-xs text-gray-400 mb-3">
          <span className="text-green-400">$</span> cd db-explorer && npm run dev
        </div>
        <p className="text-[11px] text-gray-600">Server runs on port 3001, client on port 5173</p>
      </div>
    </div>
  );
}
