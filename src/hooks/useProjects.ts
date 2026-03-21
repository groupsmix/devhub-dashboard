import { useState, useEffect, useCallback } from 'react';
import type { Project, TodayTask } from '../types/project';

const PROJECTS_KEY = 'devhub_projects';
const TASKS_KEY = 'devhub_today_tasks';
const CATEGORIES_KEY = 'devhub_categories';

const DEFAULT_CATEGORIES = [
  'Web App', 'SaaS', 'Podcast', 'Stream', 'Music', 'Video',
  'Bot', 'Digital Product', 'Content', 'E-commerce', 'API', 'Other'
];

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
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage(PROJECTS_KEY, []));
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>(() => loadFromStorage(TASKS_KEY, []));
  const [categories, setCategories] = useState<string[]>(() => loadFromStorage(CATEGORIES_KEY, DEFAULT_CATEGORIES));

  useEffect(() => { saveToStorage(PROJECTS_KEY, projects); }, [projects]);
  useEffect(() => { saveToStorage(TASKS_KEY, todayTasks); }, [todayTasks]);
  useEffect(() => { saveToStorage(CATEGORIES_KEY, categories); }, [categories]);

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
      createdAt: now,
      updatedAt: now,
    };
    setProjects(prev => [project, ...prev]);
    return project;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTodayTasks(prev => prev.filter(t => t.projectId !== id));
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
    projects, addProject, updateProject, deleteProject,
    todayTasks, addTodayTask, toggleTodayTask, deleteTodayTask,
    categories, addCategory,
  };
}
