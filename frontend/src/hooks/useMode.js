import { useState, useCallback } from 'react';

const STORAGE_KEY = 'wca-mode';

export default function useMode() {
  const [mode, setModeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'lite'; }
    catch { return 'lite'; }
  });

  const setMode = useCallback((m) => {
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch {}
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'lite' ? 'pro' : 'lite');
  }, [mode, setMode]);

  const isPro = mode === 'pro';

  return { mode, setMode, toggleMode, isPro };
}
