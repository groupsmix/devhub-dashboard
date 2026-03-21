import { useState } from 'react';
import type { Project, ProjectStatus, Priority, ChecklistItem, WorkflowStep, FinanceEntry, LinkEntry, Workspace, ProjectTab } from '../types/project';
import {
  Globe, Rocket, Pause, Lightbulb, CalendarClock, Trash2, Plus, X, Check,
  ExternalLink, DollarSign, Mail, Wrench, TrendingUp, FileText, ListChecks,
  GitBranch, ChevronDown, ChevronUp, Pencil, AlertCircle, Pin, Tag, Calendar,
  ArrowLeft, Save, Eye
} from 'lucide-react';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'live', label: 'Live', icon: <Globe className="w-4 h-4" />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'in-progress', label: 'In Progress', icon: <Rocket className="w-4 h-4" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'later', label: 'Later', icon: <CalendarClock className="w-4 h-4" />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'paused', label: 'Paused', icon: <Pause className="w-4 h-4" />, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'idea', label: 'Idea', icon: <Lightbulb className="w-4 h-4" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'low', label: 'Low', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

const TAB_CONFIG: { value: ProjectTab; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Eye className="w-4 h-4" /> },
  { value: 'checklist', label: 'Checklist', icon: <ListChecks className="w-4 h-4" /> },
  { value: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
  { value: 'workflow', label: 'Workflow', icon: <GitBranch className="w-4 h-4" /> },
  { value: 'links', label: 'Links', icon: <ExternalLink className="w-4 h-4" /> },
  { value: 'finance', label: 'Finance', icon: <DollarSign className="w-4 h-4" /> },
];

interface ProjectDetailProps {
  project: Project;
  categories: string[];
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
  onAddCategory: (cat: string) => void;
  workspaces: Workspace[];
  onTogglePin: (id: string) => void;
  onBack: () => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-800/80 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-300">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

function TagInput({ tags, onChange, placeholder, readOnly }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string; readOnly?: boolean }) {
  const [input, setInput] = useState('');
  const add = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onChange([...tags, input.trim()]);
      setInput('');
    }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md flex items-center gap-1">
            {tag}
            {!readOnly && (
              <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        {tags.length === 0 && <span className="text-xs text-gray-600 italic">None</span>}
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button onClick={add} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-2 py-1.5 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail({ project, categories, onUpdate, onDelete, onAddCategory, workspaces, onTogglePin, onBack }: ProjectDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(project.name);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<ProjectTab>('all');
  const [isEditing, setIsEditing] = useState(false);

  const update = (updates: Partial<Project>) => onUpdate(project.id, updates);

  const addChecklistItem = (text: string) => {
    if (!text.trim()) return;
    update({ checklist: [...project.checklist, { id: generateId(), text: text.trim(), done: false }] });
  };
  const toggleChecklistItem = (itemId: string) => {
    update({ checklist: project.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c) });
  };
  const removeChecklistItem = (itemId: string) => {
    update({ checklist: project.checklist.filter(c => c.id !== itemId) });
  };

  const addWorkflowStep = (name: string) => {
    if (!name.trim()) return;
    update({ workflow: [...project.workflow, { id: generateId(), name: name.trim(), completed: false }] });
  };
  const toggleWorkflowStep = (stepId: string) => {
    update({ workflow: project.workflow.map(w => w.id === stepId ? { ...w, completed: !w.completed } : w) });
  };
  const removeWorkflowStep = (stepId: string) => {
    update({ workflow: project.workflow.filter(w => w.id !== stepId) });
  };

  const addFinanceEntry = (label: string, amount: number, type: 'cost' | 'revenue') => {
    if (!label.trim()) return;
    update({ finance: [...project.finance, { id: generateId(), label: label.trim(), amount, type }] });
  };
  const removeFinanceEntry = (entryId: string) => {
    update({ finance: project.finance.filter(f => f.id !== entryId) });
  };

  const addLink = (label: string, url: string) => {
    if (!label.trim() || !url.trim()) return;
    update({ links: [...project.links, { id: generateId(), label: label.trim(), url: url.trim() }] });
  };
  const removeLink = (linkId: string) => {
    update({ links: project.links.filter(l => l.id !== linkId) });
  };

  const totalCosts = project.finance.filter(f => f.type === 'cost').reduce((s, f) => s + f.amount, 0);
  const totalRevenue = project.finance.filter(f => f.type === 'revenue').reduce((s, f) => s + f.amount, 0);

  const showSection = (section: ProjectTab) => activeTab === 'all' || activeTab === section;

  const statusConf = STATUS_OPTIONS.find(s => s.value === project.status);
  const priorityConf = PRIORITY_OPTIONS.find(p => p.value === project.priority);
  const workspaceName = workspaces.find(w => w.id === project.workspaceId)?.name || 'General';

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isEditing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Editing
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
                Edit
              </>
            )}
          </button>
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-1 mt-3 max-w-4xl mx-auto overflow-x-auto">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.value
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Project Header */}
          {activeTab === 'all' && (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing && editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { update({ name: nameInput }); setEditingName(false); }
                          if (e.key === 'Escape') { setNameInput(project.name); setEditingName(false); }
                        }}
                        className="bg-gray-700 border border-blue-500 rounded-lg px-3 py-2 text-xl font-bold text-white focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => { update({ name: nameInput }); setEditingName(false); }} className="text-blue-400 hover:text-blue-300">
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <h2
                      className={`text-2xl font-bold text-white flex items-center gap-2 ${isEditing ? 'cursor-pointer hover:text-blue-400' : ''} transition-colors`}
                      onClick={() => isEditing && setEditingName(true)}
                    >
                      {project.name}
                      {isEditing && <Pencil className="w-4 h-4 text-gray-600" />}
                    </h2>
                  )}
                  {project.domain && (
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {project.domain}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTogglePin(project.id)}
                    className={`transition-colors ${project.pinned ? 'text-amber-400 hover:text-amber-300' : 'text-gray-600 hover:text-amber-400'}`}
                    title={project.pinned ? 'Unpin project' : 'Pin project'}
                  >
                    <Pin className="w-5 h-5" />
                  </button>
                  {isEditing && (
                    confirmDelete ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">Delete?</span>
                        <button onClick={() => onDelete(project.id)} className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 text-xs">Yes</button>
                        <button onClick={() => setConfirmDelete(false)} className="bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-1 text-xs">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(true)} className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Status, Priority, Category */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {isEditing ? (
                  <div className="flex gap-1.5">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => update({ status: s.value })}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          project.status === s.value ? s.color : 'bg-gray-700/50 text-gray-500 border-transparent hover:bg-gray-700'
                        }`}
                      >
                        {s.icon}
                        {s.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  statusConf && (
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusConf.color}`}>
                      {statusConf.icon}
                      {statusConf.label}
                    </span>
                  )
                )}

                <div className="w-px h-6 bg-gray-700" />

                {isEditing ? (
                  <div className="flex gap-1.5">
                    {PRIORITY_OPTIONS.map(p => (
                      <button
                        key={p.value}
                        onClick={() => update({ priority: p.value })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          project.priority === p.value ? p.color : 'bg-gray-700/50 text-gray-500 border-transparent hover:bg-gray-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  priorityConf && (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${priorityConf.color}`}>
                      {priorityConf.label} Priority
                    </span>
                  )
                )}

                <div className="w-px h-6 bg-gray-700" />

                {isEditing ? (
                  <>
                    <select
                      value={project.category}
                      onChange={e => {
                        if (e.target.value === '__new__') return;
                        update({ category: e.target.value });
                      }}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="New category"
                        value={newCategoryInput}
                        onChange={e => setNewCategoryInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newCategoryInput.trim()) {
                            onAddCategory(newCategoryInput.trim());
                            update({ category: newCategoryInput.trim() });
                            setNewCategoryInput('');
                          }
                        }}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-28"
                      />
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">{project.category}</span>
                )}
              </div>

              {/* Edit mode fields */}
              {isEditing ? (
                <>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Workspace</label>
                      <select
                        value={project.workspaceId || 'ws-default'}
                        onChange={e => update({ workspaceId: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {workspaces.map(ws => (
                          <option key={ws.id} value={ws.id}>{ws.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-px h-8 bg-gray-700" />
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Start Date
                      </label>
                      <input
                        type="date"
                        value={project.startDate || ''}
                        onChange={e => update({ startDate: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Deadline
                      </label>
                      <input
                        type="date"
                        value={project.deadline || ''}
                        onChange={e => update({ deadline: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(project.tags || []).map((tag, i) => (
                        <span key={i} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                          {tag}
                          <button
                            onClick={() => update({ tags: project.tags.filter((_, j) => j !== i) })}
                            className="text-purple-400 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        value={newTagInput}
                        onChange={e => setNewTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newTagInput.trim()) {
                            e.preventDefault();
                            if (!(project.tags || []).includes(newTagInput.trim())) {
                              update({ tags: [...(project.tags || []), newTagInput.trim()] });
                            }
                            setNewTagInput('');
                          }
                        }}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (newTagInput.trim() && !(project.tags || []).includes(newTagInput.trim())) {
                            update({ tags: [...(project.tags || []), newTagInput.trim()] });
                          }
                          setNewTagInput('');
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-2 py-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-gray-500 mb-1 block">Domain</label>
                    <input
                      type="text"
                      value={project.domain}
                      onChange={e => update({ domain: e.target.value })}
                      placeholder="example.com"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-gray-500 mb-1 block">Description</label>
                    <textarea
                      value={project.description}
                      onChange={e => update({ description: e.target.value })}
                      placeholder="What is this project about?"
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-blue-400" /> Currently Working On
                    </label>
                    <input
                      type="text"
                      value={project.currentWork}
                      onChange={e => update({ currentWork: e.target.value })}
                      placeholder="What are you working on right now?"
                      className="w-full bg-gray-700 border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {workspaceName !== 'General' && (
                      <span className="text-xs text-gray-500">Workspace: {workspaceName}</span>
                    )}
                    {project.startDate && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" /> Started: {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {project.deadline && (
                      <span className="flex items-center gap-1 text-xs text-amber-400/70">
                        <Calendar className="w-3 h-3" /> Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {(project.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.description && (
                    <p className="text-sm text-gray-400 mt-3">{project.description}</p>
                  )}

                  {project.domain && (
                    <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <a href={`https://${project.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                        {project.domain}
                      </a>
                    </p>
                  )}

                  {project.currentWork && (
                    <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                      <p className="text-xs text-blue-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Currently Working On
                      </p>
                      <p className="text-sm text-white mt-1">{project.currentWork}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Checklist */}
          {showSection('checklist') && (
            <Section title="Checklist" icon={<ListChecks className="w-4 h-4 text-blue-400" />}>
              <ChecklistSection items={project.checklist} onAdd={addChecklistItem} onToggle={toggleChecklistItem} onRemove={removeChecklistItem} readOnly={!isEditing} />
            </Section>
          )}

          {/* What's Done / Not Done */}
          {(activeTab === 'all' || activeTab === 'checklist') && (
            <div className="grid grid-cols-2 gap-4">
              <Section title="What's Done" icon={<Check className="w-4 h-4 text-emerald-400" />}>
                <TagInput tags={project.whatsDone} onChange={v => update({ whatsDone: v })} placeholder="Add completed item..." readOnly={!isEditing} />
              </Section>
              <Section title="Still Needs" icon={<AlertCircle className="w-4 h-4 text-amber-400" />}>
                <TagInput tags={project.whatsNotDone} onChange={v => update({ whatsNotDone: v })} placeholder="Add pending item..." readOnly={!isEditing} />
              </Section>
            </div>
          )}

          {/* Workflow */}
          {showSection('workflow') && (
            <Section title="Workflow" icon={<GitBranch className="w-4 h-4 text-purple-400" />}>
              <WorkflowSection steps={project.workflow} onAdd={addWorkflowStep} onToggle={toggleWorkflowStep} onRemove={removeWorkflowStep} readOnly={!isEditing} />
            </Section>
          )}

          {/* Tools & Traffic */}
          {(activeTab === 'all' || activeTab === 'workflow') && (
            <div className="grid grid-cols-2 gap-4">
              <Section title="Tools & AI" icon={<Wrench className="w-4 h-4 text-cyan-400" />}>
                <TagInput tags={project.toolsUsed} onChange={v => update({ toolsUsed: v })} placeholder="Supabase, Vercel, GPT..." readOnly={!isEditing} />
              </Section>
              <Section title="Traffic Sources" icon={<TrendingUp className="w-4 h-4 text-green-400" />}>
                <TagInput tags={project.trafficSources} onChange={v => update({ trafficSources: v })} placeholder="Google, Twitter, TikTok..." readOnly={!isEditing} />
              </Section>
            </div>
          )}

          {/* Connected Emails */}
          {activeTab === 'all' && (
            <Section title="Connected Emails" icon={<Mail className="w-4 h-4 text-orange-400" />}>
              <TagInput tags={project.connectedEmails} onChange={v => update({ connectedEmails: v })} placeholder="you@email.com" readOnly={!isEditing} />
            </Section>
          )}

          {/* Links */}
          {showSection('links') && (
            <Section title="Direct Links" icon={<ExternalLink className="w-4 h-4 text-blue-400" />}>
              <LinksSection links={project.links} onAdd={addLink} onRemove={removeLink} readOnly={!isEditing} />
            </Section>
          )}

          {/* Finance */}
          {showSection('finance') && (
            <Section title="Finance" icon={<DollarSign className="w-4 h-4 text-green-400" />}>
              <FinanceSection entries={project.finance} onAdd={addFinanceEntry} onRemove={removeFinanceEntry} totalCosts={totalCosts} totalRevenue={totalRevenue} readOnly={!isEditing} />
            </Section>
          )}

          {/* Notes */}
          {showSection('notes') && (
            <Section title="Notes" icon={<FileText className="w-4 h-4 text-gray-400" />}>
              {isEditing ? (
                <textarea
                  value={project.notes}
                  onChange={e => update({ notes: e.target.value })}
                  placeholder="Free-form notes..."
                  rows={5}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              ) : (
                <div className="text-sm text-gray-300 whitespace-pre-wrap min-h-[40px]">
                  {project.notes || <span className="text-gray-600 italic">No notes yet</span>}
                </div>
              )}
            </Section>
          )}

          {/* Meta */}
          {activeTab === 'all' && (
            <div className="text-xs text-gray-600 text-center pb-8">
              Created: {new Date(project.createdAt).toLocaleDateString()} | Last updated: {new Date(project.updatedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Sub-components */

function ChecklistSection({ items, onAdd, onToggle, onRemove, readOnly }: {
  items: ChecklistItem[]; onAdd: (t: string) => void; onToggle: (id: string) => void; onRemove: (id: string) => void; readOnly?: boolean;
}) {
  const [input, setInput] = useState('');
  const done = items.filter(i => i.done).length;
  const total = items.length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <div>
      {total > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{done}/{total} completed</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <div className="space-y-1.5 mb-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button
              onClick={() => !readOnly && onToggle(item.id)}
              className={`${readOnly ? 'cursor-default' : ''} ${item.done ? 'text-emerald-500' : 'text-gray-500 hover:text-blue-400'}`}
              disabled={readOnly}
            >
              {item.done ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 border border-gray-500 rounded" />}
            </button>
            <span className={`text-sm flex-1 ${item.done ? 'text-gray-500 line-through' : 'text-white'}`}>{item.text}</span>
            {!readOnly && (
              <button onClick={() => onRemove(item.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && <span className="text-xs text-gray-600 italic">No checklist items</span>}
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add checklist item..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onAdd(input); setInput(''); } }}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button onClick={() => { onAdd(input); setInput(''); }} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-2 py-1.5">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function WorkflowSection({ steps, onAdd, onToggle, onRemove, readOnly }: {
  steps: WorkflowStep[]; onAdd: (n: string) => void; onToggle: (id: string) => void; onRemove: (id: string) => void; readOnly?: boolean;
}) {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="space-y-1.5 mb-3">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 group">
            <span className="text-xs text-gray-500 w-5 text-right">{i + 1}.</span>
            <button
              onClick={() => !readOnly && onToggle(step.id)}
              className={`${readOnly ? 'cursor-default' : ''} ${step.completed ? 'text-emerald-500' : 'text-gray-500 hover:text-blue-400'}`}
              disabled={readOnly}
            >
              {step.completed ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 border border-gray-500 rounded-full" />}
            </button>
            <span className={`text-sm flex-1 ${step.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{step.name}</span>
            {!readOnly && (
              <button onClick={() => onRemove(step.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        {steps.length === 0 && <span className="text-xs text-gray-600 italic">No workflow steps</span>}
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add workflow step..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onAdd(input); setInput(''); } }}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button onClick={() => { onAdd(input); setInput(''); }} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-2 py-1.5">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function LinksSection({ links, onAdd, onRemove, readOnly }: {
  links: LinkEntry[]; onAdd: (l: string, u: string) => void; onRemove: (id: string) => void; readOnly?: boolean;
}) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  return (
    <div>
      <div className="space-y-1.5 mb-3">
        {links.map(link => (
          <div key={link.id} className="flex items-center gap-2 group">
            <ExternalLink className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-400 w-20">{link.label}</span>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 truncate flex-1">
              {link.url}
            </a>
            {!readOnly && (
              <button onClick={() => onRemove(link.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        {links.length === 0 && <span className="text-xs text-gray-600 italic">No links</span>}
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Label (GitHub, Live...)"
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-36"
          />
          <input
            type="text"
            placeholder="https://..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onAdd(label, url); setLabel(''); setUrl(''); } }}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button onClick={() => { onAdd(label, url); setLabel(''); setUrl(''); }} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-2 py-1.5">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function FinanceSection({ entries, onAdd, onRemove, totalCosts, totalRevenue, readOnly }: {
  entries: FinanceEntry[]; onAdd: (l: string, a: number, t: 'cost' | 'revenue') => void; onRemove: (id: string) => void;
  totalCosts: number; totalRevenue: number; readOnly?: boolean;
}) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'cost' | 'revenue'>('cost');

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-red-500/10 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Total Costs</p>
          <p className="text-lg font-bold text-red-400">${totalCosts.toFixed(2)}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Total Revenue</p>
          <p className="text-lg font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className={`rounded-lg p-3 text-center ${totalRevenue - totalCosts >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <p className="text-xs text-gray-400">Profit</p>
          <p className={`text-lg font-bold ${totalRevenue - totalCosts >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${(totalRevenue - totalCosts).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-center gap-2 group">
            <span className={`text-xs px-1.5 py-0.5 rounded ${entry.type === 'cost' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {entry.type === 'cost' ? '-' : '+'}
            </span>
            <span className="text-sm text-white flex-1">{entry.label}</span>
            <span className={`text-sm font-medium ${entry.type === 'cost' ? 'text-red-400' : 'text-green-400'}`}>
              ${entry.amount.toFixed(2)}
            </span>
            {!readOnly && (
              <button onClick={() => onRemove(entry.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        {entries.length === 0 && <span className="text-xs text-gray-600 italic">No finance entries</span>}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <select
            value={type}
            onChange={e => setType(e.target.value as 'cost' | 'revenue')}
            className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="cost">Cost</option>
            <option value="revenue">Revenue</option>
          </select>
          <input
            type="text"
            placeholder="Label"
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="$0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && label && amount) {
                onAdd(label, parseFloat(amount), type);
                setLabel(''); setAmount('');
              }
            }}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-24"
          />
          <button
            onClick={() => { if (label && amount) { onAdd(label, parseFloat(amount), type); setLabel(''); setAmount(''); } }}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-2 py-1.5"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
