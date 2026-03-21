import { useMemo } from 'react';
import type { Project, Workspace, ActivityEntry } from '../types/project';
import {
  TrendingUp, DollarSign, Activity, FolderOpen, ArrowRight, Pin, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OverviewDashboardProps {
  projects: Project[];
  workspaces: Workspace[];
  activity: ActivityEntry[];
  onSelectProject: (id: string) => void;
  onShowKanban: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  'live': { color: '#34d399', label: 'Live' },
  'in-progress': { color: '#60a5fa', label: 'In Progress' },
  'later': { color: '#fbbf24', label: 'Later' },
  'paused': { color: '#9ca3af', label: 'Paused' },
  'idea': { color: '#a78bfa', label: 'Ideas' },
};

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-yellow-400',
  low: 'bg-gray-400',
};

export default function OverviewDashboard({ projects, workspaces, activity, onSelectProject, onShowKanban }: OverviewDashboardProps) {
  const stats = useMemo(() => {
    const totalCosts = projects.reduce((sum, p) =>
      sum + p.finance.filter(f => f.type === 'cost').reduce((s, f) => s + f.amount, 0), 0
    );
    const totalRevenue = projects.reduce((sum, p) =>
      sum + p.finance.filter(f => f.type === 'revenue').reduce((s, f) => s + f.amount, 0), 0
    );
    return { totalCosts, totalRevenue, profit: totalRevenue - totalCosts };
  }, [projects]);

  const statusData = useMemo(() => {
    return Object.entries(STATUS_CONFIG).map(([status, config]) => ({
      name: config.label,
      value: projects.filter(p => p.status === status).length,
      color: config.color,
    })).filter(d => d.value > 0);
  }, [projects]);

  const workspaceData = useMemo(() => {
    return workspaces.map(ws => ({
      name: ws.name,
      projects: projects.filter(p => p.workspaceId === ws.id).length,
    })).filter(d => d.projects > 0);
  }, [projects, workspaces]);

  const recentProjects = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  }, [projects]);

  const pinnedProjects = useMemo(() => projects.filter(p => p.pinned), [projects]);

  const upcomingDeadlines = useMemo(() => {
    return projects
      .filter(p => p.deadline && new Date(p.deadline) >= new Date())
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [projects]);

  const recentActivity = activity.slice(0, 8);

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Welcome to DevHub</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Your personal project command center. Add a project to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
            <p className="text-gray-400 text-sm mt-1">{projects.length} projects across {workspaces.length} workspaces</p>
          </div>
          <button
            onClick={onShowKanban}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            View Kanban <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <FolderOpen className="w-4 h-4" />
              <span className="text-xs">Total Projects</span>
            </div>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${stats.totalRevenue.toFixed(0)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Costs</span>
            </div>
            <p className="text-2xl font-bold text-red-400">${stats.totalCosts.toFixed(0)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 mb-1" style={{ color: stats.profit >= 0 ? '#34d399' : '#f87171' }}>
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Profit</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: stats.profit >= 0 ? '#34d399' : '#f87171' }}>
              ${stats.profit.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusData.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Project Status</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-400">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {workspaceData.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Workspace Overview</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workspaceData}>
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="projects" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Projects" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Pinned & Deadlines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pinnedProjects.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-400" /> Pinned Projects
              </h3>
              <div className="space-y-2">
                {pinnedProjects.map(p => (
                  <button key={p.id} onClick={() => onSelectProject(p.id)} className="w-full text-left bg-gray-700/50 hover:bg-gray-700 rounded-lg px-4 py-3 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[p.priority]}`} />
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <span className="ml-auto text-xs" style={{ color: STATUS_CONFIG[p.status]?.color }}>{STATUS_CONFIG[p.status]?.label}</span>
                    </div>
                    {p.currentWork && <p className="text-xs text-gray-400 mt-1 ml-3.5">{p.currentWork}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {upcomingDeadlines.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Upcoming Deadlines
              </h3>
              <div className="space-y-2">
                {upcomingDeadlines.map(p => {
                  const daysLeft = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <button key={p.id} onClick={() => onSelectProject(p.id)} className="w-full text-left bg-gray-700/50 hover:bg-gray-700 rounded-lg px-4 py-3 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{p.name}</p>
                        <span className={`text-xs font-medium ${daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-gray-400'}`}>
                          {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{new Date(p.deadline).toLocaleDateString()}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent Projects & Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-400" /> Recently Updated
            </h3>
            <div className="space-y-2">
              {recentProjects.map(p => (
                <button key={p.id} onClick={() => onSelectProject(p.id)} className="w-full text-left bg-gray-700/50 hover:bg-gray-700 rounded-lg px-4 py-3 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[p.priority]}`} />
                    <p className="text-sm font-medium text-white truncate flex-1">{p.name}</p>
                    <span className="text-xs text-gray-500">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" /> Recent Activity
            </h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map(a => (
                  <div key={a.id} className="flex items-start gap-3 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="text-blue-400">{a.projectName}</span>{' '}
                        <span className="text-gray-400">{a.action}</span>
                      </p>
                      <p className="text-xs text-gray-600">{new Date(a.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
