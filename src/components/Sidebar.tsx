import { useState } from 'react';
import type { Project, ProjectStatus } from '../types/project';
import { Plus, Search, FolderOpen, Globe, Rocket, Clock, Pause, Lightbulb, CalendarClock } from 'lucide-react';

const STATUS_ICONS: Record<ProjectStatus, React.ReactNode> = {
  'live': <Globe className="w-3 h-3 text-emerald-400" />,
  'in-progress': <Rocket className="w-3 h-3 text-blue-400" />,
  'later': <CalendarClock className="w-3 h-3 text-amber-400" />,
  'paused': <Pause className="w-3 h-3 text-gray-400" />,
  'idea': <Lightbulb className="w-3 h-3 text-purple-400" />,
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  'live': 'bg-emerald-500/20 text-emerald-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  'later': 'bg-amber-500/20 text-amber-400',
  'paused': 'bg-gray-500/20 text-gray-400',
  'idea': 'bg-purple-500/20 text-purple-400',
};

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-yellow-400',
  low: 'bg-gray-400',
};

interface SidebarProps {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onShowToday: () => void;
  showingToday: boolean;
}

export default function Sidebar({ projects, selectedId, onSelect, onAddNew, onShowToday, showingToday }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-screen shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-blue-400" />
          DevHub
        </h1>
        <p className="text-xs text-gray-500 mt-1">Project Command Center</p>
      </div>

      {/* Today Button */}
      <div className="px-3 pt-3">
        <button
          onClick={onShowToday}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showingToday
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Today's Focus
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="px-3 pt-2 flex flex-wrap gap-1">
        {(['all', 'live', 'in-progress', 'later', 'paused', 'idea'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
              selectedId === p.id && !showingToday
                ? 'bg-blue-600/20 border border-blue-500/30'
                : 'hover:bg-gray-800 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[p.priority]}`} />
              <span className="text-sm font-medium text-white truncate flex-1">{p.name}</span>
              {STATUS_ICONS[p.status]}
            </div>
            <div className="flex items-center gap-2 mt-1 ml-3.5">
              <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[p.status]}`}>
                {p.status}
              </span>
              <span className="text-xs text-gray-500 truncate">{p.category}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">No projects found</p>
        )}
      </div>

      {/* Add Button */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={onAddNew}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
    </div>
  );
}
