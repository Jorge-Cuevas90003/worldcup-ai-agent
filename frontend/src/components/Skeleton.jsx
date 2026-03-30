import { cardStyle } from '../utils/styles';

export default function Skeleton({ width = '100%', height = 16, radius = 8, theme, style }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: `linear-gradient(90deg, ${theme.card2} 25%, ${theme.border} 50%, ${theme.card2} 75%)`,
      backgroundSize: '200% 100%',
      animation: theme.animSpeed > 0 ? 'shimmer 1.5s ease-in-out infinite' : 'none',
      ...style,
    }} />
  );
}

export function SkeletonCard({ theme }) {
  return (
    <div style={{ ...cardStyle(theme), padding: 18 }}>
      <Skeleton width={80} height={10} theme={theme} style={{ marginBottom: 12 }} />
      <Skeleton width="60%" height={28} theme={theme} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={12} theme={theme} />
    </div>
  );
}

export function SkeletonRow({ theme }) {
  return (
    <div style={{ ...cardStyle(theme), padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Skeleton width={32} height={32} radius={Math.min(theme.borderRadius, 10)} theme={theme} />
      <div style={{ flex: 1 }}>
        <Skeleton width="50%" height={14} theme={theme} style={{ marginBottom: 6 }} />
        <Skeleton width="30%" height={10} theme={theme} />
      </div>
      <Skeleton width={50} height={20} radius={Math.min(theme.borderRadius, 6)} theme={theme} />
    </div>
  );
}
