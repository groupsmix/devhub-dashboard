import { useState, useEffect } from 'react';
import './App.css';
import { useProjects } from './hooks/useProjects';
import Sidebar from './components/Sidebar';
import StatsBar from './components/StatsBar';
import ProjectDetail from './components/ProjectDetail';
import TodayView from './components/TodayView';
import { FolderOpen } from 'lucide-react';

function App() {
  const {
    projects, addProject, updateProject, deleteProject,
    todayTasks, addTodayTask, toggleTodayTask, deleteTodayTask,
    categories, addCategory,
  } = useProjects();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showToday, setShowToday] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedId) || null;

  useEffect(() => {
    if (selectedId && !projects.find(p => p.id === selectedId)) {
      setSelectedId(null);
    }
  }, [projects, selectedId]);

  const handleAddNew = () => {
    const newProject = addProject({ name: 'New Project' });
    setSelectedId(newProject.id);
    setShowToday(false);
  };

  const handleSelectProject = (id: string) => {
    setSelectedId(id);
    setShowToday(false);
  };

  const handleShowToday = () => {
    setShowToday(true);
    setSelectedId(null);
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    setSelectedId(null);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        projects={projects}
        selectedId={selectedId}
        onSelect={handleSelectProject}
        onAddNew={handleAddNew}
        onShowToday={handleShowToday}
        showingToday={showToday}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatsBar projects={projects} />
        {showToday ? (
          <TodayView
            projects={projects}
            tasks={todayTasks}
            onAddTask={addTodayTask}
            onToggleTask={toggleTodayTask}
            onDeleteTask={deleteTodayTask}
            onSelectProject={handleSelectProject}
          />
        ) : selectedProject ? (
          <ProjectDetail
            key={selectedProject.id}
            project={selectedProject}
            categories={categories}
            onUpdate={updateProject}
            onDelete={handleDeleteProject}
            onAddCategory={addCategory}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-400 mb-2">Welcome to DevHub</h2>
              <p className="text-gray-500 mb-6 max-w-md">
                Your personal project command center. Add a project to get started, or check today's focus.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  Add First Project
                </button>
                <button
                  onClick={handleShowToday}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  Today's Focus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
