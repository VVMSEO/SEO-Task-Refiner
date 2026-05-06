import { TaskData } from "../lib/firestore";
import { Copy, Trash2, Star, Clock } from 'lucide-react';

interface HistoryListProps {
  tasks: TaskData[];
  onSelect: (task: TaskData) => void;
  onDelete: (id: string) => void | Promise<void>;
  onToggleFavorite: (id: string, current: boolean) => void | Promise<void>;
}

export function HistoryList({ tasks, onSelect, onDelete, onToggleFavorite }: HistoryListProps) {
  if (tasks.length === 0) {
    return (
        <div className="h-full flex items-center justify-center text-zinc-400 p-6 text-center">
            <div className="flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 opacity-50" />
                <p className="text-sm">История пуста</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto h-[calc(100vh-73px)]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Последние ({tasks.length})</h3>
      {tasks.map(task => (
        <div key={task.id} className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors" onClick={() => onSelect(task)}>
            <div className="flex items-start justify-between mb-2">
                 <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {task.mode}
                 </span>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(task.id, task.isFavorite); }} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                        <Star className={`w-3.5 h-3.5 ${task.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                 </div>
            </div>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-relaxed">
                {task.inputText}
            </p>
            <div className="mt-2 text-[10px] text-zinc-400">
                {task.createdAt?.toDate().toLocaleDateString('ru-RU')} {task.createdAt?.toDate().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
            </div>
        </div>
      ))}
    </div>
  );
}
