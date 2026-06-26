import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Database, Layers, GitBranch, Clock, Cpu, ArrowRight, Search, CheckCircle2, Terminal, Globe, Zap, BarChart3, Layout, Lock, Settings, Cloud } from 'lucide-react';
import { getLessons } from '../utils/api';

const CATEGORY_STYLES = {
  fundamentals: { icon: Database, color: 'bg-blue-600', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  relational: { icon: Database, color: 'bg-blue-600', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'key-value': { icon: Layers, color: 'bg-red-600', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  graph: { icon: GitBranch, color: 'bg-purple-600', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  timeseries: { icon: Clock, color: 'bg-amber-600', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  vector: { icon: Cpu, color: 'bg-pink-600', badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  theory: { icon: BookOpen, color: 'bg-cyan-600', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  comparison: { icon: Layers, color: 'bg-green-600', badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  'sql-language': { icon: Terminal, color: 'bg-blue-600', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  nosql: { icon: Database, color: 'bg-green-600', badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  'graph-language': { icon: GitBranch, color: 'bg-purple-600', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'tsdb-language': { icon: Clock, color: 'bg-amber-600', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'kv-language': { icon: Zap, color: 'bg-red-600', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  design: { icon: Layout, color: 'bg-indigo-600', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  performance: { icon: BarChart3, color: 'bg-orange-600', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  transactions: { icon: Lock, color: 'bg-yellow-600', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  'advanced-db': { icon: Database, color: 'bg-indigo-600', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  search: { icon: Globe, color: 'bg-cyan-600', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  'cloud-db': { icon: Cloud, color: 'bg-orange-600', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  analytics: { icon: BarChart3, color: 'bg-emerald-600', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  security: { icon: Lock, color: 'bg-red-600', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  operations: { icon: Settings, color: 'bg-gray-600', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  architecture: { icon: Layers, color: 'bg-violet-600', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
};

const GROUPS = [
  { label: 'Foundations', categories: ['fundamentals', 'relational', 'key-value', 'graph', 'timeseries', 'vector', 'theory', 'comparison'] },
  { label: 'Query Languages', categories: ['sql-language', 'nosql', 'graph-language', 'tsdb-language', 'kv-language'] },
  { label: 'Design & Performance', categories: ['design', 'performance', 'transactions'] },
  { label: 'Advanced Topics', categories: ['advanced-db', 'search', 'cloud-db', 'analytics'] },
  { label: 'Operations & Architecture', categories: ['security', 'operations', 'architecture'] },
];

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('db-explorer-completed') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    getLessons()
      .then(l => { setLessons(l); setLoading(false); })
      .catch(() => {
        // Fallback: load lessons from embedded data when backend is unavailable
        import('../data/lessons.js').then(m => {
          setLessons(m.default || m.lessons || []);
          setLoading(false);
        }).catch(() => {
          setLessons([]);
          setLoading(false);
        });
      });
  }, []);

  const filtered = lessons.filter(l => {
    const matchCategory = filter === 'all' || l.category === filter;
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase()) || l.concepts.some(c => c.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  function toggleComplete(id) {
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    localStorage.setItem('db-explorer-completed', JSON.stringify(next));
  }

  const completedCount = Object.values(completed).filter(Boolean).length;
  const allCategories = ['all', ...new Set(lessons.map(l => l.category))];

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Database Learning Hub
        </h1>
        <p className="text-gray-400 text-base max-w-2xl">
          30 interactive lessons covering 232 concepts across 6 database engines and 2 cloud providers.
          Run real queries, visualize results, build understanding.
        </p>

        {/* Progress bar */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / lessons.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
            {completedCount}/{lessons.length} completed
          </span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-8 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lessons, concepts, topics..."
            className="input w-full pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/60 text-gray-500 hover:bg-gray-800 hover:text-gray-300'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lesson, i) => {
          const style = CATEGORY_STYLES[lesson.category] || CATEGORY_STYLES.fundamentals;
          const Icon = style.icon;
          const isDone = completed[lesson.id];
          return (
            <div key={lesson.id} className="relative animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              <Link
                to={`/lesson/${lesson.id}`}
                className="block card-interactive h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${style.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-[10px] ${style.badge}`}>{lesson.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-gray-600 font-mono">#{lesson.id}</span>
                  <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white">{lesson.title}</h3>
                </div>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-2">{lesson.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {lesson.concepts.slice(0, 3).map(c => (
                    <span key={c} className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded">{c}</span>
                  ))}
                  {lesson.concepts.length > 3 && (
                    <span className="text-[10px] text-gray-600 px-1 py-0.5">+{lesson.concepts.length - 3}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600">{lesson.concepts.length} concepts</span>
                  <span className="text-xs text-blue-400 flex items-center gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              {/* Complete checkbox */}
              <button
                onClick={(e) => { e.preventDefault(); toggleComplete(lesson.id); }}
                className={`absolute top-4 right-4 z-10 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  isDone ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-600 hover:text-gray-400'
                }`}
              >
                {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-3 text-gray-700" />
          <p className="text-sm">No lessons match your search.</p>
        </div>
      )}
    </div>
  );
}
