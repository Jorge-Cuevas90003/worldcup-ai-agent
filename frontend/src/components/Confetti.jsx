import { useState, useEffect } from 'react';

const PARTICLE_COUNT = 24;
const COLORS = ['#c9a94e', '#00e676', '#3b82f6', '#ef4444', '#a855f7', '#f59e0b', '#22d3ee', '#f43f5e'];
const SHAPES = ['circle', 'square', 'triangle'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function Particle({ color, shape, delay }) {
  const x = randomBetween(-40, 40);
  const rotation = randomBetween(0, 720);
  const size = randomBetween(6, 12);
  const duration = randomBetween(1.2, 2.2);

  const shapeStyle = shape === 'triangle'
    ? { width: 0, height: 0, borderLeft: `${size/2}px solid transparent`, borderRight: `${size/2}px solid transparent`, borderBottom: `${size}px solid ${color}`, background: 'none' }
    : { width: size, height: size, background: color, borderRadius: shape === 'circle' ? '50%' : '2px' };

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      ...shapeStyle,
      opacity: 0,
      animation: `confettiBurst ${duration}s ease-out ${delay}s forwards`,
      '--confetti-x': `${x}vw`,
      '--confetti-r': `${rotation}deg`,
      pointerEvents: 'none',
    }} />
  );
}

export default function Confetti({ trigger, theme }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    const ps = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: Date.now() + i,
      color: COLORS[i % COLORS.length],
      shape: SHAPES[i % SHAPES.length],
      delay: randomBetween(0, 0.3),
    }));
    setParticles(ps);
    const timer = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', zIndex: 10000, overflow: 'hidden',
    }}>
      {particles.map((p) => (
        <Particle key={p.id} color={p.color} shape={p.shape} delay={p.delay} />
      ))}
    </div>
  );
}
