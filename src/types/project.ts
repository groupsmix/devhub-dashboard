export type ProjectStatus = 'live' | 'in-progress' | 'later' | 'paused' | 'idea';
export type Priority = 'high' | 'medium' | 'low';
export type ViewMode = 'detail' | 'kanban' | 'timeline' | 'overview';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  completed: boolean;
}

export interface FinanceEntry {
  id: string;
  label: string;
  amount: number;
  type: 'cost' | 'revenue';
}

export interface LinkEntry {
  id: string;
  label: string;
  url: string;
}

export interface ActivityEntry {
  id: string;
  projectId: string;
  projectName: string;
  action: string;
  timestamp: string;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  domain: string;
  category: string;
  status: ProjectStatus;
  priority: Priority;
  description: string;
  toolsUsed: string[];
  trafficSources: string[];
  checklist: ChecklistItem[];
  whatsDone: string[];
  whatsNotDone: string[];
  currentWork: string;
  workflow: WorkflowStep[];
  connectedEmails: string[];
  links: LinkEntry[];
  notes: string;
  finance: FinanceEntry[];
  tags: string[];
  workspaceId: string;
  pinned: boolean;
  deadline: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodayTask {
  id: string;
  projectId: string;
  text: string;
  done: boolean;
}
