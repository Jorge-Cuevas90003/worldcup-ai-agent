import FlagIcon from './FlagIcon';

export default function Ticker({ teams, theme }) {
  if (!teams || teams.length === 0) return null;
  const items = [...teams, ...teams];

  return (
    <div style={{
      overflow: 'hidden', position: 'relative', zIndex: 1,
      padding: '8px 0',
      borderBottom: `1px solid ${theme.border}`,
      background: `linear-gradient(90deg, ${theme.bg}, transparent 5%, transparent 95%, ${theme.bg})`,
    }}>
      <div style={{
        display: 'inline-flex', gap: 40,
        animation: 'ticker-scroll 35s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        {items.map((t, i) => {
          const ch = t.change || 0;
          return (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12,
            }}>
              <FlagIcon team={t.team} size={16} />
              <span style={{
                color: theme.text, fontWeight: 700,
                fontFamily: theme.fontHeading, textTransform: theme.textTransform,
                fontSize: 11, letterSpacing: '0.08em',
              }}>
                {t.team}
              </span>
              <span style={{
                fontFamily: theme.fontData, fontWeight: 700,
                color: theme.primary, fontSize: 12,
              }}>
                {t.odds?.toFixed(1)}%
              </span>
              <span style={{
                fontFamily: theme.fontData, fontSize: 10,
                padding: '1px 5px', borderRadius: 4,
                background: ch >= 0 ? theme.greenDim : theme.redDim,
                color: ch >= 0 ? theme.green : theme.red,
              }}>
                {ch >= 0 ? '+' : ''}{ch.toFixed(1)}
              </span>
            </span>
          );
        })}
      </div>
      <style>{`@keyframes ticker-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
    </div>
  );
}
