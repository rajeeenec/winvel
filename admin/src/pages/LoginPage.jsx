import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@winvel.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { appName } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'var(--color-bg)', color: 'var(--color-secondary)', marginBottom: '1rem' }}>
            <ShieldCheck size={36} />
          </div>
          <h1>{appName ? appName.toUpperCase() : 'WINVEL'} ADMIN</h1>
          <p>Sign in to access your store control panel</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-bg)', borderRadius: 'var(--radius)', color: 'var(--color-danger-text)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                required
                className="form-control"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@winvel.com"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                required
                className="form-control"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
          >
            {submitting ? 'Authenticating...' : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Default Credentials: <code style={{ color: 'var(--color-secondary)', background: 'var(--color-bg)', padding: '0.2rem 0.4rem', borderRadius: 4 }}>admin@winvel.com / admin123</code>
        </div>
      </div>
    </div>
  );
}
