import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Matches from './pages/Matches';
import Analysis from './pages/Analysis';
import Connections from './pages/Connections';
import Callback from './pages/Callback';
import useTheme from './hooks/useTheme';
import useMode from './hooks/useMode';
import useBreakpoint from './hooks/useBreakpoint';
import { fetchLiveOdds, calculateMomentum } from './services/polymarket';
import { saveOddsSnapshot, saveAlert } from './services/supabase';
import { ToastProvider } from './components/Toast';
import Confetti from './components/Confetti';
import Onboarding from './components/Onboarding';

const POLL_INTERVAL = 15_000; // Re-fetch every 15s (Polymarket allows 24K req/min)

const fallbackTeams = [
  { team: 'Spain', flag: '🇪🇸', odds: 15.3, volume: 48200000, change: 0, volumeNum: 48200000 },
  { team: 'England', flag: '🇬🇧', odds: 12.8, volume: 38100000, change: 0, volumeNum: 38100000 },
  { team: 'France', flag: '🇫🇷', odds: 10.7, volume: 35500000, change: 0, volumeNum: 35500000 },
  { team: 'Argentina', flag: '🇦🇷', odds: 10.1, volume: 42000000, change: 0, volumeNum: 42000000 },
  { team: 'Brazil', flag: '🇧🇷', odds: 9.4, volume: 40000000, change: 0, volumeNum: 40000000 },
  { team: 'Germany', flag: '🇩🇪', odds: 7.2, volume: 28000000, change: 0, volumeNum: 28000000 },
  { team: 'Portugal', flag: '🇵🇹', odds: 5.8, volume: 22000000, change: 0, volumeNum: 22000000 },
  { team: 'Netherlands', flag: '🇳🇱', odds: 4.1, volume: 15000000, change: 0, volumeNum: 15000000 },
  { team: 'Belgium', flag: '🇧🇪', odds: 3.2, volume: 12000000, change: 0, volumeNum: 12000000 },
  { team: 'Mexico', flag: '🇲🇽', odds: 1.8, volume: 8000000, change: 0, volumeNum: 8000000 },
];

export default function App() {
  const { themeKey, theme, setTheme } = useTheme();
  const { mode, toggleMode, isPro, learning, toggleLearning } = useMode();
  const bp = useBreakpoint();
  const [teams, setTeams] = useState(fallbackTeams);
  const [dataSource, setDataSource] = useState('loading');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const prevOddsRef = useRef({});

  // Fetch live data from Polymarket
  const fetchData = useCallback(async () => {
    const result = await fetchLiveOdds();
    if (!result || result.teams.length === 0) {
      setDataSource('fallback');
      return;
    }

    // Calculate changes vs previous fetch
    const prev = prevOddsRef.current;
    const newAlerts = [];
    const teamsWithMeta = result.teams.map((t) => {
      const prevOdds = prev[t.team];
      const change = prevOdds != null ? Math.round((t.odds - prevOdds) * 100) / 100 : 0;
      const momentum = calculateMomentum(t, result.teams);

      // Generate alert if any detectable change (0.05%+)
      if (prevOdds != null && Math.abs(change) >= 0.05) {
        const type = change > 0 ? 'hot' : 'drop';
        const alert = {
          id: `${t.team}-${Date.now()}`,
          team: t.team, flag: t.flag,
          previousOdds: prevOdds, currentOdds: t.odds,
          change, type, severity: Math.min(100, Math.round(Math.abs(change) * 20)),
          message: `${t.team} odds ${change > 0 ? 'surged' : 'dropped'} ${Math.abs(change).toFixed(1)}%`,
          detail: `${prevOdds.toFixed(1)}% → ${t.odds.toFixed(1)}% | Vol: $${(t.volume / 1e6).toFixed(1)}M`,
          timestamp: { _seconds: Date.now() / 1000 },
        };
        newAlerts.push(alert);
      }

      return { ...t, change, momentum };
    });

    // Save current odds for next comparison
    const newPrev = {};
    teamsWithMeta.forEach((t) => { newPrev[t.team] = t.odds; });
    prevOddsRef.current = newPrev;

    setTeams(teamsWithMeta);
    setDataSource(result.source);
    setLastUpdate(new Date());

    // Save snapshot to Supabase (fire and forget)
    saveOddsSnapshot(teamsWithMeta).catch(() => {});

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50));

      // Persist each alert to Supabase (fire-and-forget)
      newAlerts.forEach((a) => {
        saveAlert({
          team: a.team,
          flag: a.flag,
          previous_odds: a.previousOdds,
          current_odds: a.currentOdds,
          change: a.change,
          type: a.type,
          severity: a.severity,
          message: a.message,
          detail: a.detail,
        }).catch(() => {});
      });

      // Confetti on surges
      if (newAlerts.some((a) => a.type === 'hot' && Math.abs(a.change) >= 0.3)) {
        setConfettiTrigger((c) => c + 1);
      }
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  return (
    <BrowserRouter>
      <ToastProvider theme={theme}>
        <Confetti trigger={confettiTrigger} theme={theme} />
        <Onboarding theme={theme} />
        <Routes>
          <Route element={
            <Layout
              theme={theme} themeKey={themeKey} setTheme={setTheme}
              mode={mode} toggleMode={toggleMode} isPro={isPro}
              bp={bp} teams={teams} dataSource={dataSource}
              lastUpdate={lastUpdate}
              learning={learning} toggleLearning={toggleLearning}
            />
          }>
            <Route index element={
              <Dashboard isPro={isPro} theme={theme} bp={bp}
                teams={teams} dataSource={dataSource} lastUpdate={lastUpdate}
                learning={learning} />
            } />
            <Route path="alerts" element={
              <Alerts isPro={isPro} theme={theme} bp={bp} liveAlerts={alerts} learning={learning} />
            } />
            <Route path="matches" element={<Matches isPro={isPro} theme={theme} bp={bp} learning={learning} />} />
            <Route path="analysis" element={<Analysis theme={theme} bp={bp} teams={teams} learning={learning} />} />
            <Route path="connections" element={<Connections isPro={isPro} theme={theme} bp={bp} learning={learning} />} />
            <Route path="callback" element={<Callback theme={theme} />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
