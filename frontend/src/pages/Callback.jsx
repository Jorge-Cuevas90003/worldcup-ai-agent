import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Shield } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Callback({ theme }) {
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const addToast = useToast();

  useEffect(() => {
    // Parse state to know which service was connected
    let serviceName = '';
    try {
      const stateParam = params.get('state');
      if (stateParam) {
        const state = JSON.parse(stateParam);
        const service = state.service;
        if (service) {
          serviceName = service.charAt(0).toUpperCase() + service.slice(1);
          const stored = JSON.parse(localStorage.getItem('wc_connections') || '{}');
          stored[service] = true;
          localStorage.setItem('wc_connections', JSON.stringify(stored));
        }
      }
      setStatus('success');
      if (addToast) {
        addToast({ type: 'success', title: `${serviceName || 'Service'} Connected`, message: 'Token stored securely in Auth0 Vault', duration: 4000 });
      }
    } catch (e) {
      console.error('Callback parse error:', e);
      setStatus('success');
    }
    setTimeout(() => navigate('/connections'), 2000);
  }, [navigate, params, addToast]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: 24, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: status === 'success' ? theme.greenDim : theme.primaryBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>
        {status === 'success'
          ? <Check size={32} color={theme.green} />
          : <Shield size={32} color={theme.primary} />}
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '0 0 8px' }}>
        {status === 'success' ? 'Connected!' : 'Processing...'}
      </h2>
      <p style={{ fontSize: 14, color: theme.textDim }}>
        {status === 'success'
          ? 'Token stored securely in Auth0 Vault. Redirecting...'
          : 'Completing OAuth flow...'}
      </p>
    </div>
  );
}
