import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface InputPanelProps {
  placeholder: string;
  loading: boolean;
  onSubmit: (text: string) => void;
}

export function InputPanel({ placeholder, loading, onSubmit }: InputPanelProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.max(100, Math.min(textareaRef.current.scrollHeight, 300))}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim() && !loading) {
      onSubmit(text);
      setText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit();
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        className="w-full bg-transparent border-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-0 min-h-[100px]"
      />
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 dark:text-zinc-500">
            Нажмите Cmd+Enter для отправки
        </span>
        <button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 text-white disabled:text-blue-100 dark:disabled:text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Обработать
        </button>
      </div>
    </div>
  );
}
