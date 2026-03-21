import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { useProjects } from './hooks/useProjects';
import type { ViewMode, ProjectStatus } from './types/project';
import Sidebar from './components/Sidebar';
import StatsBar from './components/StatsBar';
import ProjectDetail from './components/ProjectDetail';
import ProjectListView from './components/ProjectListView';
import TodayView from './components/TodayView';
import OverviewDashboard from './components/OverviewDashboard';
import KanbanBoard from './components/KanbanBoard';
import TimelineView from './components/TimelineView';
import CommandPalette from './components/CommandPalette';
import { FolderOpen } from 'lucide-react';

function App() {
  const {
    projects, addProject, updateProject, deleteProject, togglePin,
    todayTasks, addTodayTask, toggleTodayTask, deleteTodayTask,
    categories, addCategory,
    workspaces, addWorkspace, deleteWorkspace,
    activity,
    exportData, importData,
    syncStatus, syncError, lastSynced, sheetsEnabled,
  } = useProjects();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showToday, setShowToday] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('projects');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedId) || null;

  useEffect(() => {
    if (selectedId && !projects.find(p => p.id === selectedId)) {
      setSelectedId(null);
    }
  }, [projects, selectedId]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleShowProjects = useCallback(() => {
    setSelectedId(null);
    setShowToday(false);
    setCurrentView('projects');
  }, []);

  const handleAddNew = useCallback(() => {
    const newProject = addProject({ name: 'New Project' });
    setSelectedId(newProject.id);
    setShowToday(false);
    setCurrentView('detail');
  }, [addProject]);

  const handleSelectProject = useCallback((id: string) => {
    setSelectedId(id);
    setShowToday(false);
    setCurrentView('detail');
  }, []);

  const handleShowToday = useCallback(() => {
    setShowToday(true);
    setSelectedId(null);
    setCurrentView('detail');
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    deleteProject(id);
    setSelectedId(null);
  }, [deleteProject]);

  const handleChangeView = useCallback((view: ViewMode) => {
    setCurrentView(view);
    setShowToday(false);
    if (view !== 'detail') {
      setSelectedId(null);
    }
  }, []);

  const handleUpdateStatus = useCallback((id: string, status: ProjectStatus) => {
    updateProject(id, { status });
  }, [updateProject]);

  const getActiveView = () => {
    if (currentView === 'projects') return 'projects';
    if (currentView === 'overview') return 'overview';
    if (currentView === 'kanban') return 'kanban';
    if (currentView === 'timeline') return 'timeline';
    if (showToday) return 'today';
    if (selectedProject) return 'detail';
    return 'projects';
  };

  const renderContent = () => {
    const activeView = getActiveView();

    switch (activeView) {
      case 'projects':
        return (
          <ProjectListView
            projects={projects}
            workspaces={workspaces}
            onSelectProject={handleSelectProject}
            onAddNew={handleAddNew}
          />
        );

      case 'overview':
        return (
          <OverviewDashboard
            projects={projects}
            workspaces={workspaces}
            activity={activity}
            onSelectProject={handleSelectProject}
            onShowKanban={() => handleChangeView('kanban')}
          />
        );

      case 'kanban':
        return (
          <KanbanBoard
            projects={projects}
            onSelectProject={handleSelectProject}
            onUpdateStatus={handleUpdateStatus}
          />
        );

      case 'timeline':
        return (
          <TimelineView
            projects={projects}
            onSelectProject={handleSelectProject}
          />
        );

      case 'today':
        return (
          <TodayView
            projects={projects}
            tasks={todayTasks}
            onAddTask={addTodayTask}
            onToggleTask={toggleTodayTask}
            onDeleteTask={deleteTodayTask}
            onSelectProject={handleSelectProject}
          />
        );

      case 'detail':
        if (selectedProject) {
          return (
            <ProjectDetail
              key={selectedProject.id}
              project={selectedProject}
              categories={categories}
              onUpdate={updateProject}
              onDelete={handleDeleteProject}
              onAddCategory={addCategory}
              workspaces={workspaces}
              onTogglePin={togglePin}
              onBack={handleShowProjects}
            />
          );
        }
        return (
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
        );

      default:
        return null;
    }
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
        workspaces={workspaces}
        onAddWorkspace={addWorkspace}
        onDeleteWorkspace={deleteWorkspace}
        onTogglePin={togglePin}
        currentView={showToday ? 'today' : selectedId ? 'detail' : currentView}
        onChangeView={handleChangeView}
        onExport={exportData}
        onImport={importData}
        onShowProjects={handleShowProjects}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatsBar
          projects={projects}
          syncStatus={syncStatus}
          syncError={syncError}
          lastSynced={lastSynced}
          sheetsEnabled={sheetsEnabled}
        />
        {renderContent()}
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        projects={projects}
        onSelectProject={handleSelectProject}
        onAddProject={handleAddNew}
        onShowToday={handleShowToday}
        onShowOverview={() => handleChangeView('overview')}
        onShowKanban={() => handleChangeView('kanban')}
        onShowTimeline={() => handleChangeView('timeline')}
        onShowProjects={handleShowProjects}
        onExport={exportData}
      />
    </div>
  );
}

export default App;
