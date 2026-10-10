'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'adda_theme';

export function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (t === 'light') {
    root.classList.remove('dark', 'dark-mode');
    root.classList.add('light', 'light-mode');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.remove('light', 'light-mode');
    root.classList.add('dark', 'dark-mode');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        applyTheme(saved);
      } else {
        // Default: system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme: Theme = prefersDark ? 'dark' : 'light';
        setTheme(defaultTheme);
        applyTheme(defaultTheme);
      }
    } catch (e) {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme, setTheme };
}
