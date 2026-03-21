import { useState } from 'react';
import type { Project, ProjectStatus, Workspace, ViewMode } from '../types/project';
import {
  Plus, Search, FolderOpen, Globe, Rocket, Clock, Pause, Lightbulb, CalendarClock,
  Pin, ChevronDown, ChevronRight, LayoutDashboard, Columns3, GanttChart,
  Download, Upload, Tag, ArrowUpDown, X, Settings, Trash2
} from 'lucide-react';

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

type SortOption = 'name' | 'updated' | 'priority' | 'status';

interface SidebarProps {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onShowToday: () => void;
  showingToday: boolean;
  workspaces: Workspace[];
  onAddWorkspace: (name: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onTogglePin: (id: string) => void;
  currentView: ViewMode | 'today' | 'detail';
  onChangeView: (view: ViewMode) => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

export default function Sidebar({
  projects, selectedId, onSelect, onAddNew, onShowToday, showingToday,
  workspaces, onAddWorkspace, onDeleteWorkspace, onTogglePin,
  currentView, onChangeView, onExport, onImport,
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [collapsedWorkspaces, setCollapsedWorkspaces] = useState<Set<string>>(new Set());
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const allTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesTag = !tagFilter || (p.tags || []).includes(tagFilter);
    return matchesSearch && matchesStatus && matchesTag;
  });

  const sorted = [...filtered].sort((a, b) => {
    // Pinned always first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'updated': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'priority': {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      case 'status': return a.status.localeCompare(b.status);
      default: return 0;
    }
  });

  const toggleWorkspaceCollapse = (wsId: string) => {
    setCollapsedWorkspaces(prev => {
      const next = new Set(prev);
      if (next.has(wsId)) next.delete(wsId);
      else next.add(wsId);
      return next;
    });
  };

  const handleAddWorkspace = () => {
    if (newWsName.trim()) {
      onAddWorkspace(newWsName.trim());
      setNewWsName('');
      setShowNewWs(false);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          if (text) onImport(text);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const groupedByWorkspace = workspaces.map(ws => ({
    workspace: ws,
    projects: sorted.filter(p => (p.workspaceId || 'ws-default') === ws.id),
  })).filter(g => g.projects.length > 0 || g.workspace.id === 'ws-default');

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-screen shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            DevHub
          </h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Project Command Center</p>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-3 py-2 border-b border-gray-800 space-y-2 bg-gray-800/50">
          <div className="flex gap-1">
            <button onClick={onExport} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg py-1.5 text-xs transition-colors">
              <Download className="w-3 h-3" /> Export
            </button>
            <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg py-1.5 text-xs transition-colors">
              <Upload className="w-3 h-3" /> Import
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-gray-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="updated">Last Updated</option>
              <option value="name">Name</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      )}

      {/* Navigation Views */}
      <div className="px-3 pt-3 space-y-1">
        <button
          onClick={() => onChangeView('overview')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentView === 'overview'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </button>
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
        <button
          onClick={() => onChangeView('kanban')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentView === 'kanban'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Columns3 className="w-4 h-4" />
          Kanban Board
        </button>
        <button
          onClick={() => onChangeView('timeline')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentView === 'timeline'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <GanttChart className="w-4 h-4" />
          Timeline
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects & tags..."
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

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="px-3 pt-2">
          <div className="flex items-center gap-1 mb-1">
            <Tag className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">Tags</span>
            {tagFilter && (
              <button onClick={() => setTagFilter('')} className="ml-auto text-gray-500 hover:text-gray-300">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {allTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  tagFilter === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Project List grouped by Workspace */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {groupedByWorkspace.map(({ workspace: ws, projects: wsProjects }) => (
          <div key={ws.id}>
            {/* Workspace Header */}
            {workspaces.length > 1 && (
              <div className="flex items-center gap-1.5 py-1.5 group">
                <button
                  onClick={() => toggleWorkspaceCollapse(ws.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-300 flex-1"
                >
                  {collapsedWorkspaces.has(ws.id) ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  <div className={`w-2 h-2 rounded-full ${ws.color}`} />
                  <span className="uppercase tracking-wider">{ws.name}</span>
                  <span className="text-gray-600 ml-1">({wsProjects.length})</span>
                </button>
                {ws.id !== 'ws-default' && (
                  <button
                    onClick={() => onDeleteWorkspace(ws.id)}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Projects in workspace */}
            {!collapsedWorkspaces.has(ws.id) && wsProjects.map(p => (
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
                  {p.pinned && <Pin className="w-3 h-3 text-amber-400" />}
                  {STATUS_ICONS[p.status]}
                </div>
                <div className="flex items-center gap-2 mt-1 ml-3.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[p.status]}`}>
                    {p.status}
                  </span>
                  <span className="text-xs text-gray-500 truncate">{p.category}</span>
                  {(p.tags || []).length > 0 && (
                    <span className="text-xs text-gray-600">
                      +{p.tags.length} tags
                    </span>
                  )}
                </div>
                {/* Context menu for pin */}
                <div className="hidden group-hover:flex items-center gap-1 mt-1 ml-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onTogglePin(p.id); }}
                    className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                      p.pinned ? 'text-amber-400 hover:text-amber-300' : 'text-gray-500 hover:text-amber-400'
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">No projects found</p>
        )}

        {/* Add Workspace */}
        {showNewWs ? (
          <div className="flex gap-1 mt-2">
            <input
              type="text"
              placeholder="Workspace name"
              value={newWsName}
              onChange={e => setNewWsName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddWorkspace()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button onClick={handleAddWorkspace} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 text-xs">Add</button>
            <button onClick={() => setShowNewWs(false)} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded px-2 py-1 text-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewWs(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors mt-2"
          >
            <Plus className="w-3 h-3" />
            New Workspace
          </button>
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
