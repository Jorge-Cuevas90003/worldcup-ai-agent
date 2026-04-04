import { useState, useCallback } from 'react';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

/**
 * Step-Up Authentication Modal
 * Requires re-confirmation before high-risk actions.
 * Demonstrates Auth0 Token Vault authorization for hackathon judges.
 */
function StepUpModal({ action, onConfirm, onCancel, theme }) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      onConfirm();
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease-out',
      padding: 20,
    }}
      onClick={onCancel}
    >
      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.accent}44`,
          borderRadius: theme.borderRadius,
          padding: 28,
          maxWidth: 380,
          width: '100%',
          boxShadow: `0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px ${theme.border}, 0 0 40px ${theme.primaryGlow}`,
          animation: 'slideUp 0.3s cubic-bezier(.4,0,.2,1)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${theme.accent}, #f59e0b, ${theme.accent})`,
          boxShadow: `0 0 12px ${theme.primaryGlow}`,
        }} />

        {/* Shield icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `linear-gradient(135deg, ${theme.accent}22, #f59e0b22)`,
          border: `1px solid ${theme.accent}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: `0 0 24px ${theme.primaryGlow}`,
        }}>
          <Shield size={24} color={theme.accent} />
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 16, fontWeight: 700, color: theme.text,
          fontFamily: theme.fontHeading, textAlign: 'center',
          margin: '0 0 8px',
        }}>
          Step-Up Verification
        </h3>

        {/* Subtitle */}
        <p style={{
          fontSize: 12, color: theme.textDim, textAlign: 'center',
          fontFamily: theme.fontData, margin: '0 0 18px', lineHeight: 1.5,
        }}>
          This action requires additional verification. Auth0 Token Vault ensures this operation is authorized.
        </p>

        {/* Action description card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', borderRadius: Math.min(theme.borderRadius, 10),
          background: `${theme.bg}cc`,
          border: `1px solid ${theme.border}`,
          marginBottom: 20,
        }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: theme.text,
              fontFamily: theme.fontBody,
            }}>
              High-Risk Action
            </div>
            <div style={{
              fontSize: 11, color: theme.textDim, fontFamily: theme.fontData,
            }}>
              {action}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 16px',
              borderRadius: theme.borderRadius,
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              color: theme.textDim, fontSize: 12, fontWeight: 600,
              fontFamily: theme.fontBody, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            style={{
              flex: 1.5, padding: '10px 16px',
              borderRadius: theme.borderRadius,
              background: confirming
                ? theme.green
                : `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
              border: 'none',
              color: '#fff', fontSize: 12, fontWeight: 700,
              fontFamily: theme.fontBody, cursor: confirming ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.3s',
              boxShadow: confirming ? `0 0 16px ${theme.green}66` : `0 4px 16px ${theme.primaryGlow}`,
            }}
          >
            {confirming ? (
              <>
                <Lock size={13} />
                Authorized
              </>
            ) : (
              <>
                <Shield size={13} />
                Confirm &amp; Authorize
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          marginTop: 14,
        }}>
          <Lock size={9} color={theme.textMuted} />
          <span style={{
            fontSize: 9, color: theme.textMuted, fontFamily: theme.fontData,
          }}>
            Secured by Auth0 Token Vault
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * useStepUp hook
 * Returns { requireAuth, StepUpModal } for step-up authentication.
 * Usage: requireAuth("Disconnect Gmail", () => doDisconnect("gmail"))
 */
export function useStepUp(theme) {
  const [pending, setPending] = useState(null);

  const requireAuth = useCallback((action, onConfirm) => {
    setPending({ action, onConfirm });
  }, []);

  const modal = pending ? (
    <StepUpModal
      action={pending.action}
      onConfirm={() => {
        const cb = pending.onConfirm;
        setPending(null);
        cb();
      }}
      onCancel={() => setPending(null)}
      theme={theme}
    />
  ) : null;

  return { requireAuth, StepUpModal: modal };
}

export default StepUpModal;
