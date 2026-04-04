import { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown, Check, Trophy, Activity, Globe, Monitor, Star, Sun, Zap, Radio } from 'lucide-react';
import themes, { themeKeys } from '../config/themes';

const iconMap = { Trophy, Activity, Globe, Monitor, Star, Sun, Zap, Radio };

export default function ThemePicker({ themeKey, setTheme, theme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 34, height: 34, borderRadius: 10, cursor: 'pointer',
          background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          border: `2px solid ${theme.glassBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px ${theme.primaryGlow}`,
          transition: 'transform 0.2s',
        }}
      >
        <Palette size={14} color="#fff" style={{ mixBlendMode: 'difference' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 999,
          background: theme.glass, backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${theme.border}`, borderRadius: theme.borderRadius,
          padding: 10, minWidth: 240,
          boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {themeKeys.map((k) => {
              const t = themes[k];
              const Icon = iconMap[t.icon] || Star;
              const active = k === themeKey;
              return (
                <button
                  key={k}
                  onClick={() => { setTheme(k); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    background: active ? theme.primaryBg : 'transparent',
                    border: 'none', borderRadius: 10,
                    cursor: 'pointer', color: theme.text, fontSize: 11,
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = theme.card2; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]})`,
                    border: active ? `2px solid ${theme.primary}` : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active ? <Check size={10} color="#fff" style={{ mixBlendMode: 'difference' }} /> : <Icon size={10} color="#fff" style={{ mixBlendMode: 'difference', opacity: 0.7 }} />}
                  </div>
                  <span style={{ whiteSpace: 'nowrap', fontWeight: active ? 700 : 400 }}>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
