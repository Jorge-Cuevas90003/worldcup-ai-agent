import { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Radio, Shield, Lock, Bell, Eye, Sparkles,
  Palette, ChevronRight, ChevronLeft, X, Link2, Mail,
  Zap,
} from 'lucide-react';
import FlagIcon from './FlagIcon';

const STORAGE_KEY = 'wca-onboarded';

/* ---------- step accent colors ---------- */
const STEP_COLORS = [
  '#f59e0b', // welcome — gold
  '#22d3ee', // live data — cyan
  '#8b5cf6', // auth0 vault — purple (hackathon hero)
  '#f97316', // alerts — orange
  '#6366f1', // lite vs pro — indigo
  '#ec4899', // themes — pink
  '#10b981', // get started — emerald
];

/* ---------- pipeline for step 3 ---------- */
const VAULT_PIPELINE = [
  { label: 'App', icon: Zap },
  { label: 'Auth0', icon: Shield },
  { label: 'Google OAuth', icon: Link2 },
  { label: 'Token Vault', icon: Lock },
  { label: 'Auto Refresh', icon: Radio },
  { label: 'API Call', icon: Mail },
];

/* ---------- step definitions ---------- */
const STEPS = [
  {
    icon: Trophy,
    title: 'WorldCup Agent',
    subtitle: 'Live World Cup 2026 odds powered by Polymarket',
    body: null, // custom render
  },
  {
    icon: Radio,
    title: 'Live Data',
    body: 'Odds come from Polymarket in real-time, polling every 15 seconds. 23+ teams tracked so you never miss a market move.',
    mock: true,
  },
  {
    icon: Shield,
    title: 'Auth0 Token Vault',
    body: 'Your tokens are stored securely in Auth0 Token Vault. When odds shift, we use YOUR Gmail & Calendar tokens to send alerts \u2014 auto-refreshed, never exposed.',
    vault: true,
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    body: 'Get notified when odds surge or drop. Email via Gmail API, events via Calendar API \u2014 all authenticated through Auth0 Token Vault.',
  },
  {
    icon: Eye,
    title: 'Lite vs Pro',
    body: 'Two modes: Lite for casual fans (big cards, simple view) and Pro for traders (charts, tables, analytics, market intelligence).',
    secondIcon: Sparkles,
  },
  {
    icon: Palette,
    title: '11 Themes',
    body: 'Choose from 11 unique visual themes \u2014 each with its own typography, borders, shadows, and animations. From Midnight Gold luxury to Neon Cyber punk to Classic Press newspaper.',
  },
  {
    icon: ChevronRight,
    title: 'Get Started',
    body: 'Star your favorite teams, connect Gmail & Calendar, and let the agent work for you.',
    cta: true,
  },
];

/* ================================================
   Component
   ================================================ */
export default function Onboarding({ theme }) {
  const [step, setStep] = useState(-1);
  const [fade, setFade] = useState(true);

  /* show only once */
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setStep(0);
    } catch { /* private browsing */ }
  }, []);

  const close = useCallback(() => {
    setStep(-1);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
  }, []);

  const go = useCallback((next) => {
    setFade(false);
    setTimeout(() => {
      setStep(next);
      setFade(true);
    }, 150);
  }, []);

  /* keyboard nav */
  useEffect(() => {
    if (step < 0) return;
    const handler = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' && step < STEPS.length - 1) go(step + 1);
      if (e.key === 'ArrowLeft' && step > 0) go(step - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, close, go]);

  if (step < 0) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const accentColor = STEP_COLORS[step];
  const isVaultStep = step === 2;
  const br = theme.borderRadius ?? 10;

  /* -------- inline styles -------- */

  const overlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
    zIndex: 10001,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
    animation: 'fadeIn 0.3s ease-out',
  };

  const card = {
    background: theme.card,
    border: isVaultStep
      ? `2px solid ${accentColor}`
      : `1px solid ${theme.border}`,
    borderRadius: br + 6,
    padding: 0,
    maxWidth: 460, width: '100%',
    position: 'relative',
    boxShadow: isVaultStep
      ? `0 0 40px ${accentColor}33, 0 24px 64px rgba(0,0,0,0.5)`
      : '0 24px 64px rgba(0,0,0,0.4)',
    overflow: 'hidden',
    animation: 'scaleIn 0.3s ease-out',
  };

  const accentBar = {
    height: 4,
    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
    width: '100%',
  };

  const inner = {
    padding: '28px 32px 28px',
    opacity: fade ? 1 : 0,
    transition: 'opacity 0.15s ease',
  };

  const closeBtn = {
    position: 'absolute', top: 14, right: 14,
    background: 'none', border: 'none', cursor: 'pointer',
    color: theme.textMuted, padding: 4, zIndex: 2,
  };

  const iconWrap = {
    width: 56, height: 56, borderRadius: br,
    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 18px',
  };

  const titleStyle = {
    fontSize: 22, fontWeight: 700, color: theme.text,
    fontFamily: theme.fontHeading, textAlign: 'center',
    margin: '0 0 6px', lineHeight: 1.3,
  };

  const subtitleStyle = {
    fontSize: 13, color: theme.textDim, fontFamily: theme.fontBody,
    textAlign: 'center', lineHeight: 1.5, margin: '0 0 22px',
    maxWidth: 360, marginLeft: 'auto', marginRight: 'auto',
  };

  const bodyStyle = {
    fontSize: 13.5, color: theme.textDim, fontFamily: theme.fontBody,
    textAlign: 'center', lineHeight: 1.65, margin: '0 0 22px',
    maxWidth: 380, marginLeft: 'auto', marginRight: 'auto',
  };

  /* progress bar */
  const progressTrack = {
    height: 3, borderRadius: 2, background: theme.border,
    margin: '0 0 16px', overflow: 'hidden',
  };
  const progressFill = {
    height: '100%', borderRadius: 2,
    background: `linear-gradient(90deg, ${accentColor}, ${theme.accent})`,
    width: `${((step + 1) / STEPS.length) * 100}%`,
    transition: 'width 0.4s ease',
  };

  /* step counter */
  const counterStyle = {
    fontSize: 11, color: theme.textMuted, fontFamily: theme.fontData ?? theme.fontBody,
    textAlign: 'center', marginBottom: 14, letterSpacing: 0.5,
  };

  /* nav buttons */
  const navRow = { display: 'flex', gap: 10 };

  const btnBack = {
    flex: 1, padding: '11px', borderRadius: br,
    background: 'transparent', border: `1px solid ${theme.border}`,
    color: theme.textDim, fontSize: 13, fontWeight: 600,
    fontFamily: theme.fontBody, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  };

  const btnNext = {
    flex: 1, padding: '11px', borderRadius: br,
    background: `linear-gradient(135deg, ${accentColor}, ${theme.accentAlt ?? accentColor})`,
    border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
    fontFamily: theme.fontBody, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  };

  /* ---------- render helpers ---------- */

  const renderWelcome = () => (
    <>
      <div style={iconWrap}>
        <Trophy size={30} color="#fff" />
      </div>
      <h2 style={{ ...titleStyle, fontSize: 26 }}>{current.title}</h2>
      <p style={subtitleStyle}>{current.subtitle}</p>
    </>
  );

  const renderMock = () => (
    <div style={{
      background: theme.bg, border: `1px solid ${theme.border}`,
      borderRadius: br, padding: '10px 16px', margin: '0 auto 18px',
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: theme.fontData ?? theme.fontBody, fontSize: 13,
    }}>
      <FlagIcon team="Spain" size={18} />
      <span style={{ color: theme.text, fontWeight: 700 }}>Spain</span>
      <span style={{ color: theme.accent, fontWeight: 600 }}>15.8%</span>
      <span style={{ color: theme.green ?? '#22c55e', fontSize: 11 }}>▲ +0.05%</span>
    </div>
  );

  const renderVaultPipeline = () => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      overflowX: 'auto', padding: '6px 0', margin: '0 0 18px',
      justifyContent: 'center', flexWrap: 'wrap',
    }}>
      {VAULT_PIPELINE.map((node, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            padding: '5px 9px', borderRadius: Math.min(br, 6),
            background: i % 2 === 0 ? (theme.primaryBg ?? `${accentColor}18`) : (theme.greenDim ?? `${theme.green ?? '#22c55e'}18`),
            color: i % 2 === 0 ? (theme.primary ?? accentColor) : (theme.green ?? '#22c55e'),
            border: `1px solid ${i % 2 === 0 ? accentColor : (theme.green ?? '#22c55e')}33`,
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600,
            fontFamily: theme.fontData ?? theme.fontBody,
            whiteSpace: 'nowrap',
          }}>
            <node.icon size={10} />
            {node.label}
          </span>
          {i < VAULT_PIPELINE.length - 1 && (
            <span style={{ color: theme.textMuted, fontSize: 9 }}>&#x25B8;</span>
          )}
        </span>
      ))}
    </div>
  );

  const renderDualIcons = () => (
    <div style={{ ...iconWrap, gap: 6, width: 'auto', padding: '0 18px' }}>
      <Eye size={24} color="#fff" />
      <span style={{ color: '#ffffff66', fontSize: 16 }}>/</span>
      <Sparkles size={24} color="#fff" />
    </div>
  );

  /* ================================================
     JSX
     ================================================ */
  return (
    <div style={overlay}>
      <div style={card}>
        {/* Accent bar */}
        <div style={accentBar} />

        {/* Close */}
        <button onClick={close} style={closeBtn} aria-label="Close onboarding">
          <X size={16} />
        </button>

        <div style={inner}>
          {/* Icon — step 0 uses custom, step 4 uses dual, others normal */}
          {step === 0 ? renderWelcome() : step === 4 ? (
            <>
              {renderDualIcons()}
              <h2 style={titleStyle}>{current.title}</h2>
            </>
          ) : (
            <>
              <div style={iconWrap}>
                <Icon size={28} color="#fff" />
              </div>
              <h2 style={titleStyle}>{current.title}</h2>
            </>
          )}

          {/* Body text */}
          {current.body && <p style={bodyStyle}>{current.body}</p>}

          {/* Step 1 mock */}
          {current.mock && (
            <div style={{ textAlign: 'center' }}>
              {renderMock()}
            </div>
          )}

          {/* Step 2 pipeline */}
          {current.vault && renderVaultPipeline()}

          {/* Step counter */}
          <div style={counterStyle}>{step + 1} of {STEPS.length}</div>

          {/* Progress bar */}
          <div style={progressTrack}>
            <div style={progressFill} />
          </div>

          {/* Navigation */}
          <div style={navRow}>
            {step > 0 && (
              <button onClick={() => go(step - 1)} style={btnBack}>
                <ChevronLeft size={14} />
                Back
              </button>
            )}
            <button
              onClick={isLast ? close : () => go(step + 1)}
              style={btnNext}
            >
              {isLast ? 'Get Started' : 'Next'}
              {!isLast && <ChevronRight size={14} />}
              {isLast && <Zap size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
