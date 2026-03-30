import { CalendarDays, Check } from 'lucide-react';
import { cardStyle, headingStyle, dataFont, animEntry } from '../utils/styles';
import FlagIcon from './FlagIcon';

export default function MatchCard({ match, isPro, theme, index = 0 }) {
  if (!isPro) {
    return (
      <div className="card-hover" style={{
        ...cardStyle(theme),
        animation: animEntry(theme, index),
      }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{
            flex: 1, padding: '22px 16px', textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.primaryBg}, transparent)`,
          }}>
            <FlagIcon team={match.home} size={44} />
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, fontFamily: theme.fontBody, marginTop: 6 }}>
              {match.home}
            </div>
            <div style={{
              fontSize: 24, fontWeight: 800, fontFamily: theme.fontHeading,
              color: theme.accent, marginTop: 4,
            }}>
              {match.homeOdds || '—'}%
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 48, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0, width: 1,
              background: theme.border, left: '50%',
            }} />
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: theme.card, border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: theme.textMuted,
              fontFamily: theme.fontHeading, zIndex: 1,
            }}>
              VS
            </div>
          </div>

          <div style={{ flex: 1, padding: '22px 16px', textAlign: 'center' }}>
            <FlagIcon team={match.away} size={44} />
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, fontFamily: theme.fontBody, marginTop: 6 }}>
              {match.away}
            </div>
            <div style={{
              fontSize: 24, fontWeight: 800, fontFamily: theme.fontHeading,
              color: theme.accent, marginTop: 4,
            }}>
              {match.awayOdds || '—'}%
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 18px', borderTop: `1px solid ${theme.border}`,
          fontSize: 11, color: theme.textMuted,
        }}>
          <span style={{ ...dataFont(theme) }}>{match.group}</span>
          {match.synced && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.green }}>
              <Check size={12} /> Calendar synced
            </span>
          )}
        </div>
      </div>
    );
  }

  // PRO
  const homeW = parseFloat(match.homeOdds) || 33;
  const drawW = parseFloat(match.drawOdds) || 34;
  const awayW = parseFloat(match.awayOdds) || 33;
  const total = homeW + drawW + awayW;

  return (
    <div style={{
      ...cardStyle(theme), padding: '14px 18px',
      animation: animEntry(theme, index),
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FlagIcon team={match.home} size={24} />
          <span style={{
            fontSize: 13, fontWeight: 600, fontFamily: theme.fontHeading,
            textTransform: theme.textTransform, letterSpacing: theme.letterSpacing, color: theme.text,
          }}>
            {match.home}
          </span>
        </div>
        <span style={{
          fontSize: 9, color: theme.textMuted, ...dataFont(theme),
          padding: '2px 8px', borderRadius: Math.min(theme.borderRadius, 6), background: theme.card2,
        }}>
          {match.group || ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, fontFamily: theme.fontHeading,
            textTransform: theme.textTransform, letterSpacing: theme.letterSpacing, color: theme.text,
          }}>
            {match.away}
          </span>
          <FlagIcon team={match.away} size={24} />
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 3, height: 10,
        borderRadius: Math.min(theme.borderRadius, 5), overflow: 'hidden', marginBottom: 8,
      }}>
        <div style={{
          width: `${(homeW / total) * 100}%`,
          background: `linear-gradient(90deg, ${theme.green}, ${theme.accent})`,
          borderRadius: `${Math.min(theme.borderRadius, 5)}px 0 0 ${Math.min(theme.borderRadius, 5)}px`,
        }} />
        <div style={{ width: `${(drawW / total) * 100}%`, background: theme.textMuted, opacity: 0.4 }} />
        <div style={{
          width: `${(awayW / total) * 100}%`,
          background: `linear-gradient(90deg, ${theme.accentAlt}, ${theme.red})`,
          borderRadius: `0 ${Math.min(theme.borderRadius, 5)}px ${Math.min(theme.borderRadius, 5)}px 0`,
        }} />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', fontSize: 11, ...dataFont(theme),
      }}>
        <span style={{ color: theme.green, fontWeight: 700 }}>{homeW.toFixed(0)}%</span>
        <span style={{ color: theme.textMuted }}>Draw {drawW.toFixed(0)}%</span>
        <span style={{ color: theme.red, fontWeight: 700 }}>{awayW.toFixed(0)}%</span>
      </div>
      {match.venue && (
        <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 8, ...dataFont(theme), opacity: 0.7 }}>
          {match.venue}
        </div>
      )}
    </div>
  );
}
