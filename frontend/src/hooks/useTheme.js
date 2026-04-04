import { useState, useCallback } from 'react';
import themes, { themeKeys } from '../config/themes';

const STORAGE_KEY = 'wca-theme';

export default function useTheme() {
  const [themeKey, setThemeKey] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
      // Auto-detect: light system → arctic-ice, dark → midnight-gold
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'arctic-ice';
      return 'midnight-gold';
    } catch { return 'midnight-gold'; }
  });

  const setTheme = useCallback((key) => {
    setThemeKey(key);
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }, []);

  return { themeKey, theme: themes[themeKey] || themes['midnight-gold'], setTheme, themeKeys };
}
