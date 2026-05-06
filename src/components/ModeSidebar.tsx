import { CheckCircle2, SplitSquareHorizontal, KanbanSquare, ClipboardCheck, Star } from 'lucide-react';
import { TaskMode } from '../lib/firestore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ModeSidebarProps {
  currentMode: TaskMode | 'favorites';
  onChange: (mode: TaskMode | 'favorites') => void;
}

export function ModeSidebar({ currentMode, onChange }: ModeSidebarProps) {
  const modes = [
    { id: 'refine', label: 'Refine', icon: CheckCircle2 },
    { id: 'split', label: 'Split', icon: SplitSquareHorizontal },
    { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
    { id: 'audit', label: 'Audit', icon: ClipboardCheck },
    { id: 'favorites', label: 'Избранное', icon: Star },
  ] as const;

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 h-[calc(100vh-73px)] shrink-0 hidden md:block">
      <nav className="flex flex-col gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id as TaskMode | 'favorites')}
              className={twMerge(
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left",
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                )
              )}
            >
              <Icon className="w-5 h-5" />
              {m.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
