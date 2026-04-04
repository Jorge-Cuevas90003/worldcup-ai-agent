import { NavLink, Outlet } from 'react-router-dom';
import { Trophy, Bell, CalendarDays, BarChart3, Shield, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import ThemePicker from './ThemePicker';
import ModeSwitcher from './ModeSwitcher';
import Ticker from './Ticker';
import LearnOverlay from './LearnOverlay';
import { navStyle, headingStyle, textureOverlay } from '../utils/styles';

const liteNav = [
  { to: '/', icon: Trophy, label: 'Home' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/matches', icon: CalendarDays, label: 'Games' },
  { to: '/connections', icon: Shield, label: 'Vault' },
];

const proNav = [
  { to: '/', icon: Trophy, label: 'Dashboard' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/matches', icon: CalendarDays, label: 'Matches' },
  { to: '/analysis', icon: BarChart3, label: 'Analysis' },
  { to: '/connections', icon: Shield, label: 'Vault' },
];

// World Cup 2026 kickoff: June 11, 2026
const WC_START = new Date('2026-06-11T00:00:00Z').getTime();

function useCountdown() {
  const [diff, setDiff] = useState(WC_START - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(WC_START - Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, live: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, live: false };
}

export default function Layout({
  theme, themeKey, setTheme, mode, toggleMode, isPro, bp, teams,
  dataSource, lastUpdate, learning, toggleLearning,
}) {
  const [time, setTime] = useState(new Date());
  const countdown = useCountdown();
  const isMobile = ['xxs', 'xs', 'sm'].includes(bp);
  const isXXS = bp === 'xxs';
  const nav = isPro ? proNav : liteNav;

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const ff = isPro ? theme.fontHeading : theme.fontBody;
  const isLive = dataSource && dataSource !== 'loading' && dataSource !== 'fallback';

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg, backgroundImage: theme.mesh,
      color: theme.text, fontFamily: theme.fontBody,
      position: 'relative', overflow: 'hidden',
      ...textureOverlay(theme),
    }}>
      {/* Floating orbs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
        borderRadius: '50%', background: theme.orbA, filter: 'blur(80px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-15%', right: '-10%', width: '40vw', height: '40vw',
        borderRadius: '50%', background: theme.orbB, filter: 'blur(60px)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: isMobile ? 0 : 12, zIndex: 100,
        margin: isMobile ? 0 : '0 16px',
        ...navStyle(theme),
        borderRadius: isMobile ? 0 : theme.borderRadius,
        padding: isMobile ? '10px 14px' : '12px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 14 }}>
          {/* Logo */}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 16px ${theme.primaryGlow}`,
          }}>
            <Trophy size={18} color="#fff" />
          </div>
          {!isXXS && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: 15, fontWeight: 800, color: theme.text, fontFamily: ff,
                letterSpacing: isPro ? '0.15em' : 0, textTransform: isPro ? 'uppercase' : 'none',
                lineHeight: 1,
              }}>
                {isPro ? 'WCA' : 'WorldCup'}
              </span>
              {/* Data source indicator */}
              <span style={{
                fontSize: 9, fontFamily: '"Space Mono", monospace', letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', gap: 4,
                color: isLive ? theme.green : theme.textMuted,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: isLive ? theme.green : theme.textMuted,
                  animation: isLive ? 'pulse 2s infinite' : 'none',
                  boxShadow: isLive ? `0 0 6px ${theme.greenGlow}` : 'none',
                }} />
                {isLive ? 'LIVE' : 'DEMO'}
              </span>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Countdown pill */}
          {!isXXS && (
            <div style={{
              padding: '4px 10px', borderRadius: 10, fontSize: 10,
              fontFamily: '"Space Mono", monospace', color: theme.textDim,
              background: theme.card2, display: 'flex', alignItems: 'center', gap: 6,
              border: `1px solid ${theme.glassBorder}`,
            }}>
              <Trophy size={9} color={theme.primary} />
              {countdown.live ? (
                <span style={{ color: theme.green, fontWeight: 700 }}>TOURNAMENT LIVE</span>
              ) : (
                <span>
                  <strong style={{ color: theme.text }}>{countdown.days}</strong>d{' '}
                  <strong style={{ color: theme.text }}>{countdown.hours}</strong>h{' '}
                  <strong style={{ color: theme.text }}>{countdown.minutes}</strong>m{' '}
                  {!isMobile && <><strong style={{ color: theme.text }}>{countdown.seconds}</strong>s</>}
                </span>
              )}
            </div>
          )}

          {/* Clock */}
          {!isMobile && (
            <div style={{
              padding: '4px 10px', borderRadius: 10, background: theme.card2,
              fontSize: 11, fontFamily: '"Space Mono", monospace', color: theme.textDim,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Clock size={10} />
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

          <ModeSwitcher mode={mode} toggleMode={toggleMode} theme={theme} isPro={isPro} learning={learning} toggleLearning={toggleLearning} />
          <ThemePicker themeKey={themeKey} setTheme={setTheme} theme={theme} />
        </div>

        {/* Desktop pill nav */}
        {!isMobile && (
          <nav style={{
            display: 'flex', gap: 3, marginTop: 10, padding: 3,
            borderRadius: theme.borderRadius, background: theme.card2, width: 'fit-content',
          }}>
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                  borderRadius: Math.max(theme.borderRadius - 3, 0), fontSize: 12, fontWeight: 600,
                  color: isActive ? '#fff' : theme.textDim,
                  background: isActive ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})` : 'transparent',
                  textDecoration: 'none', fontFamily: ff,
                  textTransform: isPro ? 'uppercase' : 'none',
                  letterSpacing: isPro ? '0.08em' : 0,
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                  boxShadow: isActive ? `0 2px 12px ${theme.primaryGlow}` : 'none',
                })}
              >
                <item.icon size={13} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {learning && isPro && !isXXS && <LearnOverlay section="ticker" theme={theme} />}
      {isPro && !isXXS && <Ticker teams={teams} theme={theme} />}

      <main style={{ position: 'relative', zIndex: 1, paddingBottom: isMobile ? 80 : 24, minHeight: 'calc(100vh - 120px)' }}>
        <Outlet />
      </main>

      {!isMobile && (
        <footer style={{
          position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px 24px',
          fontSize: 11, color: theme.textMuted, fontFamily: '"Space Mono", monospace',
        }}>
          {dataSource && dataSource !== 'loading' && dataSource !== 'fallback' && (
            <span style={{ color: theme.green }}>Polymarket live data</span>
          )}
          {dataSource === 'fallback' && (
            <span style={{ color: theme.textMuted }}>Demo data (Polymarket API unreachable)</span>
          )}
          {' / Auth0 Token Vault / Auth0 Hackathon & ZerveHack 2026'}
        </footer>
      )}

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 10, left: 12, right: 12, zIndex: 100,
          ...navStyle(theme),
          borderRadius: theme.borderRadius,
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          height: 58,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '8px 0', minWidth: 48, textDecoration: 'none',
                fontSize: 9, fontWeight: 600, fontFamily: ff,
                color: isActive ? theme.primary : theme.textMuted,
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})` : 'transparent',
                    boxShadow: isActive ? `0 2px 10px ${theme.primaryGlow}` : 'none',
                    transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                  }}>
                    <item.icon size={16} color={isActive ? '#fff' : theme.textMuted} />
                  </div>
                  <span style={{ color: isActive ? theme.primary : theme.textMuted }}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes numberPop { 0% { transform:scale(1); } 30% { transform:scale(1.12); } 100% { transform:scale(1); } }
        @keyframes confettiBurst {
          0% { opacity:1; transform:translate(-50%,-50%) translateY(0) translateX(0) rotate(0deg) scale(1); }
          100% { opacity:0; transform:translate(-50%,-50%) translateY(-80vh) translateX(var(--confetti-x,0)) rotate(var(--confetti-r,360deg)) scale(0.3); }
        }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes glow { 0%,100% { box-shadow:0 0 20px ${theme.primaryGlow}; } 50% { box-shadow:0 0 40px ${theme.primaryGlow}; } }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        @keyframes toastIn { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }
        @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(100px); } }
        .card-hover { transition:transform 0.2s ease,box-shadow 0.2s ease; }
        .card-hover:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.12); }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { margin:0; -webkit-font-smoothing:antialiased; background:${theme.bg}; }
        a { color:inherit; }
        ::selection { background:${theme.primaryBg}; color:${theme.primary}; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${theme.border}; border-radius:3px; }
      `}</style>
    </div>
  );
}
