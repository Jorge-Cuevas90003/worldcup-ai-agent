import { TrendingUp, ArrowDown, Info, Clock, Mail, MessageSquare } from 'lucide-react';
import { cardStyle, headingStyle, dataFont, animEntry } from '../utils/styles';
import FlagIcon from './FlagIcon';

const typeConfig = {
  hot: { icon: TrendingUp, label: 'SURGE' },
  drop: { icon: ArrowDown, label: 'DROP' },
  info: { icon: Info, label: 'INFO' },
};

export default function AlertCard({ alert, isPro, theme, index = 0 }) {
  const cfg = typeConfig[alert.type] || typeConfig.info;
  const Icon = cfg.icon;
  const isHot = alert.type === 'hot';
  const barColor = isHot ? theme.green : alert.type === 'drop' ? theme.red : theme.blue;
  const ts = alert.timestamp?.toDate ? alert.timestamp.toDate() : new Date(alert.timestamp?._seconds * 1000 || Date.now());

  if (!isPro) {
    return (
      <div className="card-hover" style={{
        ...cardStyle(theme),
        padding: '18px 20px',
        animation: animEntry(theme, index),
      }}>
        {/* Left accent line */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          background: barColor, borderRadius: '0 4px 4px 0',
        }} />

        <div style={{ paddingLeft: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <FlagIcon team={alert.team} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, fontFamily: theme.fontBody }}>
                {alert.message}
              </div>
              <div style={{ fontSize: 12, color: theme.textDim, marginTop: 2 }}>
                {alert.detail}
              </div>
            </div>
            <div style={{
              fontSize: 20, fontWeight: 800, fontFamily: theme.fontHeading, color: barColor,
            }}>
              {alert.change > 0 ? '+' : ''}{alert.change?.toFixed(1)}%
            </div>
          </div>
          <div style={{
            display: 'flex', gap: 12, fontSize: 11, color: theme.textMuted,
            paddingTop: 8, borderTop: `1px solid ${theme.border}`,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mail size={11} color={theme.green} /> Sent
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MessageSquare size={11} color={theme.green} /> Sent
            </span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={10} /> {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // PRO
  const sevPct = Math.min(alert.severity || 0, 100);
  return (
    <div style={{
      ...cardStyle(theme),
      animation: animEntry(theme, index),
    }}>
      <div style={{ height: 3, background: theme.card2, position: 'relative' }}>
        <div style={{
          height: '100%', width: `${sevPct}%`,
          background: `linear-gradient(90deg, ${theme.accent}, ${barColor})`,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: Math.min(theme.borderRadius, 6),
            background: isHot ? theme.greenDim : theme.redDim,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={12} color={barColor} />
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: barColor,
            ...headingStyle(theme),
          }}>
            {cfg.label}
          </span>
          <FlagIcon team={alert.team} size={18} />
          <span style={{
            fontSize: 12, fontWeight: 600, color: theme.text,
            fontFamily: theme.fontHeading, textTransform: theme.textTransform,
            letterSpacing: theme.letterSpacing,
          }}>
            {alert.team}
          </span>
          <div style={{ flex: 1 }} />
          <div style={{
            padding: '3px 8px', borderRadius: Math.min(theme.borderRadius, 6),
            fontSize: 11, fontWeight: 700, ...dataFont(theme),
            background: sevPct >= 50 ? theme.redDim : theme.greenDim,
            color: sevPct >= 50 ? theme.red : theme.green,
          }}>
            SEV {alert.severity}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 12, ...dataFont(theme),
        }}>
          <span style={{ color: theme.textDim }}>
            {alert.previousOdds?.toFixed(1)}%
            <span style={{ color: theme.textMuted, margin: '0 6px' }}>&rarr;</span>
            {alert.currentOdds?.toFixed(1)}%
            <span style={{ color: barColor, marginLeft: 8 }}>
              ({alert.change > 0 ? '+' : ''}{alert.change?.toFixed(1)}%)
            </span>
          </span>
          <span style={{
            fontSize: 10, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Clock size={9} />
            {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
