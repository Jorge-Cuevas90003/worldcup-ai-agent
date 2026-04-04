import { useState, useCallback } from 'react';

const STORAGE_KEY = 'wca-mode';
const LEARNING_KEY = 'wca-learning';

export default function useMode() {
  const [mode, setModeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'lite'; }
    catch { return 'lite'; }
  });

  const [learning, setLearningState] = useState(() => {
    try { return localStorage.getItem(LEARNING_KEY) === 'true'; }
    catch { return false; }
  });

  const setMode = useCallback((m) => {
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch {}
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'lite' ? 'pro' : 'lite');
  }, [mode, setMode]);

  const toggleLearning = useCallback(() => {
    setLearningState((prev) => {
      const next = !prev;
      try { localStorage.setItem(LEARNING_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const isPro = mode === 'pro';

  return { mode, setMode, toggleMode, isPro, learning, toggleLearning };
}
