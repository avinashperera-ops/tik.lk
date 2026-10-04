'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-24 h-9 rounded-full bg-slate-300 dark:bg-slate-800 animate-pulse" />;
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);

    // Direct DOM fallthrough for instant theme propagation
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-amber-400 border border-slate-300 dark:border-slate-700 shadow-md transition-all active:scale-95 cursor-pointer font-semibold text-xs"
      aria-label="Toggle Light and Dark Mode"
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-slate-100">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600" />
          <span className="text-slate-800">Dark Mode</span>
        </>
      )}
    </button>
  );
}