'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(savedTheme);
  }, []);
 
  useEffect(() => {
    if (!theme) return;

    localStorage.setItem('theme', theme);

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved =
      theme === 'dark' || (theme === 'system' && systemPrefersDark) ? 'dark' : 'light';

    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.setProperty(
      '--background',
      resolved === 'dark' ? '#0a0a0a' : '#ffffff'
    );
    document.documentElement.style.setProperty(
      '--foreground',
      resolved === 'dark' ? '#ededed' : '#171717'
    );
    
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
 
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newResolved = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      document.documentElement.setAttribute('data-theme', newResolved);
      document.documentElement.style.setProperty(
        '--background',
        newResolved === 'dark' ? '#0a0a0a' : '#ffffff'
      );
      document.documentElement.style.setProperty(
        '--foreground',
        newResolved === 'dark' ? '#ededed' : '#171717'
      );

      if (newResolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  if (!theme) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
