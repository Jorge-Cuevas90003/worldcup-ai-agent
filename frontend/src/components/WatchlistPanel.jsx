import { X } from 'lucide-react';
import { cardBox, headingStyle, dataFont } from '../utils/styles';
import FlagIcon from './FlagIcon';

export default function WatchlistPanel({ watchedTeams, onRemove, theme }) {
  // Don't render anything if no teams watched
  if (!watchedTeams || watchedTeams.length === 0) return null;

  return (
    <div style={{
      ...cardBox(theme, '14px 18px'),
      marginBottom: 14,
    }}>
      <h3 style={{
        fontSize: 10, color: theme.textMuted, ...headingStyle(theme),
        margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 12 }}>&#9733;</span> Watchlist
      </h3>

      {(
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {watchedTeams.map((t) => (
            <div key={t.team} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 10px 5px 8px',
              borderRadius: Math.min(theme.borderRadius, 20),
              background: theme.card2,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.15s',
            }}>
              <FlagIcon team={t.team} size={14} />
              <span style={{
                fontSize: 12, fontWeight: 600, fontFamily: theme.fontHeading,
                color: theme.text, letterSpacing: theme.letterSpacing,
              }}>
                {t.team}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: theme.accent,
                ...dataFont(theme),
              }}>
                {t.odds?.toFixed(1)}%
              </span>
              <button
                onClick={() => onRemove(t.team)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0, lineHeight: 0, marginLeft: 2,
                }}
                title={`Remove ${t.team} from watchlist`}
              >
                <X size={12} color={theme.textMuted} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
