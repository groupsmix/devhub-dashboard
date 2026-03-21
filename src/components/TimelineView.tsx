import { useMemo } from 'react';
import type { Project } from '../types/project';
import { Calendar, Globe, Rocket, Pause, Lightbulb, CalendarClock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  'live': '#34d399',
  'in-progress': '#60a5fa',
  'later': '#fbbf24',
  'paused': '#9ca3af',
  'idea': '#a78bfa',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'live': <Globe className="w-3 h-3" />,
  'in-progress': <Rocket className="w-3 h-3" />,
  'later': <CalendarClock className="w-3 h-3" />,
  'paused': <Pause className="w-3 h-3" />,
  'idea': <Lightbulb className="w-3 h-3" />,
};

interface TimelineViewProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

export default function TimelineView({ projects, onSelectProject }: TimelineViewProps) {
  const timelineProjects = useMemo(() => {
    return projects
      .filter(p => p.startDate || p.deadline || p.createdAt)
      .sort((a, b) => {
        const dateA = a.startDate || a.createdAt;
        const dateB = b.startDate || b.createdAt;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
  }, [projects]);

  const months = useMemo(() => {
    if (timelineProjects.length === 0) return [];

    const allDates: Date[] = [];
    timelineProjects.forEach(p => {
      if (p.startDate) allDates.push(new Date(p.startDate));
      if (p.deadline) allDates.push(new Date(p.deadline));
      allDates.push(new Date(p.createdAt));
    });

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Extend range by 1 month on each side
    minDate.setMonth(minDate.getMonth() - 1);
    maxDate.setMonth(maxDate.getMonth() + 1);

    const result: { label: string; year: number; month: number }[] = [];
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

    while (current <= maxDate) {
      result.push({
        label: current.toLocaleDateString('en-US', { month: 'short' }),
        year: current.getFullYear(),
        month: current.getMonth(),
      });
      current.setMonth(current.getMonth() + 1);
    }

    return result;
  }, [timelineProjects]);

  const getBarPosition = (dateStr: string) => {
    if (!dateStr || months.length === 0) return 0;
    const date = new Date(dateStr);
    const firstMonth = new Date(months[0].year, months[0].month, 1);
    const lastMonth = new Date(months[months.length - 1].year, months[months.length - 1].month + 1, 0);
    const totalRange = lastMonth.getTime() - firstMonth.getTime();
    if (totalRange === 0) return 50;
    return ((date.getTime() - firstMonth.getTime()) / totalRange) * 100;
  };

  if (timelineProjects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Timeline View</h2>
          <p className="text-gray-500 max-w-md">
            Add start dates or deadlines to your projects to see them on the timeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Timeline</h2>
        </div>

        {/* Month Headers */}
        <div className="relative">
          <div className="flex border-b border-gray-800 mb-2 ml-48">
            {months.map((m, i) => (
              <div key={i} className="flex-1 text-center text-xs text-gray-500 pb-2 min-w-[80px]">
                {m.label} {m.year !== new Date().getFullYear() ? m.year : ''}
              </div>
            ))}
          </div>

          {/* Today marker */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500/40 z-10"
            style={{ left: `calc(192px + ${getBarPosition(new Date().toISOString())}% * (100% - 192px) / 100)` }}
          />

          {/* Project Rows */}
          <div className="space-y-2">
            {timelineProjects.map(project => {
              const startPos = getBarPosition(project.startDate || project.createdAt);
              const endPos = project.deadline ? getBarPosition(project.deadline) : Math.min(startPos + 8, 100);
              const barWidth = Math.max(endPos - startPos, 2);
              const color = STATUS_COLORS[project.status] || '#9ca3af';

              return (
                <div key={project.id} className="flex items-center group">
                  {/* Project Name */}
                  <div
                    className="w-48 shrink-0 pr-4 cursor-pointer"
                    onClick={() => onSelectProject(project.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color }}>{STATUS_ICONS[project.status]}</span>
                      <span className="text-sm text-white truncate hover:text-blue-400 transition-colors">
                        {project.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 ml-5">
                      <span className="text-xs text-gray-600">{project.category}</span>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-8 min-w-[400px]">
                    <div className="absolute inset-0 bg-gray-800/30 rounded" />
                    <div
                      className="absolute h-6 top-1 rounded-md cursor-pointer transition-all hover:opacity-80"
                      style={{
                        left: `${startPos}%`,
                        width: `${barWidth}%`,
                        backgroundColor: color + '40',
                        borderLeft: `3px solid ${color}`,
                      }}
                      onClick={() => onSelectProject(project.id)}
                    >
                      {barWidth > 10 && (
                        <span className="text-xs text-white/70 px-2 py-1 truncate block">
                          {project.name}
                        </span>
                      )}
                    </div>

                    {/* Deadline marker */}
                    {project.deadline && (
                      <div
                        className="absolute top-0 h-8 w-0.5 rounded"
                        style={{
                          left: `${getBarPosition(project.deadline)}%`,
                          backgroundColor: color,
                        }}
                        title={`Deadline: ${new Date(project.deadline).toLocaleDateString()}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-gray-800">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-400 capitalize">{status}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-4">
            <div className="w-3 h-0.5 bg-red-500/60 rounded" />
            <span className="text-xs text-gray-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
