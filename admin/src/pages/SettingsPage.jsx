import { useState, useEffect } from 'react';
import { Save, Check, Palette, Store, RefreshCw, Image, Upload, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { applyTheme } from '../utils/applyTheme';
import { DEFAULT_THEME } from '../config/themeMap';
import api from '../services/api';

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads')) {
    return `http://localhost:4000${url}`;
  }
  return url;
}

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
    'theme.promo_banner': '',
    'theme.auth_banner': '',
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);

  // Dynamic Banners state
  const [dbBanners, setDbBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await api.get('/banners/admin');
      const list = res.data || res || [];
      setDbBanners(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error loading banners:', err);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

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

  // Banner Actions
  const handleAddBanner = async () => {
    try {
      const newBannerData = {
        title: 'BASIC FIT. PREMIUM FEEL.',
        subtitle: 'Premium quality t-shirts for your everyday comfort and style.',
        badge: 'NEW COLLECTION',
        image_url: '/images/hero_slide_1.png',
        button_text: 'SHOP NOW',
        button_url: '/shop',
        sort_order: dbBanners.length + 1,
        status: true,
      };
      const res = await api.post('/banners', newBannerData);
      const created = res.data || res;
      setDbBanners((prev) => [...prev, created]);
    } catch (err) {
      alert('Error creating banner: ' + err.message);
    }
  };

  const handleBannerChange = (id, field, value) => {
    setDbBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSaveBanner = async (banner) => {
    try {
      await api.put(`/banners/${banner.id}`, banner);
      alert('Banner slide saved successfully!');
    } catch (err) {
      alert('Error saving banner slide: ' + err.message);
    }
  };

  const handleToggleBannerStatus = async (banner) => {
    try {
      const newStatus = !banner.status;
      await api.put(`/banners/${banner.id}`, { ...banner, status: newStatus });
      setDbBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert('Error toggling status: ' + err.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner slide?')) return;
    try {
      await api.delete(`/banners/${id}`);
      setDbBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert('Error deleting banner: ' + err.message);
    }
  };

  const handleBannerFileUpload = async (bannerId, file) => {
    if (!file) return;
    setUploadingKey(`banner_${bannerId}`);
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
        handleBannerChange(bannerId, 'image_url', uploadedUrl);

        // Auto-save updated image to DB
        const currentBanner = dbBanners.find((b) => b.id === bannerId);
        if (currentBanner) {
          await api.put(`/banners/${bannerId}`, { ...currentBanner, image_url: uploadedUrl });
        }
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

  const staticBannerFields = [
    { key: 'theme.promo_banner', label: 'Summer Sale Promo Banner Image', desc: 'Promo banner image displayed on homepage.' },
    { key: 'theme.auth_banner', label: 'Login / Auth Page Side Banner', desc: 'Background banner image for Admin & Store login pages.' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store & Theme Settings</h1>
          <p className="page-subtitle">Configure store parameters, dynamic hero banners, colors, and branding</p>
        </div>
      </div>

      <div style={{ maxWidth: 900 }}>
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

          {/* Dynamic Multiple Hero Banners Slider Manager */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Image size={20} color="var(--color-secondary)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Dynamic Storefront Hero Banners (Multiple Add & Config)</h2>
              </div>
              <button
                type="button"
                onClick={handleAddBanner}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={16} />
                <span>+ Add New Banner Slide</span>
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Manage dynamic hero banners. Configure top badge name, title heading, subtitle description line, banner image, and status for each slide. Toggle status OFF to hide a banner on the storefront.
            </p>

            {loadingBanners ? (
              <div style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Loading banners...</div>
            ) : dbBanners.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius)' }}>
                No banners configured yet. Click "+ Add New Banner Slide" above to create your first dynamic hero banner!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {dbBanners.map((banner, index) => {
                  const isUploading = uploadingKey === `banner_${banner.id}`;

                  return (
                    <div
                      key={banner.id}
                      style={{
                        padding: '1.25rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius)',
                        backgroundColor: banner.status ? 'var(--color-surface)' : '#f9fafb',
                        opacity: banner.status ? 1 : 0.7,
                        transition: 'var(--transition)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', padding: '0.2rem 0.6rem', background: 'var(--color-accent)', borderRadius: '4px' }}>
                            Banner Slide #{index + 1}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: banner.status ? '#16a34a' : '#dc2626' }}>
                            {banner.status ? '● ACTIVE (Visible on Store)' : '○ INACTIVE (Hidden from Store)'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleBannerStatus(banner)}
                            className={`btn btn-sm ${banner.status ? 'btn-outline' : 'btn-primary'}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            title={banner.status ? 'Deactivate this banner' : 'Activate this banner'}
                          >
                            {banner.status ? <ToggleRight size={18} color="#16a34a" /> : <ToggleLeft size={18} />}
                            <span>{banner.status ? 'Status: ON' : 'Status: OFF'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveBanner(banner)}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Save size={14} />
                            <span>Save Slide</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                            title="Delete this banner slide"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>1. Top Badge Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. NEW COLLECTION"
                            value={banner.badge || ''}
                            onChange={(e) => handleBannerChange(banner.id, 'badge', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>2. Heading Title</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. BASIC FIT. PREMIUM FEEL."
                            value={banner.title || ''}
                            onChange={(e) => handleBannerChange(banner.id, 'title', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ fontWeight: 600 }}>3. Subtitle Description Line</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Premium quality t-shirts for your everyday comfort and style."
                          value={banner.subtitle || ''}
                          onChange={(e) => handleBannerChange(banner.id, 'subtitle', e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Button Text</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. SHOP NOW"
                            value={banner.button_text || ''}
                            onChange={(e) => handleBannerChange(banner.id, 'button_text', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Button / Link URL</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. /shop?category=1"
                            value={banner.button_url || ''}
                            onChange={(e) => handleBannerChange(banner.id, 'button_url', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Banner Image</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          {banner.image_url && (
                            <div style={{ width: 110, height: 65, borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-border)', flexShrink: 0, backgroundColor: '#fff' }}>
                              <img src={getImageUrl(banner.image_url)} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Image URL or upload file below..."
                              value={banner.image_url || ''}
                              onChange={(e) => handleBannerChange(banner.id, 'image_url', e.target.value)}
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
                                onChange={(e) => handleBannerFileUpload(banner.id, e.target.files[0])}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Static Promo Banners */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <Image size={20} color="var(--color-secondary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Promo & Auth Page Banner Images</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {staticBannerFields.map((b) => {
                const currentVal = formData[b.key] || '';
                const isUploading = uploadingKey === b.key;

                return (
                  <div key={b.key} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--color-bg)' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.92rem' }}>{b.label}</label>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{b.desc}</p>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {currentVal && (
                        <div style={{ width: 100, height: 60, borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-border)', flexShrink: 0, backgroundColor: '#fff' }}>
                          <img src={getImageUrl(currentVal)} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
