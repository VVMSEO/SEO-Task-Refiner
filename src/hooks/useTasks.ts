import { useState, useEffect } from 'react';
import { subscribeToHistory, TaskData, deleteTask, updateTask } from '../lib/firestore';
import { useAuth } from './useAuth';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const unsub = subscribeToHistory(user.uid, (data) => {
      setTasks(data);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const removeTask = async (taskId: string) => {
    if (!user) return;
    await deleteTask(user.uid, taskId);
  };

  const toggleFavorite = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    await updateTask(user.uid, taskId, { isFavorite: !currentStatus });
  };

  return { tasks, loading, removeTask, toggleFavorite };
}
