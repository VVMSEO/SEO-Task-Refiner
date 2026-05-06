import { TaskData } from '../lib/firestore';
import { Copy, Trash2, Star, RefreshCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

interface OutputCardProps {
  key?: React.Key;
  task: TaskData;
  onDelete?: (id: string) => void | Promise<void>;
  onToggleFavorite?: (id: string, current: boolean) => void | Promise<void>;
  onRegenerate?: (input: string) => void;
}

export function OutputCard({ task, onDelete, onToggleFavorite, onRegenerate }: OutputCardProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(task.outputText);
    };

    const renderContent = () => {
        const p = task.outputParsed;
        if (!p) return <pre className="whitespace-pre-wrap text-sm">{task.outputText}</pre>;

        if (task.mode === 'refine' && p.title) {
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{p.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Цель" value={p.goal} />
                        <Field label="Объект" value={p.object} />
                        <Field label="Артефакт" value={p.artifact} />
                        <Field label="Done-критерий" value={p.done} />
                        <Field label="Малый шаг (MVP)" value={p.mvp} />
                        <Field label="Что НЕ входит" value={p.notIncluded} />
                        <Field label="Метрика" value={p.metric} />
                        <Field label="Следующая задача" value={p.nextTask} />
                    </div>
                </div>
            );
        } else if (task.mode === 'split' && p.tasks) {
            return (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Подзадачи</h3>
                    <div className="flex flex-col gap-3">
                        {p.tasks.map((t: any, i: number) => (
                            <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                                <h4 className="font-semibold mb-2">{t.title}</h4>
                                <div className="text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
                                    <p><span className="font-medium">Результат:</span> {t.result}</p>
                                    <p><span className="font-medium">Done-критерий:</span> {t.done}</p>
                                    <p><span className="font-medium">Длительность:</span> {t.duration}</p>
                                    <p><span className="font-medium">Нужна до след. шага:</span> {t.needed}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else if (task.mode === 'kanban' && p.title) {
             return (
                 <div className="bg-zinc-50 dark:bg-zinc-900/80 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                    <span className="font-bold underline">{p.title}</span>\\n\\n
                    {p.description}
                 </div>
             )
        } else if (task.mode === 'audit' && Object.keys(p).length > 2) {
             return (
                  <div className="space-y-3">
                    <Field label="1. Конкретное действие" value={p.hasAction} />
                    <Field label="2. Объект" value={p.hasObject} />
                    <Field label="3. Артефакт" value={p.hasArtifact} />
                    <Field label="4. Done-критерий" value={p.hasDone} />
                    <Field label="5. Размер" value={p.isTooBig} />
                    <Field label="6. Нужен MVP" value={p.needsMvp} />
                    <Field label="7. Размытости" value={p.blurred} />
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 rounded-lg border border-blue-100 dark:border-blue-900/50">
                       <p className="text-xs uppercase font-bold tracking-wider mb-2 text-blue-500 dark:text-blue-400">Переписанная задача</p>
                       <p className="font-medium">{p.rewritten}</p>
                    </div>
                  </div>
             )
        }

        return <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 font-mono bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-auto">{task.outputText}</pre>;
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 flex-1">
            {renderContent()}
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 transition-colors">
                    <Copy className="w-4 h-4" /> Копировать
                 </button>
                 {onToggleFavorite && (
                    <button onClick={() => onToggleFavorite(task.id, task.isFavorite)} className={twMerge(clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors", task.isFavorite ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50" : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"))}>
                        <Star className={twMerge(clsx("w-4 h-4", task.isFavorite && "fill-current"))} /> Сохранить
                    </button>
                 )}
                 {onRegenerate && (
                     <button onClick={() => onRegenerate(task.inputText)} className="flex flex-col md:flex-row items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 transition-colors">
                        <RefreshCcw className="w-4 h-4" /> Повторить
                     </button>
                 )}
             </div>
             {onDelete && (
                <button onClick={() => onDelete(task.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Удалить">
                   <Trash2 className="w-4 h-4" />
                </button>
             )}
          </div>
        </div>
    )
}

function Field({ label, value }: { label: string; value?: string }) {
    if (!value || value === 'null' || value === 'undefined') return null;
    return (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-1 block">{label}</span>
            <span className="text-sm text-zinc-800 dark:text-zinc-200 break-words leading-snug">{value}</span>
        </div>
    )
}
