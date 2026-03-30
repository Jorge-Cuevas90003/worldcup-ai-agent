import { Eye, Sparkles } from 'lucide-react';

export default function ModeSwitcher({ mode, toggleMode, theme, isPro }) {
  return (
    <button
      onClick={toggleMode}
      style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: 3, borderRadius: 14,
        background: theme.card2,
        border: `1px solid ${theme.glassBorder}`,
        cursor: 'pointer', fontSize: 11, fontWeight: 700,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        padding: '5px 12px', borderRadius: 11, display: 'flex', alignItems: 'center', gap: 5,
        background: !isPro ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})` : 'transparent',
        color: !isPro ? '#fff' : theme.textMuted,
        transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
        boxShadow: !isPro ? `0 2px 8px ${theme.primaryGlow}` : 'none',
      }}>
        <Eye size={12} />
        <span>Lite</span>
      </div>
      <div style={{
        padding: '5px 12px', borderRadius: 11, display: 'flex', alignItems: 'center', gap: 5,
        background: isPro ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})` : 'transparent',
        color: isPro ? '#fff' : theme.textMuted,
        transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
        boxShadow: isPro ? `0 2px 8px ${theme.primaryGlow}` : 'none',
      }}>
        <Sparkles size={12} />
        <span>Pro</span>
      </div>
    </button>
  );
}
