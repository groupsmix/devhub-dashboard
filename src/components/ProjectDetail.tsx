import { useState } from 'react';
import type { Project, ProjectStatus, Priority, ChecklistItem, WorkflowStep, FinanceEntry, LinkEntry } from '../types/project';
import {
  Globe, Rocket, Pause, Lightbulb, CalendarClock, Trash2, Plus, X, Check,
  ExternalLink, DollarSign, Mail, Wrench, TrendingUp, FileText, ListChecks,
  GitBranch, ChevronDown, ChevronUp, Pencil, AlertCircle
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

interface ProjectDetailProps {
  project: Project;
  categories: string[];
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
  onAddCategory: (cat: string) => void;
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

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
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
            <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
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
    </div>
  );
}

export default function ProjectDetail({ project, categories, onUpdate, onDelete, onAddCategory }: ProjectDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(project.name);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const update = (updates: Partial<Project>) => onUpdate(project.id, updates);

  // Checklist helpers
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

  // Workflow helpers
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

  // Finance helpers
  const addFinanceEntry = (label: string, amount: number, type: 'cost' | 'revenue') => {
    if (!label.trim()) return;
    update({ finance: [...project.finance, { id: generateId(), label: label.trim(), amount, type }] });
  };
  const removeFinanceEntry = (entryId: string) => {
    update({ finance: project.finance.filter(f => f.id !== entryId) });
  };

  // Link helpers
  const addLink = (label: string, url: string) => {
    if (!label.trim() || !url.trim()) return;
    update({ links: [...project.links, { id: generateId(), label: label.trim(), url: url.trim() }] });
  };
  const removeLink = (linkId: string) => {
    update({ links: project.links.filter(l => l.id !== linkId) });
  };

  const totalCosts = project.finance.filter(f => f.type === 'cost').reduce((s, f) => s + f.amount, 0);
  const totalRevenue = project.finance.filter(f => f.type === 'revenue').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Project Header */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editingName ? (
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
                  className="text-2xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-2"
                  onClick={() => setEditingName(true)}
                >
                  {project.name}
                  <Pencil className="w-4 h-4 text-gray-600" />
                </h2>
              )}
              {project.domain && (
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {project.domain}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">Delete?</span>
                  <button onClick={() => onDelete(project.id)} className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 text-xs">Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-1 text-xs">No</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Status, Priority, Category row */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {/* Status */}
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

            <div className="w-px h-6 bg-gray-700" />

            {/* Priority */}
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

            <div className="w-px h-6 bg-gray-700" />

            {/* Category */}
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
          </div>

          {/* Domain */}
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

          {/* Description */}
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

          {/* Current Work */}
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
        </div>

        {/* Checklist */}
        <Section title="Checklist" icon={<ListChecks className="w-4 h-4 text-blue-400" />}>
          <ChecklistSection items={project.checklist} onAdd={addChecklistItem} onToggle={toggleChecklistItem} onRemove={removeChecklistItem} />
        </Section>

        {/* What's Done / Not Done */}
        <div className="grid grid-cols-2 gap-4">
          <Section title="What's Done" icon={<Check className="w-4 h-4 text-emerald-400" />}>
            <TagInput tags={project.whatsDone} onChange={v => update({ whatsDone: v })} placeholder="Add completed item..." />
          </Section>
          <Section title="Still Needs" icon={<AlertCircle className="w-4 h-4 text-amber-400" />}>
            <TagInput tags={project.whatsNotDone} onChange={v => update({ whatsNotDone: v })} placeholder="Add pending item..." />
          </Section>
        </div>

        {/* Workflow */}
        <Section title="Workflow" icon={<GitBranch className="w-4 h-4 text-purple-400" />}>
          <WorkflowSection steps={project.workflow} onAdd={addWorkflowStep} onToggle={toggleWorkflowStep} onRemove={removeWorkflowStep} />
        </Section>

        {/* Tools & Traffic */}
        <div className="grid grid-cols-2 gap-4">
          <Section title="Tools & AI" icon={<Wrench className="w-4 h-4 text-cyan-400" />}>
            <TagInput tags={project.toolsUsed} onChange={v => update({ toolsUsed: v })} placeholder="Supabase, Vercel, GPT..." />
          </Section>
          <Section title="Traffic Sources" icon={<TrendingUp className="w-4 h-4 text-green-400" />}>
            <TagInput tags={project.trafficSources} onChange={v => update({ trafficSources: v })} placeholder="Google, Twitter, TikTok..." />
          </Section>
        </div>

        {/* Connected Emails */}
        <Section title="Connected Emails" icon={<Mail className="w-4 h-4 text-orange-400" />}>
          <TagInput tags={project.connectedEmails} onChange={v => update({ connectedEmails: v })} placeholder="you@email.com" />
        </Section>

        {/* Links */}
        <Section title="Direct Links" icon={<ExternalLink className="w-4 h-4 text-blue-400" />}>
          <LinksSection links={project.links} onAdd={addLink} onRemove={removeLink} />
        </Section>

        {/* Finance */}
        <Section title="Finance" icon={<DollarSign className="w-4 h-4 text-green-400" />}>
          <FinanceSection entries={project.finance} onAdd={addFinanceEntry} onRemove={removeFinanceEntry} totalCosts={totalCosts} totalRevenue={totalRevenue} />
        </Section>

        {/* Notes */}
        <Section title="Notes" icon={<FileText className="w-4 h-4 text-gray-400" />}>
          <textarea
            value={project.notes}
            onChange={e => update({ notes: e.target.value })}
            placeholder="Free-form notes..."
            rows={5}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </Section>

        {/* Meta */}
        <div className="text-xs text-gray-600 text-center pb-8">
          Created: {new Date(project.createdAt).toLocaleDateString()} | Last updated: {new Date(project.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

/* Sub-components */

function ChecklistSection({ items, onAdd, onToggle, onRemove }: {
  items: ChecklistItem[]; onAdd: (t: string) => void; onToggle: (id: string) => void; onRemove: (id: string) => void;
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
            <button onClick={() => onToggle(item.id)} className={item.done ? 'text-emerald-500' : 'text-gray-500 hover:text-blue-400'}>
              {item.done ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 border border-gray-500 rounded" />}
            </button>
            <span className={`text-sm flex-1 ${item.done ? 'text-gray-500 line-through' : 'text-white'}`}>{item.text}</span>
            <button onClick={() => onRemove(item.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
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
    </div>
  );
}

function WorkflowSection({ steps, onAdd, onToggle, onRemove }: {
  steps: WorkflowStep[]; onAdd: (n: string) => void; onToggle: (id: string) => void; onRemove: (id: string) => void;
}) {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="space-y-1.5 mb-3">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 group">
            <span className="text-xs text-gray-500 w-5 text-right">{i + 1}.</span>
            <button onClick={() => onToggle(step.id)} className={step.completed ? 'text-emerald-500' : 'text-gray-500 hover:text-blue-400'}>
              {step.completed ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 border border-gray-500 rounded-full" />}
            </button>
            <span className={`text-sm flex-1 ${step.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{step.name}</span>
            <button onClick={() => onRemove(step.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
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
    </div>
  );
}

function LinksSection({ links, onAdd, onRemove }: {
  links: LinkEntry[]; onAdd: (l: string, u: string) => void; onRemove: (id: string) => void;
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
            <button onClick={() => onRemove(link.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
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
    </div>
  );
}

function FinanceSection({ entries, onAdd, onRemove, totalCosts, totalRevenue }: {
  entries: FinanceEntry[]; onAdd: (l: string, a: number, t: 'cost' | 'revenue') => void; onRemove: (id: string) => void;
  totalCosts: number; totalRevenue: number;
}) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'cost' | 'revenue'>('cost');

  return (
    <div>
      {/* Summary */}
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

      {/* Entries */}
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
            <button onClick={() => onRemove(entry.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Entry */}
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
    </div>
  );
}
