'use client';

import { useCallback, useEffect, useState } from 'react';

// One theme setting for every dashboard page and the sidebar.
// Stored in localStorage; a 'theme-changed' event tells open pages to update.
const KEY = 'dashboard-theme';
const EVENT = 'theme-changed';

function readIsDark(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'light';
  } catch {
    return true;
  }
}

export function setDashboardTheme(dark: boolean) {
  try {
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useDashboardTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const sync = () => setIsDark(readIsDark());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync); // other browser tabs
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggleTheme = useCallback(() => setDashboardTheme(!readIsDark()), []);

  return { isDark, toggleTheme, setTheme: setDashboardTheme };
}