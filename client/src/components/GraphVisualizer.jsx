import { useMemo } from 'react';

const NODE_COLORS = {
  Person: '#3b82f6',
  Project: '#10b981',
  City: '#f59e0b',
  Skill: '#8b5cf6',
};

const NODE_ICONS = {
  Person: '👤',
  Project: '📁',
  City: '🏙',
  Skill: '⚡',
};

export default function GraphVisualizer({ data }) {
  const { nodes, edges } = data;

  const positions = useMemo(() => {
    if (!nodes || nodes.length === 0) return {};
    const pos = {};
    const cx = 220, cy = 160, radius = 130;
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      pos[node.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
    return pos;
  }, [nodes]);

  if (!nodes || nodes.length === 0) return <div className="text-gray-500 text-sm py-8 text-center">No nodes found</div>;

  return (
    <div className="bg-gray-950/80 rounded-xl border border-gray-800/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800/50">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-gray-500 font-mono">{nodes.length} nodes • {edges.length} edges</span>
      </div>
      <svg viewBox="0 0 440 320" className="w-full h-72">
        <defs>
          <marker id="arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="#4b5563" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {edges.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;
          return (
            <g key={i}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#374151" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text
                x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace"
              >
                {edge.type}
              </text>
            </g>
          );
        })}

        {nodes.map(node => {
          const pos = positions[node.id];
          if (!pos) return null;
          const color = NODE_COLORS[node.type] || '#6b7280';
          return (
            <g key={node.id}>
              <circle cx={pos.x} cy={pos.y} r="22" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="2" filter="url(#glow)" />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="monospace">
                {node.id.slice(0, 5)}
              </text>
              <text x={pos.x} y={pos.y + 32} textAnchor="middle" fill="#9ca3af" fontSize="7" fontFamily="sans-serif">
                {node.type}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
