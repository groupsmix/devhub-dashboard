import { useState, useEffect, useCallback, useRef } from 'react';
import type { Project, TodayTask, Workspace, ActivityEntry } from '../types/project';
import { useSheetsSync } from './useSheetsSync';
import type { SheetsData } from '../services/sheetsApi';

export type { SyncStatus } from './useSheetsSync';

const PROJECTS_KEY = 'devhub_projects';
const TASKS_KEY = 'devhub_today_tasks';
const CATEGORIES_KEY = 'devhub_categories';
const WORKSPACES_KEY = 'devhub_workspaces';
const ACTIVITY_KEY = 'devhub_activity';

const DEFAULT_CATEGORIES = [
  'Web App', 'SaaS', 'Podcast', 'Stream', 'Music', 'Video',
  'Bot', 'Digital Product', 'Content', 'E-commerce', 'API', 'Other'
];

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: 'ws-default', name: 'General', color: 'bg-gray-500' },
];

const WORKSPACE_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500',
  'bg-red-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
];

const MAX_ACTIVITY = 50;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const loaded = loadFromStorage<Project[]>(PROJECTS_KEY, []);
    return loaded.map(p => ({
      ...p,
      tags: p.tags || [],
      workspaceId: p.workspaceId || 'ws-default',
      pinned: p.pinned || false,
      deadline: p.deadline || '',
      startDate: p.startDate || '',
    }));
  });
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>(() => loadFromStorage(TASKS_KEY, []));
  const [categories, setCategories] = useState<string[]>(() => loadFromStorage(CATEGORIES_KEY, DEFAULT_CATEGORIES));
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadFromStorage(WORKSPACES_KEY, DEFAULT_WORKSPACES));
  const [activity, setActivity] = useState<ActivityEntry[]>(() => loadFromStorage(ACTIVITY_KEY, []));
  const [sheetsLoaded, setSheetsLoaded] = useState(false);
  const initialLoadDone = useRef(false);

  const { enabled: sheetsEnabled, status: syncStatus, error: syncError, lastSynced, loadFromSheets, saveToSheets } = useSheetsSync();

  // Save to localStorage on every change
  useEffect(() => { saveToStorage(PROJECTS_KEY, projects); }, [projects]);
  useEffect(() => { saveToStorage(TASKS_KEY, todayTasks); }, [todayTasks]);
  useEffect(() => { saveToStorage(CATEGORIES_KEY, categories); }, [categories]);
  useEffect(() => { saveToStorage(WORKSPACES_KEY, workspaces); }, [workspaces]);
  useEffect(() => { saveToStorage(ACTIVITY_KEY, activity); }, [activity]);

  // Load from Sheets on first mount (if configured)
  useEffect(() => {
    if (!sheetsEnabled || initialLoadDone.current) return;
    initialLoadDone.current = true;

    loadFromSheets().then((data) => {
      if (!data) {
        setSheetsLoaded(true);
        return;
      }

      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects as unknown as Project[]);
      }
      if (data.todayTasks && data.todayTasks.length > 0) {
        setTodayTasks(data.todayTasks as unknown as TodayTask[]);
      }
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
      if (data.workspaces && data.workspaces.length > 0) {
        setWorkspaces(data.workspaces as unknown as Workspace[]);
      }
      if (data.activity && data.activity.length > 0) {
        setActivity(data.activity as unknown as ActivityEntry[]);
      }
      setSheetsLoaded(true);
    });
  }, [sheetsEnabled, loadFromSheets]);

  // If Sheets is not enabled, mark as loaded immediately
  useEffect(() => {
    if (!sheetsEnabled) {
      setSheetsLoaded(true);
    }
  }, [sheetsEnabled]);

  // Sync to Sheets whenever data changes (debounced), but only after initial load
  useEffect(() => {
    if (!sheetsEnabled || !sheetsLoaded) return;
    const data: SheetsData = {
      projects: projects as unknown as Record<string, unknown>[],
      todayTasks: todayTasks as unknown as Record<string, unknown>[],
      categories,
      workspaces: workspaces as unknown as Record<string, unknown>[],
      activity: activity as unknown as Record<string, unknown>[],
    };
    saveToSheets(data);
  }, [sheetsEnabled, sheetsLoaded, projects, todayTasks, categories, workspaces, activity, saveToSheets]);

  const logActivity = useCallback((projectId: string, projectName: string, action: string) => {
    const entry: ActivityEntry = {
      id: generateId(),
      projectId,
      projectName,
      action,
      timestamp: new Date().toISOString(),
    };
    setActivity(prev => [entry, ...prev].slice(0, MAX_ACTIVITY));
  }, []);

  const addProject = useCallback((partial: Partial<Project>) => {
    const now = new Date().toISOString();
    const project: Project = {
      id: generateId(),
      name: partial.name || 'Untitled Project',
      domain: partial.domain || '',
      category: partial.category || 'Other',
      status: partial.status || 'idea',
      priority: partial.priority || 'medium',
      description: partial.description || '',
      toolsUsed: partial.toolsUsed || [],
      trafficSources: partial.trafficSources || [],
      checklist: partial.checklist || [],
      whatsDone: partial.whatsDone || [],
      whatsNotDone: partial.whatsNotDone || [],
      currentWork: partial.currentWork || '',
      workflow: partial.workflow || [],
      connectedEmails: partial.connectedEmails || [],
      links: partial.links || [],
      notes: partial.notes || '',
      finance: partial.finance || [],
      tags: partial.tags || [],
      workspaceId: partial.workspaceId || 'ws-default',
      pinned: partial.pinned || false,
      deadline: partial.deadline || '',
      startDate: partial.startDate || now.split('T')[0],
      createdAt: now,
      updatedAt: now,
    };
    setProjects(prev => [project, ...prev]);
    logActivity(project.id, project.name, 'Created project');
    return project;
  }, [logActivity]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
      if (updates.status && updates.status !== p.status) {
        logActivity(id, p.name, `Status changed to ${updates.status}`);
      }
      if (updates.name && updates.name !== p.name) {
        logActivity(id, updates.name, `Renamed from "${p.name}"`);
      }
      return updated;
    }));
  }, [logActivity]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const p = prev.find(p => p.id === id);
      if (p) logActivity(id, p.name, 'Deleted project');
      return prev.filter(p => p.id !== id);
    });
    setTodayTasks(prev => prev.filter(t => t.projectId !== id));
  }, [logActivity]);

  const togglePin = useCallback((id: string) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, pinned: !p.pinned, updatedAt: new Date().toISOString() } : p
    ));
  }, []);

  // Workspace CRUD
  const addWorkspace = useCallback((name: string) => {
    const colorIdx = workspaces.length % WORKSPACE_COLORS.length;
    const ws: Workspace = { id: generateId(), name, color: WORKSPACE_COLORS[colorIdx] };
    setWorkspaces(prev => [...prev, ws]);
    return ws;
  }, [workspaces.length]);

  const updateWorkspace = useCallback((id: string, updates: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const deleteWorkspace = useCallback((id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    setProjects(prev => prev.map(p => p.workspaceId === id ? { ...p, workspaceId: 'ws-default' } : p));
  }, []);

  const clearActivity = useCallback(() => {
    setActivity([]);
  }, []);

  // Export data
  const exportData = useCallback(() => {
    const data = { projects, todayTasks, categories, workspaces, activity };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devhub-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [projects, todayTasks, categories, workspaces, activity]);

  // Import data
  const importData = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.projects) setProjects(data.projects);
      if (data.todayTasks) setTodayTasks(data.todayTasks);
      if (data.categories) setCategories(data.categories);
      if (data.workspaces) setWorkspaces(data.workspaces);
      if (data.activity) setActivity(data.activity);
      return true;
    } catch {
      return false;
    }
  }, []);

  const addCategory = useCallback((cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev : [...prev, cat]);
  }, []);

  const addTodayTask = useCallback((projectId: string, text: string) => {
    const task: TodayTask = { id: generateId(), projectId, text, done: false };
    setTodayTasks(prev => [...prev, task]);
    return task;
  }, []);

  const toggleTodayTask = useCallback((taskId: string) => {
    setTodayTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, done: !t.done } : t
    ));
  }, []);

  const deleteTodayTask = useCallback((taskId: string) => {
    setTodayTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  return {
    projects, addProject, updateProject, deleteProject, togglePin,
    todayTasks, addTodayTask, toggleTodayTask, deleteTodayTask,
    categories, addCategory,
    workspaces, addWorkspace, updateWorkspace, deleteWorkspace,
    activity, clearActivity,
    exportData, importData,
    // Sheets sync info
    syncStatus,
    syncError,
    lastSynced,
    sheetsEnabled,
  };
}
