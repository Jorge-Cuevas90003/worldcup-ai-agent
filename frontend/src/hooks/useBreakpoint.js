import { useState, useEffect } from 'react';

const breakpoints = { xxs: 0, xs: 400, sm: 480, md: 768, lg: 1024 };

function getBreakpoint(w) {
  if (w >= breakpoints.lg) return 'lg';
  if (w >= breakpoints.md) return 'md';
  if (w >= breakpoints.sm) return 'sm';
  if (w >= breakpoints.xs) return 'xs';
  return 'xxs';
}

export default function useBreakpoint() {
  const [bp, setBp] = useState(() => getBreakpoint(window.innerWidth));

  useEffect(() => {
    const onResize = () => setBp(getBreakpoint(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return bp;
}
