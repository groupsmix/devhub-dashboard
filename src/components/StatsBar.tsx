import type { Project } from '../types/project';
import { Globe, Rocket, Pause, Lightbulb, CalendarClock, DollarSign, FolderOpen } from 'lucide-react';

interface StatsBarProps {
  projects: Project[];
}

export default function StatsBar({ projects }: StatsBarProps) {
  const total = projects.length;
  const live = projects.filter(p => p.status === 'live').length;
  const inProgress = projects.filter(p => p.status === 'in-progress').length;
  const paused = projects.filter(p => p.status === 'paused').length;
  const ideas = projects.filter(p => p.status === 'idea').length;
  const later = projects.filter(p => p.status === 'later').length;

  const totalCosts = projects.reduce((sum, p) =>
    sum + p.finance.filter(f => f.type === 'cost').reduce((s, f) => s + f.amount, 0), 0
  );
  const totalRevenue = projects.reduce((sum, p) =>
    sum + p.finance.filter(f => f.type === 'revenue').reduce((s, f) => s + f.amount, 0), 0
  );

  const stats = [
    { label: 'Total', value: total, icon: <FolderOpen className="w-4 h-4" />, color: 'text-white', bg: 'bg-gray-700/50' },
    { label: 'Live', value: live, icon: <Globe className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'In Progress', value: inProgress, icon: <Rocket className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Later', value: later, icon: <CalendarClock className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Paused', value: paused, icon: <Pause className="w-4 h-4" />, color: 'text-gray-400', bg: 'bg-gray-500/10' },
    { label: 'Ideas', value: ideas, icon: <Lightbulb className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Costs', value: `$${totalCosts.toFixed(0)}`, icon: <DollarSign className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: <DollarSign className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
      <div className="flex items-center gap-4 overflow-x-auto">
        {stats.map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${s.bg} shrink-0`}>
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
