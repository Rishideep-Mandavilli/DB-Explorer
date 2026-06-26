import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Database, BookOpen, Terminal, GitCompare, Settings, Cloud, Menu, X, GraduationCap } from 'lucide-react';
import Lessons from './modules/Lessons';
import Sandbox from './modules/Sandbox';
import Compare from './modules/Compare';
import Explorer from './modules/Explorer';
import Providers from './modules/Providers';
import LessonDetail from './modules/LessonDetail';

const NAV = [
  { to: '/', label: 'Lessons', icon: BookOpen },
  { to: '/sandbox', label: 'Sandbox', icon: Terminal },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/explorer', label: 'Schema', icon: Settings },
  { to: '/providers', label: 'Cloud', icon: Cloud },
];

function Nav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Database className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold text-white">DB Explorer</span>
            <span className="text-[10px] text-gray-500 block -mt-0.5 font-mono">30 lessons • 6 engines • 232 concepts</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-800">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-800 bg-gray-950 px-4 py-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
                location.pathname === to ? 'bg-blue-600/15 text-blue-400' : 'text-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>DB Explorer — Learn Databases by Doing</span>
        </div>
        <div className="flex gap-3 text-[11px] text-gray-700">
          <span>6 engines</span>
          <span className="text-gray-800">|</span>
          <span>2 cloud providers</span>
          <span className="text-gray-800">|</span>
          <span>30 lessons</span>
          <span className="text-gray-800">|</span>
          <span>232 concepts</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/" element={<Lessons />} />
            <Route path="/lesson/:id" element={<LessonDetail />} />
            <Route path="/sandbox" element={<Sandbox />} />
            <Route path="/sandbox/:engine" element={<Sandbox />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/providers" element={<Providers />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
