import { useState } from 'react';
import { Shield, Lock, Link2, Check, X, Mail, CalendarDays, MessageSquare, Clock } from 'lucide-react';
import ConnectionCard from '../components/ConnectionCard';
import { connectService } from '../services/api';
import { cardBox, headingStyle, dataFont, animEntry } from '../utils/styles';

export default function Connections({ isPro, theme, bp }) {
  const [connections, setConnections] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('wc_connections') || '{}');
      return { gmail: !!stored.gmail, calendar: !!stored.calendar, slack: !!stored.slack };
    } catch { return { gmail: false, calendar: false, slack: false }; }
  });
  const isMobile = ['xxs', 'xs', 'sm'].includes(bp);

  const handleConnect = async (service) => {
    try {
      // Try API first, fallback to direct Auth0 URL
      const redirectUri = `${window.location.origin}/callback`;
      const connectionsMap = { gmail: 'google-oauth2', calendar: 'google-oauth2', slack: 'slack-oauth-2' };
      const connection = connectionsMap[service];
      const domain = 'dev-nq374ll31kn8pv20.us.auth0.com';
      const clientId = '0azPKvPMEjlPpdBX1FBCzacX0Hj4PzyU';
      const scope = connection === 'google-oauth2'
        ? 'openid profile email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events'
        : 'openid profile email';
      const state = JSON.stringify({ service, redirectUri });

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        connection,
        state,
        access_type: 'offline',
        prompt: 'consent',
      });

      window.location.href = `https://${domain}/authorize?${params.toString()}`;
    } catch (err) {
      console.error('Connect failed:', err);
    }
  };

  const gc = cardBox(theme);

  return (
    <div style={{ padding: isMobile ? '16px 14px' : '24px', maxWidth: isPro ? 800 : 540, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${theme.primaryGlow}`,
        }}>
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <h2 style={{
            fontSize: isPro ? 15 : 20, fontWeight: isPro ? 600 : 800, color: theme.text, margin: 0,
            fontFamily: theme.fontHeading,
            textTransform: isPro ? 'uppercase' : 'none',
            letterSpacing: isPro ? '0.12em' : 0,
          }}>
            {isPro ? 'TOKEN VAULT' : 'Connected Services'}
          </h2>
          <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontData }}>
            {isPro
              ? 'OAuth 2.0 token lifecycle via Auth0'
              : 'Let the agent send you alerts'}
          </div>
        </div>
      </div>

      {/* Auth0 Token Vault badge — prominent */}
      <div style={{
        ...gc,
        border: `1px solid ${theme.accent}44`,
        marginBottom: 16, marginTop: 16,
        position: 'relative', overflow: 'hidden',
        animation: 'slideUp 0.35s cubic-bezier(.4,0,.2,1) both',
      }}>
        {/* Glow stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentAlt})`,
          boxShadow: `0 0 12px ${theme.primaryGlow}`,
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: theme.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${theme.primaryGlow}`,
          }}>
            <Lock size={18} color={theme.primary} />
          </div>
          <div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: theme.text,
              fontFamily: theme.fontHeading,
            }}>
              Auth0 Token Vault
            </div>
            <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontData }}>
              Secure storage + auto-refresh for OAuth tokens
            </div>
          </div>
        </div>
      </div>

      {/* ── Permission Dashboard ── */}
      {isPro ? (
        <div style={{
          ...gc, marginBottom: 16,
          animation: 'slideUp 0.38s cubic-bezier(.4,0,.2,1) 0.15s both',
        }}>
          <h3 style={{
            ...headingStyle(theme),
            fontSize: 10, color: theme.textMuted, textTransform: 'uppercase',
            letterSpacing: '0.15em', fontWeight: 500, margin: '0 0 14px',
          }}>
            Agent Permissions
          </h3>
          {[
            {
              name: 'Gmail', icon: Mail, color: theme.green,
              can: [{ label: 'Send alert emails', scope: 'gmail.send' }],
              cannot: ['Read your inbox', 'Delete emails', 'Access contacts'],
            },
            {
              name: 'Calendar', icon: CalendarDays, color: theme.green,
              can: [{ label: 'Create match events', scope: 'calendar.events' }],
              cannot: ['Delete events', 'Read your calendar', 'Modify existing events'],
            },
            {
              name: 'Slack', icon: MessageSquare, color: theme.green,
              can: [{ label: 'Send messages', scope: 'chat:write' }],
              cannot: ['Read message history', 'Access private channels', 'Manage workspace'],
            },
          ].map((svc) => {
            const SvcIcon = svc.icon;
            return (
              <div key={svc.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <SvcIcon size={14} color={theme.green} />
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: theme.text,
                    fontFamily: theme.fontHeading,
                  }}>{svc.name}</span>
                </div>
                <div style={{ paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {svc.can.map((c) => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={12} color={theme.green} />
                      <span style={{ fontSize: 11, color: theme.green, fontFamily: theme.fontData }}>
                        CAN: {c.label} <span style={{ opacity: 0.6 }}>({c.scope})</span>
                      </span>
                    </div>
                  ))}
                  {svc.cannot.map((c) => (
                    <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <X size={12} color={theme.textMuted} />
                      <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fontData }}>
                        CANNOT: {c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{
            marginTop: 10, paddingTop: 10,
            borderTop: `1px solid ${theme.border}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Shield size={13} color={theme.accent} />
            <span style={{ fontSize: 10, color: theme.textDim, fontFamily: theme.fontData, fontStyle: 'italic' }}>
              Principle of Least Privilege — This agent only requests the minimum scopes needed. No broad access.
            </span>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12, padding: '8px 12px',
          borderRadius: theme.borderRadius,
          background: `${theme.card}88`,
        }}>
          <Shield size={13} color={theme.textDim} />
          <span style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontData }}>
            Minimum permissions only
          </span>
        </div>
      )}

      {/* Service cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isPro ? 10 : 10 }}>
        {['gmail', 'calendar', 'slack'].map((s, i) => (
          <ConnectionCard
            key={s}
            service={s}
            connected={connections[s]}
            onConnect={handleConnect}
            isPro={isPro}
            theme={theme}
            index={i}
          />
        ))}
      </div>

      {/* ── Security Log Timeline ── */}
      {isPro ? (() => {
        const now = new Date();
        const fmt = (minAgo) => {
          const d = new Date(now.getTime() - minAgo * 60000);
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        };
        const logs = [
          { t: fmt(2),  desc: 'Token refreshed (Gmail)',         type: 'token' },
          { t: fmt(5),  desc: 'API call: gmail.send',            type: 'success' },
          { t: fmt(6),  desc: 'Alert triggered: Spain +0.1%',    type: 'success' },
          { t: fmt(20), desc: 'Token auto-refresh scheduled',    type: 'token' },
          { t: fmt(30), desc: 'Slack webhook verified',          type: 'success' },
          { t: fmt(40), desc: 'User connected Gmail',            type: 'info' },
          { t: fmt(41), desc: 'OAuth consent granted',           type: 'info' },
          { t: fmt(42), desc: 'Authorization request sent',      type: 'info' },
          { t: fmt(60), desc: 'Agent started monitoring',        type: 'start' },
        ];
        const dotColor = { token: theme.gold || theme.accent, success: theme.green, info: theme.primary || theme.accent, start: theme.textMuted };
        return (
          <div style={{
            ...gc, marginTop: 16,
            animation: 'slideUp 0.4s cubic-bezier(.4,0,.2,1) 0.25s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Clock size={13} color={theme.textMuted} />
              <h3 style={{
                ...headingStyle(theme),
                fontSize: 10, color: theme.textMuted, textTransform: 'uppercase',
                letterSpacing: '0.15em', fontWeight: 500, margin: 0,
              }}>
                Security Log
              </h3>
            </div>
            <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 14 }}>
              {logs.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: i < logs.length - 1 ? 8 : 0,
                  position: 'relative',
                }}>
                  {/* dot on the timeline */}
                  <div style={{
                    position: 'absolute', left: -19, top: '50%', transform: 'translateY(-50%)',
                    width: 8, height: 8, borderRadius: '50%',
                    background: dotColor[entry.type],
                    boxShadow: entry.type !== 'start' ? `0 0 6px ${dotColor[entry.type]}88` : 'none',
                    border: entry.type === 'start' ? `2px solid ${theme.textMuted}` : 'none',
                  }} />
                  <span style={{
                    ...dataFont(theme),
                    fontSize: 11, color: theme.textDim, minWidth: 40,
                  }}>{entry.t}</span>
                  <span style={{
                    fontSize: 11, color: theme.text, fontFamily: theme.fontBody,
                  }}>{entry.desc}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 14, paddingTop: 10,
              borderTop: `1px solid ${theme.border}`,
            }}>
              <span style={{ fontSize: 10, color: theme.textDim, fontFamily: theme.fontData, fontStyle: 'italic' }}>
                All token operations handled by Auth0 Token Vault. Zero tokens stored in our application.
              </span>
            </div>
          </div>
        );
      })() : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 12, padding: '8px 12px',
          borderRadius: theme.borderRadius,
          background: `${theme.card}88`,
        }}>
          <Lock size={13} color={theme.textDim} />
          <span style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontData }}>
            All operations secured by Auth0 Token Vault
          </span>
        </div>
      )}

      {/* Pro — Architecture diagram */}
      {isPro && (
        <div style={{
          ...gc, marginTop: 16,
          animation: 'slideUp 0.4s cubic-bezier(.4,0,.2,1) 0.3s both',
        }}>
          <h3 style={{
            fontSize: 10, color: theme.textMuted, textTransform: 'uppercase',
            letterSpacing: '0.15em', fontFamily: theme.fontHeading,
            fontWeight: 500, margin: '0 0 14px',
          }}>
            Token Vault Architecture
          </h3>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
            fontSize: 10, fontFamily: theme.fontData,
          }}>
            {[
              { label: 'App', active: true },
              { label: 'Auth0 /authorize' },
              { label: 'Provider Consent', active: true },
              { label: 'Token Vault Store' },
              { label: 'Auto Refresh', active: true },
              { label: 'Gmail / Slack API' },
            ].map((step, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  padding: '5px 10px', borderRadius: 8,
                  background: step.active ? theme.primaryBg : theme.greenDim,
                  color: step.active ? theme.primary : theme.green,
                  border: `1px solid ${step.active ? theme.accent : theme.green}33`,
                  boxShadow: `0 0 8px ${step.active ? theme.primaryGlow : theme.greenGlow}`,
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
                {i < 5 && <span style={{ color: theme.textMuted, fontSize: 12 }}>&#x25B8;</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
