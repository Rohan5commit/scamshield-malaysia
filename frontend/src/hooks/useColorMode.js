import { useEffect, useState } from 'react';

const STORAGE_KEY = 'scamshield-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storage = window.localStorage;
  const stored = typeof storage?.getItem === 'function' ? storage.getItem(STORAGE_KEY) : null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  if (typeof window.matchMedia !== 'function') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useColorMode() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof window.localStorage?.setItem === 'function') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  return {
    theme,
    toggleTheme() {
      setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    }
  };
}
