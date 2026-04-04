import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Check, X, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const icons = { success: Check, error: X, info: Info, warning: AlertTriangle };

function ToastItem({ toast, theme, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const Icon = icons[toast.type] || Info;
  const color = toast.type === 'success' ? theme.green
    : toast.type === 'error' ? theme.red
    : toast.type === 'warning' ? '#f59e0b'
    : theme.primary;

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(() => onRemove(toast.id), 300);
      return () => clearTimeout(timer);
    }
  }, [exiting, toast.id, onRemove]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
      background: theme.card, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${theme.border}`, borderRadius: theme.borderRadius,
      boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${color}33`,
      animation: exiting ? 'toastOut 0.3s ease-in forwards' : 'toastIn 0.3s ease-out',
      borderLeft: `3px solid ${color}`,
      maxWidth: 340, width: '100%',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, fontFamily: theme.fontBody, marginBottom: 2 }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontData, lineHeight: 1.4 }}>
          {toast.message}
        </div>
      </div>
      <button onClick={() => setExiting(true)} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        color: theme.textMuted, flexShrink: 0,
      }}>
        <X size={12} />
      </button>
    </div>
  );
}

export function ToastProvider({ children, theme }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() + Math.random() }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
        }}>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} theme={theme} onRemove={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
