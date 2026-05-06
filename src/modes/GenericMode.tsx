import { useState } from 'react';
import { TaskData, TaskMode, createTask, incrementStats } from '../lib/firestore';
import { InputPanel } from '../components/InputPanel';
import { OutputCard } from '../components/OutputCard';
import { parseModelOutput } from '../lib/parser';
import { callRefineTask } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Timestamp, serverTimestamp } from 'firebase/firestore';

interface GenericModeProps {
  mode: TaskMode;
  placeholder: string;
  selectedTask?: TaskData | null;
  onSelectTask?: (task: TaskData | null) => void;
  onToggleFavorite?: (id: string, current: boolean) => void;
  onDelete?: (id: string) => void;
}

export function GenericMode({ mode, placeholder, selectedTask, onSelectTask, onToggleFavorite, onDelete }: GenericModeProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (text: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    if (onSelectTask) onSelectTask(null);

    try {
      const result = await callRefineTask({ mode, input: text });
      const parsed = parseModelOutput(mode, result.content);
      
      const newTask: TaskData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        mode,
        inputText: text,
        outputText: result.content,
        outputParsed: parsed,
        isFavorite: false,
        tags: [],
        createdAt: serverTimestamp() as Timestamp,
        tokensUsed: result.usage?.total_tokens || 0,
        modelUsed: 'anthropic/claude-sonnet-4.6',
      };

      await createTask(user.uid, newTask);
      await incrementStats(user.uid, result.usage?.total_tokens || 0);
      if (onSelectTask) onSelectTask(newTask);

    } catch (err: any) {
      console.error(err);
      let errMsg = "Произошла ошибка при обращении к ИИ.";
      if (err.message && err.message.includes('allowlist')) {
         errMsg = "Ваш email не находится в списке разрешенных.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
      
      <div className="space-y-2">
         <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 capitalize">{mode}</h2>
         <p className="text-zinc-600 dark:text-zinc-400 text-sm">Вставьте сырой текст для обработки в формате {mode}</p>
      </div>

      <InputPanel placeholder={placeholder} loading={loading} onSubmit={handleSubmit} />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {selectedTask && (
        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Результат</h3>
            <OutputCard 
               task={selectedTask} 
               onDelete={onDelete} 
               onToggleFavorite={onToggleFavorite} 
               onRegenerate={(input) => handleSubmit(input)}
            />
        </div>
      )}
    </div>
  );
}
