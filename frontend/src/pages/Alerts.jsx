import { Bell } from 'lucide-react';
import AlertCard from '../components/AlertCard';
import LearnOverlay from '../components/LearnOverlay';

const demoAlerts = [
  { id: 'demo-1', team: 'Spain', flag: '🇪🇸', previousOdds: 14.1, currentOdds: 15.3, change: 1.2, type: 'hot', severity: 24, message: 'Spain odds surged 1.2%', detail: '14.1% → 15.3% | Vol: $48.2M', timestamp: { _seconds: Date.now() / 1000 - 600 }, isDemo: true },
  { id: 'demo-2', team: 'Germany', flag: '🇩🇪', previousOdds: 8.5, currentOdds: 7.2, change: -1.3, type: 'drop', severity: 26, message: 'Germany odds dropped 1.3%', detail: '8.5% → 7.2% | Vol: $28.0M', timestamp: { _seconds: Date.now() / 1000 - 1800 }, isDemo: true },
  { id: 'demo-3', team: 'Mexico', flag: '🇲🇽', previousOdds: 1.5, currentOdds: 1.8, change: 0.3, type: 'hot', severity: 6, message: 'Mexico odds surged 0.3%', detail: '1.5% → 1.8% | Vol: $8.0M', timestamp: { _seconds: Date.now() / 1000 - 3600 }, isDemo: true },
  { id: 'demo-4', team: 'England', flag: '🇬🇧', previousOdds: 11.6, currentOdds: 12.8, change: 1.2, type: 'hot', severity: 24, message: 'England odds surged 1.2%', detail: '11.6% → 12.8% | Vol: $38.1M', timestamp: { _seconds: Date.now() / 1000 - 7200 }, isDemo: true },
  { id: 'demo-5', team: 'France', flag: '🇫🇷', previousOdds: 11.2, currentOdds: 10.7, change: -0.5, type: 'drop', severity: 10, message: 'France odds dropped 0.5%', detail: '11.2% → 10.7% | Vol: $35.5M', timestamp: { _seconds: Date.now() / 1000 - 10800 }, isDemo: true },
];

export default function Alerts({ isPro, theme, bp, liveAlerts = [], learning }) {
  const isMobile = ['xxs', 'xs', 'sm'].includes(bp);
  const hasLive = liveAlerts.length > 0;

  // Filter live alerts to only those with >= 0.3% change
  const significantAlerts = liveAlerts.filter((a) => Math.abs(a.change) >= 0.3);

  // Combine for aggregate counts
  const allAlerts = [...significantAlerts, ...demoAlerts];
  const surges = allAlerts.filter((a) => a.type === 'hot').length;
  const drops = allAlerts.filter((a) => a.type === 'drop').length;

  return (
    <div style={{ padding: isMobile ? '16px 14px' : '24px', maxWidth: isPro ? 900 : 640, margin: '0 auto' }}>
      {learning && <LearnOverlay section="alerts" theme={theme} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${theme.primaryGlow}`,
        }}>
          <Bell size={18} color="#fff" />
        </div>
        <div>
          <h2 style={{
            fontSize: isPro ? 15 : 20, fontWeight: isPro ? 600 : 800, color: theme.text, margin: 0,
            fontFamily: theme.fontHeading,
            textTransform: isPro ? 'uppercase' : 'none', letterSpacing: isPro ? '0.12em' : 0,
          }}>
            {isPro ? 'ALERT FEED' : 'Recent Alerts'}
          </h2>
          <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontData, display: 'flex', alignItems: 'center', gap: 6 }}>
            {hasLive && (
              <span style={{
                width: 5, height: 5, borderRadius: '50%', background: theme.green,
                animation: 'pulse 2s infinite', boxShadow: `0 0 6px ${theme.greenGlow}`,
              }} />
            )}
            {significantAlerts.length > 0
              ? `${significantAlerts.length} live alert${significantAlerts.length !== 1 ? 's' : ''} + ${demoAlerts.length} demo`
              : `${demoAlerts.length} alerts (demo)`}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{
            padding: '4px 10px', borderRadius: Math.min(theme.borderRadius, 8), fontSize: 11, fontWeight: 700,
            fontFamily: theme.fontData,
            background: theme.greenDim, color: theme.green,
          }}>
            {surges} surges
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: Math.min(theme.borderRadius, 8), fontSize: 11, fontWeight: 700,
            fontFamily: theme.fontData,
            background: theme.redDim, color: theme.red,
          }}>
            {drops} drops
          </span>
        </div>
      </div>

      {hasLive && (
        <div style={{
          padding: '8px 14px', borderRadius: 10, marginBottom: 12,
          background: theme.greenDim, border: `1px solid ${theme.green}33`,
          fontSize: 11, color: theme.green, fontFamily: theme.fontData,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.green, animation: 'pulse 2s infinite' }} />
          Live alerts from Polymarket polling (every 15s)
        </div>
      )}

      {/* Live alerts section */}
      {significantAlerts.length > 0 && (
        <>
          <div style={{
            fontSize: 10, fontWeight: 700, color: theme.green, fontFamily: theme.fontData,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', background: theme.green,
              animation: 'pulse 2s infinite', boxShadow: `0 0 6px ${theme.greenGlow}`,
            }} />
            Live ({significantAlerts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isPro ? 8 : 10, marginBottom: 20 }}>
            {significantAlerts.map((a, i) => (
              <AlertCard key={a.id} alert={a} isPro={isPro} theme={theme} index={i} />
            ))}
          </div>
        </>
      )}

      {/* Demo alerts section */}
      {significantAlerts.length > 0 && (
        <div style={{
          fontSize: 10, fontWeight: 700, color: theme.textMuted, fontFamily: theme.fontData,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          marginBottom: 8, paddingTop: significantAlerts.length > 0 ? 4 : 0,
          borderTop: significantAlerts.length > 0 ? `1px solid ${theme.border}` : 'none',
        }}>
          Demo ({demoAlerts.length})
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isPro ? 8 : 10 }}>
        {demoAlerts.map((a, i) => (
          <AlertCard key={a.id} alert={a} isPro={isPro} theme={theme} index={significantAlerts.length + i} />
        ))}
      </div>
      {learning && <LearnOverlay section="severity" theme={theme} />}

      {!hasLive && (
        <div style={{
          textAlign: 'center', marginTop: 20, padding: '14px',
          borderRadius: 12, background: theme.card2,
          fontSize: 12, color: theme.textMuted, fontFamily: theme.fontData,
        }}>
          Live alerts will appear here as Polymarket odds shift. Polling every 15 seconds.
        </div>
      )}
    </div>
  );
}
