import { useState } from 'react';
import { Key, Eye, EyeOff, X, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function UpdatePasswordModal({ isOpen, onClose, user, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${user.id}/password`, { password });
      setSuccessMsg('Password updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setPassword('');
        setConfirmPassword('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  const userName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: '#F3EFE6', borderRadius: '8px', color: '#1A1A1A' }}>
              <Key size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.1rem', margin: 0 }}>Update Password</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>For user: <strong>{userName}</strong></span>
            </div>
          </div>
          <button onClick={handleClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} autoComplete="off">
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEE2E2', color: '#991B1B', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem', border: '1px solid #FCA5A5' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#DEF7EC', color: '#03543F', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem', border: '1px solid #84E1BC' }}>
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                className="form-control"
                style={{ paddingRight: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '1rem' }}>
            <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-black" disabled={loading}>
              <Check size={16} />
              <span>{loading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
