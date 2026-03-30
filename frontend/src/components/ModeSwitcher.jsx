import { Eye, Sparkles, Info } from 'lucide-react';

export default function ModeSwitcher({ mode, toggleMode, theme, isPro, learning, toggleLearning }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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

      {/* Learning mode toggle */}
      <button
        onClick={toggleLearning}
        title={learning ? 'Learning mode ON' : 'Learning mode OFF'}
        style={{
          width: 28, height: 28, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: learning ? `1.5px solid ${theme.accent}` : `1px solid ${theme.glassBorder}`,
          background: learning ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})` : theme.card2,
          color: learning ? '#fff' : theme.textMuted,
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
          boxShadow: learning ? `0 2px 10px ${theme.primaryGlow}` : 'none',
          padding: 0,
        }}
      >
        <Info size={14} />
      </button>
    </div>
  );
}
