import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

const CAP_COLORS = {
  C: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Consistency' },
  A: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', label: 'Availability' },
  P: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', label: 'Partition Tolerance' },
};

export default function CapExplorer({ data }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">The CAP Triangle</h2>
        <p className="text-gray-400 text-sm mb-6">
          In a distributed system, you can only guarantee <strong className="text-white">two of three</strong> properties.
          Since network partitions are inevitable, you choose between <strong className="text-blue-400">Consistency</strong> and <strong className="text-green-400">Availability</strong>.
        </p>

        <div className="relative w-80 h-80 mx-auto mb-6">
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <defs>
              <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <polygon points="150,30 30,270 270,270" fill="url(#triGrad)" stroke="#374151" strokeWidth="2" />
            {/* Labels */}
            <text x="150" y="22" textAnchor="middle" fill="#3b82f6" fontSize="13" fontWeight="bold">Consistency</text>
            <text x="18" y="288" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">Availability</text>
            <text x="282" y="288" textAnchor="middle" fill="#8b5cf6" fontSize="13" fontWeight="bold">Partition</text>
            {/* Zones */}
            <circle cx="90" cy="155" r="28" fill="#3b82f6" fillOpacity="0.08" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="90" y="158" textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="bold">CP</text>
            <circle cx="150" cy="242" r="28" fill="#10b981" fillOpacity="0.08" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="150" y="245" textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="bold">AP</text>
            <circle cx="210" cy="155" r="28" fill="#8b5cf6" fillOpacity="0.08" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="210" y="158" textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="bold">CA</text>
          </svg>
        </div>

        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-cyan-400 font-medium mb-2">
            <Lightbulb className="w-4 h-4" /> PACELC Extension
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            CAP says: during a partition, choose A or C. But what about normal operation? PACELC adds: <strong className="text-gray-300">else</strong> (no partition), choose <strong className="text-gray-300">Latency</strong> or <strong className="text-gray-300">Consistency</strong>.
            This explains why Cassandra is AP + EL (low latency), and PostgreSQL is CP + EC (consistent reads).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.systems.map(sys => (
          <div
            key={sys.name}
            className={`card-interactive ${selected?.name === sys.name ? 'glow-border !bg-blue-500/5' : ''}`}
            onClick={() => setSelected(selected?.name === sys.name ? null : sys)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{sys.name}</h3>
              <span className={`badge ${sys.type === 'CP' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                {sys.type}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {sys.caps.map(cap => (
                <span key={cap} className={`badge ${CAP_COLORS[cap].bg} ${CAP_COLORS[cap].text} ${CAP_COLORS[cap].border}`}>
                  {CAP_COLORS[cap].label}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{sys.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
