import { useState } from 'react';
import type { Project, ProjectStatus, Priority } from '../types/project';
import {
  Globe, Rocket, Pause, Lightbulb, CalendarClock, Plus, X, Send
} from 'lucide-react';

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

interface NewProjectFormProps {
  categories: string[];
  onSubmit: (data: Partial<Project>) => void;
  onCancel: () => void;
  onAddCategory: (cat: string) => void;
}

export default function NewProjectForm({ categories, onSubmit, onCancel, onAddCategory }: NewProjectFormProps) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Other');
  const [status, setStatus] = useState<ProjectStatus>('idea');
  const [priority, setPriority] = useState<Priority>('medium');
  const [description, setDescription] = useState('');
  const [currentWork, setCurrentWork] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [tools, setTools] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const addTool = () => {
    if (toolsInput.trim() && !tools.includes(toolsInput.trim())) {
      setTools([...tools, toolsInput.trim()]);
      setToolsInput('');
    }
  };

  const addEmail = () => {
    if (emailInput.trim() && !emails.includes(emailInput.trim())) {
      setEmails([...emails, emailInput.trim()]);
      setEmailInput('');
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      domain: domain.trim(),
      category,
      status,
      priority,
      description: description.trim(),
      currentWork: currentWork.trim(),
      toolsUsed: tools,
      connectedEmails: emails,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-400" />
              New Project
            </h2>
            <p className="text-sm text-gray-400 mt-1">Fill in the details and hit submit</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Project Name */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Awesome Project"
              autoFocus
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status & Priority */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <div className="mb-4">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Status</label>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      status === s.value ? s.color : 'bg-gray-700/50 text-gray-500 border-transparent hover:bg-gray-700'
                    }`}
                  >
                    {s.icon}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Priority</label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      priority === p.value ? p.color : 'bg-gray-700/50 text-gray-500 border-transparent hover:bg-gray-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Domain & Category */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Category</label>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="New..."
                  value={newCategoryInput}
                  onChange={e => setNewCategoryInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newCategoryInput.trim()) {
                      onAddCategory(newCategoryInput.trim());
                      setCategory(newCategoryInput.trim());
                      setNewCategoryInput('');
                    }
                  }}
                  className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Current Work */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Currently Working On</label>
            <input
              type="text"
              value={currentWork}
              onChange={e => setCurrentWork(e.target.value)}
              placeholder="What are you working on right now?"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tools */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Tools & AI</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tools.map((t, i) => (
                <span key={i} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  {t}
                  <button onClick={() => setTools(tools.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={toolsInput}
                onChange={e => setToolsInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTool())}
                placeholder="Supabase, Vercel, GPT..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button onClick={addTool} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-3 py-2 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Connected Emails */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Connected Email</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {emails.map((e, i) => (
                <span key={i} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  {e}
                  <button onClick={() => setEmails(emails.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                placeholder="you@email.com"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button onClick={addEmail} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-3 py-2 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2 pb-8">
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3.5 text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
            >
              <Send className="w-4 h-4" />
              Submit Project
            </button>
            <button
              onClick={onCancel}
              className="px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl py-3.5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
