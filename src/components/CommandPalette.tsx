import { useState, useEffect, useRef, useMemo } from 'react';
import type { Project } from '../types/project';
import { Search, FolderOpen, ArrowRight, Command } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onShowToday: () => void;
  onShowOverview: () => void;
  onShowKanban: () => void;
  onShowTimeline: () => void;
  onExport: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: 'project' | 'action' | 'view';
  action: () => void;
}

export default function CommandPalette({
  open, onClose, projects, onSelectProject, onAddProject,
  onShowToday, onShowOverview, onShowKanban, onShowTimeline, onExport,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<CommandItem[]>(() => {
    const actions: CommandItem[] = [
      { id: 'new-project', label: 'New Project', description: 'Create a new project', category: 'action', action: onAddProject },
      { id: 'today', label: "Today's Focus", description: 'View daily tasks', category: 'view', action: onShowToday },
      { id: 'overview', label: 'Dashboard Overview', description: 'See all stats', category: 'view', action: onShowOverview },
      { id: 'kanban', label: 'Kanban Board', description: 'Visual project board', category: 'view', action: onShowKanban },
      { id: 'timeline', label: 'Timeline View', description: 'Project timeline', category: 'view', action: onShowTimeline },
      { id: 'export', label: 'Export Data', description: 'Download all data as JSON', category: 'action', action: onExport },
    ];

    const projectItems: CommandItem[] = projects.map(p => ({
      id: p.id,
      label: p.name,
      description: `${p.status} - ${p.category}`,
      category: 'project' as const,
      action: () => onSelectProject(p.id),
    }));

    const all = [...actions, ...projectItems];

    if (!query.trim()) return all;

    const q = query.toLowerCase();
    return all.filter(item =>
      item.label.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  }, [query, projects, onAddProject, onShowToday, onShowOverview, onShowKanban, onShowTimeline, onExport, onSelectProject]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && items[selectedIndex]) {
      e.preventDefault();
      items[selectedIndex].action();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  const categoryLabels: Record<string, string> = {
    action: 'Actions',
    view: 'Views',
    project: 'Projects',
  };

  const grouped = items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  let globalIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, actions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">
            <Command className="w-3 h-3" />K
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500 text-sm">No results found</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category}>
                <p className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {categoryLabels[category] || category}
                </p>
                {categoryItems.map(item => {
                  globalIndex++;
                  const idx = globalIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { item.action(); onClose(); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        selectedIndex === idx ? 'bg-blue-600/20 text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {item.category === 'project' ? (
                        <FolderOpen className="w-4 h-4 text-gray-500 shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-800 text-xs text-gray-500">
          <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">&#8593;&#8595;</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">&#9166;</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
