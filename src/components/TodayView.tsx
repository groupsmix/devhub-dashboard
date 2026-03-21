import { useState } from 'react';
import type { Project, TodayTask } from '../types/project';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Target } from 'lucide-react';

interface TodayViewProps {
  projects: Project[];
  tasks: TodayTask[];
  onAddTask: (projectId: string, text: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectProject: (id: string) => void;
}

export default function TodayView({ projects, tasks, onAddTask, onToggleTask, onDeleteTask, onSelectProject }: TodayViewProps) {
  const [newText, setNewText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const handleAdd = () => {
    if (!newText.trim() || !selectedProjectId) return;
    onAddTask(selectedProjectId, newText.trim());
    setNewText('');
  };

  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const highPriorityProjects = projects
    .filter(p => p.priority === 'high' && p.status === 'in-progress')
    .slice(0, 5);

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown';
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock className="w-7 h-7 text-blue-400" />
            Today's Focus
          </h2>
          <p className="text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm font-bold text-white">{doneCount}/{totalCount} done</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Add Task */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Add Task</h3>
          <div className="flex gap-2">
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-40"
            >
              <option value="">Project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="What needs to be done today?"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAdd}
              disabled={!newText.trim() || !selectedProjectId}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2 mb-8">
          {tasks.filter(t => !t.done).map(task => (
            <div key={task.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 flex items-center gap-3 group">
              <button onClick={() => onToggleTask(task.id)} className="text-gray-500 hover:text-blue-400 transition-colors">
                <Circle className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <p className="text-sm text-white">{task.text}</p>
                <button
                  onClick={() => onSelectProject(task.projectId)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {getProjectName(task.projectId)}
                </button>
              </div>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {tasks.filter(t => t.done).length > 0 && (
            <div className="pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Completed</p>
              {tasks.filter(t => t.done).map(task => (
                <div key={task.id} className="bg-gray-800/30 border border-gray-700/30 rounded-lg px-4 py-3 flex items-center gap-3 group mb-2">
                  <button onClick={() => onToggleTask(task.id)} className="text-emerald-500 hover:text-emerald-400 transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 line-through">{task.text}</p>
                    <span className="text-xs text-gray-600">{getProjectName(task.projectId)}</span>
                  </div>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No tasks for today yet</p>
              <p className="text-gray-600 text-sm mt-1">Add tasks above to plan your day</p>
            </div>
          )}
        </div>

        {/* High Priority Projects */}
        {highPriorityProjects.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" />
              High Priority - In Progress
            </h3>
            <div className="space-y-2">
              {highPriorityProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="w-full text-left bg-gray-700/50 hover:bg-gray-700 rounded-lg px-4 py-3 transition-colors"
                >
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  {p.currentWork && (
                    <p className="text-xs text-gray-400 mt-1">Working on: {p.currentWork}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
