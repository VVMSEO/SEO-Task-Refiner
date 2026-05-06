import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../lib/firebase';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
          S
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          SEO Task Refiner | VVMSEO TOOLS
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {user && (
          <div className="flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            )}
            <button
              onClick={logout}
              className="text-sm p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Выйти"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
