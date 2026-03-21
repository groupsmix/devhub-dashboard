export type ProjectStatus = 'live' | 'in-progress' | 'later' | 'paused' | 'idea';
export type Priority = 'high' | 'medium' | 'low';

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
  createdAt: string;
  updatedAt: string;
}

export interface TodayTask {
  id: string;
  projectId: string;
  text: string;
  done: boolean;
}
