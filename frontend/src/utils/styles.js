// ── Style DNA Resolver ──
// Translates theme DNA properties into concrete inline style objects.
// Components call these instead of hardcoding glass/blur/font patterns.

export function cardStyle(theme) {
  const base = { borderRadius: theme.borderRadius, position: 'relative', overflow: 'hidden' };
  const border = borderFor(theme);

  switch (theme.cardStyle) {
    case 'glass':
      return {
        ...base, background: theme.glass,
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        border, boxShadow: shadowFor(theme),
      };
    case 'elevated':
      return { ...base, background: theme.card, border, boxShadow: shadowFor(theme) };
    case 'neumorphic':
      return {
        ...base, background: theme.bg,
        boxShadow: `6px 6px 14px ${theme.card2}, -6px -6px 14px ${theme.card}`,
        border: 'none',
      };
    case 'outline':
      return {
        ...base, background: `${theme.card}11`,
        border: `${theme.borderWidth} solid ${theme.border}`,
      };
    case 'flat':
    default:
      return { ...base, background: theme.card, border };
  }
}

export function borderFor(theme) {
  switch (theme.borderStyle) {
    case 'none': return 'none';
    case 'dashed': return `${theme.borderWidth} dashed ${theme.border}`;
    case 'double': return `3px double ${theme.border}`;
    case 'solid': return `${theme.borderWidth} solid ${theme.border}`;
    case 'glass': return `1px solid ${theme.glassBorder}`;
    default: return `${theme.borderWidth} solid ${theme.border}`;
  }
}

export function shadowFor(theme) {
  switch (theme.shadowStyle) {
    case 'glow': return `0 0 20px ${theme.primaryGlow}`;
    case 'hard': return `4px 4px 0 ${theme.card2}`;
    case 'soft': return '0 4px 16px rgba(0,0,0,0.1)';
    case 'layered': return '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)';
    case 'none': default: return 'none';
  }
}

export function headingStyle(theme) {
  return {
    fontFamily: theme.fontHeading,
    fontWeight: theme.fontWeight === 'bold' ? 700 : theme.fontWeight === 'light' ? 300 : 500,
    textTransform: theme.textTransform,
    letterSpacing: theme.letterSpacing,
  };
}

export function bodyFont(theme) {
  return { fontFamily: theme.fontBody };
}

export function dataFont(theme) {
  return { fontFamily: theme.fontData };
}

export function animEntry(theme, index = 0) {
  if (theme.animSpeed === 0 || theme.animStyle === 'none') return 'none';
  const duration = (0.35 * theme.animSpeed).toFixed(2);
  const delay = Math.round(index * 60 * theme.animSpeed);
  const keyframe = theme.animStyle === 'slide' ? 'slideUp'
    : theme.animStyle === 'scale' ? 'scaleIn'
    : 'fadeIn';
  return `${keyframe} ${duration}s cubic-bezier(.4,0,.2,1) ${delay}ms both`;
}

export function textureOverlay(theme) {
  switch (theme.texture) {
    case 'noise':
      return {
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '128px 128px',
      };
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${theme.border} 1px, transparent 1px), linear-gradient(90deg, ${theme.border} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      };
    case 'dots':
      return {
        backgroundImage: `radial-gradient(${theme.border} 1px, transparent 1px)`,
        backgroundSize: '16px 16px',
      };
    default:
      return {};
  }
}

// Convenience: card with padding pre-applied
export function cardBox(theme, padding = 18) {
  return { ...cardStyle(theme), padding };
}

// Nav/header card — always needs some translucency for overlaying content
export function navStyle(theme) {
  const base = {
    background: theme.navBg,
    borderRadius: theme.borderRadius,
    boxShadow: shadowFor(theme),
  };
  if (theme.cardStyle === 'glass') {
    base.backdropFilter = 'blur(24px) saturate(180%)';
    base.WebkitBackdropFilter = 'blur(24px) saturate(180%)';
    base.background = theme.glass;
  }
  base.border = borderFor(theme);
  return base;
}
