import { useState, useMemo } from 'react';
import type { Project, ProjectStatus, Workspace } from '../types/project';
import {
  Plus, Search, Globe, Rocket, Pause, Lightbulb, CalendarClock,
  Pin, FolderOpen, ArrowUpDown, Calendar, Tag
} from 'lucide-react';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  'live': { label: 'Live', icon: <Globe className="w-3.5 h-3.5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  'in-progress': { label: 'In Progress', icon: <Rocket className="w-3.5 h-3.5" />, color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  'later': { label: 'Later', icon: <CalendarClock className="w-3.5 h-3.5" />, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
  'paused': { label: 'Paused', icon: <Pause className="w-3.5 h-3.5" />, color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/30' },
  'idea': { label: 'Idea', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
};

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-yellow-400',
  low: 'bg-gray-400',
};

type SortOption = 'name' | 'updated' | 'priority' | 'status';

interface ProjectListViewProps {
  projects: Project[];
  workspaces: Workspace[];
  onSelectProject: (id: string) => void;
  onAddNew: () => void;
}

export default function ProjectListView({ projects, workspaces, onSelectProject, onAddNew }: ProjectListViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
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
  }, [filtered, sortBy]);

  const getWorkspaceName = (wsId: string) => {
    return workspaces.find(w => w.id === wsId)?.name || '';
  };

  const getWorkspaceColor = (wsId: string) => {
    return workspaces.find(w => w.id === wsId)?.color || 'bg-gray-500';
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [projects]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">My Projects</h2>
            <p className="text-gray-400 text-sm mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="updated">Last Updated</option>
                <option value="name">Name</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {(['all', 'live', 'in-progress', 'later', 'paused', 'idea'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  statusFilter === s
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                    : 'bg-gray-700/50 text-gray-400 border-transparent hover:bg-gray-700'
                }`}
              >
                {s !== 'all' && STATUS_CONFIG[s].icon}
                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                <span className="text-gray-500 ml-0.5">({statusCounts[s] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(project => {
              const statusConf = STATUS_CONFIG[project.status];
              const checklistDone = project.checklist.filter(c => c.done).length;
              const checklistTotal = project.checklist.length;

              return (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl p-4 transition-all group"
                >
                  {/* Top row: name + pin */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[project.priority]}`} />
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                    </div>
                    {project.pinned && <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                  </div>

                  {/* Status + Category */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${statusConf.bg} ${statusConf.color}`}>
                      {statusConf.icon}
                      {statusConf.label}
                    </span>
                    <span className="text-xs text-gray-500">{project.category}</span>
                  </div>

                  {/* Description snippet */}
                  {project.description && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                  )}

                  {/* Current Work */}
                  {project.currentWork && (
                    <p className="text-xs text-blue-400/70 mb-3 truncate">
                      Working on: {project.currentWork}
                    </p>
                  )}

                  {/* Checklist progress */}
                  {checklistTotal > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Checklist</span>
                        <span>{checklistDone}/{checklistTotal}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full transition-all"
                          style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom: tags, workspace, deadline */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Workspace */}
                    {project.workspaceId && project.workspaceId !== 'ws-default' && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full ${getWorkspaceColor(project.workspaceId)}`} />
                        {getWorkspaceName(project.workspaceId)}
                      </span>
                    )}

                    {/* Tags */}
                    {(project.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="flex items-center gap-0.5 text-xs bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {(project.tags || []).length > 2 && (
                      <span className="text-xs text-gray-600">+{project.tags.length - 2}</span>
                    )}

                    {/* Deadline */}
                    {project.deadline && (
                      <span className="flex items-center gap-1 text-xs text-amber-400/70 ml-auto">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            {projects.length === 0 ? (
              <>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Welcome to DevHub</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Your personal project command center. Add a project to get started.
                </p>
                <button
                  onClick={onAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  Add First Project
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No projects match your filters</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
