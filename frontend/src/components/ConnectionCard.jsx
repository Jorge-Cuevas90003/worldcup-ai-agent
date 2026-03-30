import { Mail, CalendarDays, MessageSquare, Check, Link2, Lock, Shield } from 'lucide-react';
import { cardStyle, headingStyle, dataFont, animEntry } from '../utils/styles';

const serviceConfig = {
  gmail: { icon: Mail, label: 'Gmail', desc: 'Odds alerts via email', color: '#ea4335' },
  calendar: { icon: CalendarDays, label: 'Calendar', desc: 'Sync match schedules', color: '#4285f4' },
  slack: { icon: MessageSquare, label: 'Slack', desc: 'Channel notifications', color: '#611f69' },
};

export default function ConnectionCard({ service, connected, onConnect, isPro, theme, index = 0 }) {
  const cfg = serviceConfig[service] || serviceConfig.gmail;
  const Icon = cfg.icon;

  if (!isPro) {
    return (
      <div className="card-hover" style={{
        ...cardStyle(theme),
        padding: '18px 20px',
        border: connected ? `${theme.borderWidth || '1px'} solid ${theme.accent}44` : cardStyle(theme).border,
        animation: animEntry(theme, index),
      }}>
        {connected && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentAlt})`,
          }} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: Math.min(theme.borderRadius, 12),
            background: `linear-gradient(135deg, ${cfg.color}22, ${cfg.color}44)`,
            border: `1px solid ${cfg.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={cfg.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, fontFamily: theme.fontBody }}>
              {cfg.label}
            </div>
            <div style={{ fontSize: 12, color: theme.textDim }}>{cfg.desc}</div>
          </div>
          <button
            onClick={() => !connected && onConnect(service)}
            style={{
              padding: '9px 20px', borderRadius: theme.borderRadius,
              background: connected
                ? 'transparent'
                : `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
              color: connected ? theme.green : '#fff',
              border: connected ? `1px solid ${theme.green}44` : 'none',
              cursor: connected ? 'default' : 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: theme.fontBody,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            {connected ? <><Check size={14} /> Active</> : <><Link2 size={14} /> Connect</>}
          </button>
        </div>
      </div>
    );
  }

  // PRO
  return (
    <div style={{
      ...cardStyle(theme),
      animation: animEntry(theme, index),
    }}>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: Math.min(theme.borderRadius, 8),
            background: `${cfg.color}22`, border: `1px solid ${cfg.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={cfg.color} />
          </div>
          <span style={{
            fontSize: 13, fontWeight: 600, fontFamily: theme.fontHeading,
            textTransform: theme.textTransform, letterSpacing: theme.letterSpacing, color: theme.text,
          }}>
            {cfg.label}
          </span>
          <div style={{ flex: 1 }} />
          <span style={{
            padding: '3px 10px', borderRadius: Math.min(theme.borderRadius, 8),
            fontSize: 9, fontWeight: 700, ...dataFont(theme), letterSpacing: '0.1em',
            background: connected ? theme.greenDim : theme.redDim,
            color: connected ? theme.green : theme.red,
          }}>
            {connected ? 'ACTIVE' : 'DISCONNECTED'}
          </span>
        </div>

        {connected && (
          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 9, ...dataFont(theme),
              overflowX: 'auto', padding: '2px 0',
            }}>
              {[
                { label: 'AUTH', icon: Shield },
                { label: 'CONSENT', icon: Check },
                { label: 'TOKEN', icon: Lock },
                { label: 'REFRESH', icon: Link2 },
                { label: 'API', icon: Mail },
              ].map((step, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{
                    padding: '3px 7px', borderRadius: Math.min(theme.borderRadius, 6),
                    background: i % 2 === 0 ? theme.primaryBg : theme.greenDim,
                    color: i % 2 === 0 ? theme.primary : theme.green,
                    border: `1px solid ${i % 2 === 0 ? theme.accent : theme.green}33`,
                    display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
                  }}>
                    <step.icon size={8} />
                    {step.label}
                  </span>
                  {i < 4 && <span style={{ color: theme.textMuted, fontSize: 8 }}>&#x25B8;</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => !connected && onConnect(service)}
          style={{
            width: '100%', padding: '9px', borderRadius: theme.borderRadius,
            background: connected
              ? 'transparent'
              : `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
            color: connected ? theme.green : '#fff',
            border: connected ? `1px solid ${theme.border}` : 'none',
            cursor: connected ? 'default' : 'pointer',
            fontSize: 11, fontWeight: 700,
            fontFamily: theme.fontHeading, textTransform: theme.textTransform,
            letterSpacing: theme.letterSpacing,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {connected
            ? <><Lock size={12} /> Via Auth0 Token Vault</>
            : <><Link2 size={12} /> Connect with Auth0</>}
        </button>
      </div>
    </div>
  );
}
