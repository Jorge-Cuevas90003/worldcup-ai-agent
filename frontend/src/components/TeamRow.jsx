import { ArrowUp, ArrowDown, Star } from 'lucide-react';
import { cardStyle, headingStyle, dataFont, animEntry } from '../utils/styles';
import FlagIcon from './FlagIcon';

export default function TeamRow({ team, rank, isPro, theme, featured, isWatched, onWatch }) {
  const change = team.change || 0;
  const changeColor = change >= 0 ? theme.green : theme.red;

  if (!isPro) {
    const scale = Math.max(0.7, Math.min(1, (team.odds || 5) / 16));
    const flagSize = Math.round(32 + scale * 24);

    return (
      <div className="card-hover" style={{
        ...cardStyle(theme),
        padding: featured ? '22px 20px' : '16px 18px',
        animation: animEntry(theme, 0),
      }}>
        {/* Watch button */}
        {onWatch && (
          <button
            onClick={(e) => { e.stopPropagation(); onWatch(team.team); }}
            style={{
              position: 'absolute', top: 8, right: 8, zIndex: 2,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, lineHeight: 0, borderRadius: '50%',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star
              size={16}
              color={isWatched ? '#f5a623' : theme.textMuted}
              fill={isWatched ? '#f5a623' : 'none'}
              strokeWidth={isWatched ? 2.5 : 1.5}
            />
          </button>
        )}
        {/* Left accent line */}
        <div style={{
          position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3,
          borderRadius: '0 3px 3px 0',
          background: `linear-gradient(180deg, ${theme.accent}, ${theme.accentAlt})`,
          opacity: scale,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 10 }}>
          <span style={{
            fontSize: featured ? 32 : 22, fontWeight: 800, color: theme.border,
            fontFamily: theme.fontHeading, lineHeight: 1, minWidth: 28,
          }}>
            {rank}
          </span>
          <FlagIcon team={team.team} size={flagSize} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: featured ? 18 : 15, fontWeight: 700, color: theme.text,
              fontFamily: theme.fontBody,
            }}>
              {team.team}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke={theme.card2} strokeWidth="3" />
                <circle cx="12" cy="12" r="10" fill="none" stroke={theme.accent} strokeWidth="3"
                  strokeDasharray={`${(team.odds / 100) * 62.8} 62.8`}
                  strokeLinecap="round" transform="rotate(-90 12 12)"
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
              </svg>
              <span style={{ fontSize: 11, color: theme.textDim, ...dataFont(theme) }}>
                {team.odds?.toFixed(2)}% probability
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: featured ? 34 : 26, fontWeight: 800, lineHeight: 1,
              fontFamily: theme.fontHeading,
              color: theme.accent,
            }}>
              {team.odds?.toFixed(2)}
            </div>
            <span style={{
              fontSize: 10, ...dataFont(theme),
              padding: '1px 6px', borderRadius: Math.min(theme.borderRadius, 6),
              background: change >= 0 ? theme.greenDim : theme.redDim,
              color: changeColor,
            }}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // PRO — Dense data row
  return (
    <tr
      style={{ borderBottom: `1px solid ${theme.border}`, transition: 'background 0.15s' }}
      onMouseEnter={(e) => e.currentTarget.style.background = theme.card2}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{
        padding: '10px 14px', ...dataFont(theme), fontSize: 11,
        color: rank <= 3 ? theme.primary : theme.textMuted,
        fontWeight: rank <= 3 ? 700 : 400,
      }}>
        {String(rank).padStart(2, '0')}
      </td>
      <td style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FlagIcon team={team.team} size={20} />
          <span style={{
            fontFamily: theme.fontHeading, fontWeight: 600,
            textTransform: theme.textTransform, fontSize: 13,
            letterSpacing: theme.letterSpacing, color: theme.text,
          }}>
            {team.team}
          </span>
        </div>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <span style={{
          ...dataFont(theme), fontWeight: 700, fontSize: 14, color: theme.primary,
        }}>
          {team.odds?.toFixed(2)}%
        </span>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          ...dataFont(theme), fontSize: 11,
          padding: '2px 7px', borderRadius: Math.min(theme.borderRadius, 6),
          background: change >= 0 ? theme.greenDim : theme.redDim,
          color: changeColor,
        }}>
          {change >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </span>
      </td>
      <td style={{
        padding: '10px 14px', ...dataFont(theme), color: theme.textDim, fontSize: 11,
      }}>
        ${((team.volume || 0) / 1e6).toFixed(1)}M
      </td>
      <td style={{ padding: '10px 14px' }}>
        <div style={{ width: 60, height: 4, borderRadius: Math.min(theme.borderRadius, 2), background: theme.card2, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(team.odds || 0, 100)}%`, height: '100%',
            background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentAlt})`,
            borderRadius: Math.min(theme.borderRadius, 2), transition: 'width 0.6s ease',
          }} />
        </div>
      </td>
      {onWatch && (
        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onWatch(team.team); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 2, lineHeight: 0,
            }}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star
              size={14}
              color={isWatched ? '#f5a623' : theme.textMuted}
              fill={isWatched ? '#f5a623' : 'none'}
              strokeWidth={isWatched ? 2.5 : 1.5}
            />
          </button>
        </td>
      )}
    </tr>
  );
}
