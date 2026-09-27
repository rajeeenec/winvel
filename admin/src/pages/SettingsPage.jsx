import { useState, useEffect } from 'react';
import { Save, Check, Palette, Store, RefreshCw, Image, Upload } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { applyTheme } from '../utils/applyTheme';
import { DEFAULT_THEME } from '../config/themeMap';

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings();
  const [formData, setFormData] = useState({
    'store.app_name': 'WINVEEL',
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
    'theme.hero_banner_1': '',
    'theme.hero_banner_2': '',
    'theme.promo_banner': '',
    'theme.auth_banner': '',
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);

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
    if (key.startsWith('theme.')) {
      applyTheme(updated);
    }
  };

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const data = new FormData();
      data.append('file', file);
      const token = localStorage.getItem('winveel_admin_token');
      const res = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: data,
      });
      const json = await res.json();
      if (json && (json.url || json.data?.url)) {
        const uploadedUrl = json.url || json.data.url;
        handleChange(key, uploadedUrl);
      } else {
        alert('Image upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingKey(null);
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

  const bannerFields = [
    { key: 'theme.hero_banner_1', label: 'Hero Slide 1 Banner Image', desc: 'Main hero banner shown on Storefront homepage (Slide 1)' },
    { key: 'theme.hero_banner_2', label: 'Hero Slide 2 Banner Image', desc: 'Secondary hero banner shown on Storefront homepage (Slide 2)' },
    { key: 'theme.promo_banner', label: 'Summer Sale Promo Banner Image', desc: 'Full-width promo banner image displayed on homepage' },
    { key: 'theme.auth_banner', label: 'Login / Auth Page Side Banner', desc: 'Background banner image for Admin & Store login pages' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store & Theme Settings</h1>
          <p className="page-subtitle">Configure store parameters, custom banner images, colors, and branding</p>
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

          {/* Banner Images Management Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <Image size={20} color="var(--color-secondary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Storefront Banner Images Management</h2>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Upload custom banner images to replace default placeholders across the Storefront and Auth pages.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {bannerFields.map((b) => {
                const currentVal = formData[b.key] || '';
                const isUploading = uploadingKey === b.key;

                return (
                  <div key={b.key} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--color-bg)' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.92rem' }}>{b.label}</label>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{b.desc}</p>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {currentVal && (
                        <div style={{ width: 100, height: 60, borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-border)', flexShrink: 0, backgroundColor: '#fff' }}>
                          <img src={currentVal} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}

                      <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Image URL or upload file below..."
                          value={currentVal}
                          onChange={(e) => handleChange(b.key, e.target.value)}
                        />
                        <label
                          className="btn btn-outline"
                          style={{ cursor: isUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <Upload size={16} />
                          <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={isUploading}
                            onChange={(e) => handleFileUpload(b.key, e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              <span>Settings, Banners, and Theme saved successfully!</span>
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
