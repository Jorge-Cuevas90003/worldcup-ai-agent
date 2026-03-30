import { cardStyle, headingStyle, dataFont } from '../utils/styles';

export default function StatCard({ icon: Icon, label, value, subtitle, theme, accent }) {
  return (
    <div className="card-hover" style={{ ...cardStyle(theme), padding: '18px 20px' }}>
      {/* Accent stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent || theme.accent}, ${theme.accentAlt})`,
        opacity: 0.7,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: Math.min(theme.borderRadius, 8),
          background: theme.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={14} color={theme.primary} />}
        </div>
        <span style={{
          fontSize: 10, color: theme.textMuted, ...headingStyle(theme),
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 26, fontWeight: 700, color: theme.text,
        fontFamily: theme.fontHeading, letterSpacing: '-0.02em', lineHeight: 1,
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{
          fontSize: 11, color: theme.textDim, marginTop: 6, ...dataFont(theme),
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
