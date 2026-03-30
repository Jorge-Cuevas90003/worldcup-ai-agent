import { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({ value, decimals = 1, duration = 600, style = {} }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(null); // 'up' | 'down' | null
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    const target = value;
    if (prev === target) return;

    // Flash direction
    setFlash(target > prev ? 'up' : 'down');
    const flashTimer = setTimeout(() => setFlash(null), 800);

    // Count animation
    const start = performance.now();
    const from = prev;
    const to = target;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    prevRef.current = target;
    return () => clearTimeout(flashTimer);
  }, [value, duration]);

  return (
    <span style={{
      ...style,
      transition: 'color 0.3s, text-shadow 0.3s',
      ...(flash === 'up' ? { textShadow: '0 0 16px currentColor' } : {}),
      ...(flash === 'down' ? { textShadow: '0 0 16px currentColor' } : {}),
      animation: flash ? 'numberPop 0.4s ease-out' : 'none',
    }}>
      {display.toFixed(decimals)}
    </span>
  );
}
