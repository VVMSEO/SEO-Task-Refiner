import { useState } from 'react';
import { Header } from './components/Header';
import { ModeSidebar } from './components/ModeSidebar';
import { HistoryList } from './components/HistoryList';
import { GenericMode } from './modes/GenericMode';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { TaskMode, TaskData } from './lib/firestore';
import { signInWithGoogle } from './lib/firebase';
import { Loader2 } from 'lucide-react';
import { OutputCard } from './components/OutputCard';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { tasks, removeTask, toggleFavorite, loading: tasksLoading } = useTasks();
  const [currentMode, setCurrentMode] = useState<TaskMode | 'favorites'>('refine');
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-zinc-500 font-medium">Загрузка приложения...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="max-w-sm w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center shadow-sm">
           <div className="w-12 h-12 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">S</div>
           <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">SEO Task Refiner</h1>
           <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-sm">Вход только для участников allowlist</p>
           <button 
             onClick={signInWithGoogle}
             className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors"
           >
             Войти через Google
           </button>
        </div>
      </div>
    );
  }

  const modePlaceholders = {
    refine: "Вставьте пункт чеклиста (например: 'Проработать тайтлы на страницах каталога')",
    split: "Вставьте большую задачу для разбивки...",
    kanban: "Вставьте сырой пункт для Kanban...",
    audit: "Вставьте сформулированную задачу для оценки..."
  };

  const handleModeChange = (mode: TaskMode | 'favorites') => {
    setCurrentMode(mode);
    setSelectedTask(null);
  };

  const renderContent = () => {
    if (currentMode === 'favorites') {
      const favorites = tasks.filter(t => t.isFavorite);
      return (
        <div className="max-w-4xl w-full mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Избранное</h2>
          {favorites.length === 0 ? (
            <p className="text-zinc-500 bg-white dark:bg-zinc-900 p-8 text-center rounded-xl border border-zinc-200 dark:border-zinc-800">Нет сохраненных задач</p>
          ) : (
            <div className="space-y-6">
              {favorites.map(t => (
                <OutputCard 
                  key={t.id} 
                  task={t} 
                  onDelete={removeTask} 
                  onToggleFavorite={toggleFavorite} 
                />
              ))}
            </div>
          )}
        </div>
      );
    }

      const activeTask = selectedTask && selectedTask.mode === currentMode ? selectedTask : null;
      
      return (
         <GenericMode 
            mode={currentMode} 
            placeholder={modePlaceholders[currentMode as TaskMode]} 
            selectedTask={activeTask}
            onSelectTask={setSelectedTask}
            onToggleFavorite={toggleFavorite}
            onDelete={(id) => { removeTask(id); setSelectedTask(null); }}
         />
      )
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ModeSidebar currentMode={currentMode} onChange={handleModeChange} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
           {renderContent()}
        </main>
        <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 hidden xl:block">
           <HistoryList 
             tasks={tasks} 
             onSelect={(task) => { setCurrentMode(task.mode); setSelectedTask(task); }} 
             onDelete={(id) => { removeTask(id); if (selectedTask?.id === id) setSelectedTask(null); }}
             onToggleFavorite={toggleFavorite}
           />
        </aside>
      </div>
    </div>
  );
}

export default App;
