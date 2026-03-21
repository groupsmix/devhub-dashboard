import type { Project, ProjectStatus } from '../types/project';
import { Globe, Rocket, Pause, Lightbulb, CalendarClock, Pin } from 'lucide-react';

const COLUMNS: { status: ProjectStatus; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { status: 'idea', label: 'Ideas', icon: <Lightbulb className="w-4 h-4" />, color: 'text-purple-400', bg: 'border-purple-500/30' },
  { status: 'in-progress', label: 'In Progress', icon: <Rocket className="w-4 h-4" />, color: 'text-blue-400', bg: 'border-blue-500/30' },
  { status: 'live', label: 'Live', icon: <Globe className="w-4 h-4" />, color: 'text-emerald-400', bg: 'border-emerald-500/30' },
  { status: 'later', label: 'Later', icon: <CalendarClock className="w-4 h-4" />, color: 'text-amber-400', bg: 'border-amber-500/30' },
  { status: 'paused', label: 'Paused', icon: <Pause className="w-4 h-4" />, color: 'text-gray-400', bg: 'border-gray-500/30' },
];

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-yellow-400',
  low: 'bg-gray-400',
};

interface KanbanBoardProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onUpdateStatus: (id: string, status: ProjectStatus) => void;
}

export default function KanbanBoard({ projects, onSelectProject, onUpdateStatus }: KanbanBoardProps) {
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDrop = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain');
    if (projectId) {
      onUpdateStatus(projectId, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="flex gap-4 h-full min-w-max">
        {COLUMNS.map(col => {
          const colProjects = projects.filter(p => p.status === col.status);
          return (
            <div
              key={col.status}
              className={`w-72 flex flex-col bg-gray-900/50 rounded-xl border ${col.bg} shrink-0`}
              onDrop={e => handleDrop(e, col.status)}
              onDragOver={handleDragOver}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                <span className={col.color}>{col.icon}</span>
                <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                <span className="ml-auto bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                  {colProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {colProjects.map(project => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={e => handleDragStart(e, project.id)}
                    onClick={() => onSelectProject(project.id)}
                    className="bg-gray-800 hover:bg-gray-750 border border-gray-700/50 rounded-lg p-3 cursor-pointer transition-all hover:border-gray-600 group"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[project.priority]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="text-sm font-medium text-white truncate">{project.name}</h4>
                          {project.pinned && <Pin className="w-3 h-3 text-amber-400 shrink-0" />}
                        </div>
                        {project.currentWork && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {project.currentWork}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-gray-500">{project.category}</span>
                          {project.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {project.checklist.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span>{project.checklist.filter(c => c.done).length}/{project.checklist.length}</span>
                              <div className="flex-1 bg-gray-700 rounded-full h-1">
                                <div
                                  className="bg-blue-500 h-1 rounded-full"
                                  style={{ width: `${(project.checklist.filter(c => c.done).length / project.checklist.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {project.deadline && (
                          <p className="text-xs text-amber-400/70 mt-1">
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {colProjects.length === 0 && (
                  <div className="text-center py-8 text-gray-600 text-xs">
                    Drag projects here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
