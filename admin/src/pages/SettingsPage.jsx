import { useState, useEffect } from 'react';
import { Save, Check, Palette, Store, RefreshCw } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { applyTheme } from '../utils/applyTheme';
import { DEFAULT_THEME } from '../config/themeMap';

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings();
  const [formData, setFormData] = useState({
    'store.app_name': 'WINVEL',
    'store.tagline': 'WEAR YOUR VIBE',
    'store.currency': 'INR',
    'store.currency_symbol': '₹',
    'store.free_shipping_threshold': '999',
    'theme.primary': '#1a1a2e',
    'theme.secondary': '#e94560',
    'theme.accent': '#0f3460',
    'theme.bg': '#f8f9fa',
    'theme.surface': '#ffffff',
    'theme.text': '#1a1a2e',
    'theme.text_muted': '#6c757d',
    'theme.border': '#dee2e6',
    'theme.radius': '8px',
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings && settings.flat && Object.keys(settings.flat).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...settings.flat,
      }));
    }
  }, [settings]);

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    // Instant live preview
    if (key.startsWith('theme.')) {
      applyTheme(updated);
    }
  };

  const handleResetDefaults = () => {
    const reset = {
      ...formData,
      ...DEFAULT_THEME,
    };
    setFormData(reset);
    applyTheme(reset);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(false);
    setSaving(true);

    try {
      await updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>Loading store configuration...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store & Theme Settings</h1>
          <p className="page-subtitle">Configure store parameters, branding, dynamic colors, and design theme</p>
        </div>
      </div>

      <div style={{ maxWidth: 850 }}>
        <form onSubmit={handleSave}>
          {/* General Branding */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <Store size={20} color="var(--color-secondary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>General Branding & Localization</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData['store.app_name'] || ''}
                  onChange={(e) => handleChange('store.app_name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData['store.tagline'] || ''}
                  onChange={(e) => handleChange('store.tagline', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData['store.currency'] || ''}
                  onChange={(e) => handleChange('store.currency', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData['store.currency_symbol'] || ''}
                  onChange={(e) => handleChange('store.currency_symbol', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Theme & Color Palette Customization */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={20} color="var(--color-secondary)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Shared Theme & Color Palette</h2>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="btn btn-outline btn-sm"
                title="Reset to default theme"
              >
                <RefreshCw size={14} />
                <span>Reset Theme</span>
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Colors configured here apply live to both the Storefront and Admin control panel.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {/* Primary Color */}
              <div className="form-group">
                <label className="form-label">Primary Color (Sidebar/Nav)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    style={{ width: 42, height: 42, padding: 2, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                    value={formData['theme.primary'] || '#1a1a2e'}
                    onChange={(e) => handleChange('theme.primary', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={formData['theme.primary'] || '#1a1a2e'}
                    onChange={(e) => handleChange('theme.primary', e.target.value)}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="form-group">
                <label className="form-label">Secondary / Accent Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    style={{ width: 42, height: 42, padding: 2, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                    value={formData['theme.secondary'] || '#e94560'}
                    onChange={(e) => handleChange('theme.secondary', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={formData['theme.secondary'] || '#e94560'}
                    onChange={(e) => handleChange('theme.secondary', e.target.value)}
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="form-group">
                <label className="form-label">Background Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    style={{ width: 42, height: 42, padding: 2, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                    value={formData['theme.bg'] || '#f8f9fa'}
                    onChange={(e) => handleChange('theme.bg', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={formData['theme.bg'] || '#f8f9fa'}
                    onChange={(e) => handleChange('theme.bg', e.target.value)}
                  />
                </div>
              </div>

              {/* Surface Color */}
              <div className="form-group">
                <label className="form-label">Surface / Card Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    style={{ width: 42, height: 42, padding: 2, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                    value={formData['theme.surface'] || '#ffffff'}
                    onChange={(e) => handleChange('theme.surface', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={formData['theme.surface'] || '#ffffff'}
                    onChange={(e) => handleChange('theme.surface', e.target.value)}
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="form-group">
                <label className="form-label">Text Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    style={{ width: 42, height: 42, padding: 2, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                    value={formData['theme.text'] || '#1a1a2e'}
                    onChange={(e) => handleChange('theme.text', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={formData['theme.text'] || '#1a1a2e'}
                    onChange={(e) => handleChange('theme.text', e.target.value)}
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div className="form-group">
                <label className="form-label">Corner Border Radius</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData['theme.radius'] || '8px'}
                  onChange={(e) => handleChange('theme.radius', e.target.value)}
                  placeholder="e.g. 8px or 12px"
                />
              </div>
            </div>
          </div>

          {saved && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-bg)', borderRadius: 'var(--radius)', color: 'var(--color-success-text)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Check size={18} />
              <span>Settings and Theme saved successfully!</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
