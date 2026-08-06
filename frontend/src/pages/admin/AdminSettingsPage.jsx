import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import ThemePresetPicker from '../../components/ThemePresetPicker';
import ThemePreview from '../../components/ThemePreview';
import {
  THEME_COLOR_GROUPS,
  presetToFormValues,
  presetToUpdates,
  detectActivePreset,
} from '../../config/themePresets';
import './AdminSettingsPage.css';
import ImageCropperModal from '../../components/ImageCropperModal';


export default function AdminSettingsPage() {
  const { updateSettings, uploadLogo } = useSettings();
  const [settingsList, setSettingsList] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingPreset, setApplyingPreset] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('theme');
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    api.get('/settings/admin')
      .then((data) => {
        setSettingsList(data.list);
        const values = {};
        for (const row of data.list) {
          values[`${row.category}.${row.setting_key}`] = row.setting_value;
        }
        setFormValues(values);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = [...new Set(settingsList.map((s) => s.category))];
  const activePresetId = activeTab === 'theme' ? detectActivePreset(formValues) : null;

  const handleChange = (category, settingKey, value) => {
    setFormValues((prev) => ({
      ...prev,
      [`${category}.${settingKey}`]: value,
    }));
  };

  const handleApplyPreset = async (preset) => {
    setApplyingPreset(true);
    setMessage('');
    try {
      await updateSettings(presetToUpdates(preset));
      setFormValues((prev) => ({ ...prev, ...presetToFormValues(preset) }));
      setMessage(`${preset.name} theme applied successfully!`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setApplyingPreset(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const updates = settingsList
      .filter((s) => s.category === activeTab && s.value_type !== 'image')
      .map((s) => ({
        category: s.category,
        settingKey: s.setting_key,
        settingValue: formValues[`${s.category}.${s.setting_key}`],
      }));

    try {
      await updateSettings(updates);
      setMessage('Settings saved successfully!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCroppedLogo = async (croppedFile) => {
    setShowCropper(false);
    setCropImageSrc(null);
    setUploadingLogo(true);
    setMessage('');
    try {
      const data = await uploadLogo(croppedFile);
      setFormValues((prev) => ({
        ...prev,
        'store.logo_url': data.logoUrl,
      }));
      setMessage('Logo uploaded successfully!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const renderSettingField = (setting) => (
    <div key={`${setting.category}.${setting.setting_key}`} className="form-group">
      <label htmlFor={setting.setting_key}>
        {setting.label}
        {setting.value_type === 'color' && (
          <span
            className="color-preview"
            style={{ background: formValues[`${setting.category}.${setting.setting_key}`] }}
          />
        )}
      </label>
      {setting.description && (
        <span className="field-hint">{setting.description}</span>
      )}
      {setting.value_type === 'image' ? (
        <div className="logo-upload">
          {formValues[`${setting.category}.${setting.setting_key}`] && (
            <img
              src={formValues[`${setting.category}.${setting.setting_key}`]}
              alt="Logo preview"
              className="logo-preview"
            />
          )}
          <input
            type="file"
            id={setting.setting_key}
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleLogoUpload}
            disabled={uploadingLogo}
          />
          {uploadingLogo && <span className="field-hint">Uploading...</span>}
        </div>
      ) : setting.value_type === 'color' ? (
        <div className="color-input-row">
          <input
            type="color"
            id={setting.setting_key}
            value={formValues[`${setting.category}.${setting.setting_key}`]}
            onChange={(e) => handleChange(setting.category, setting.setting_key, e.target.value)}
          />
          <input
            type="text"
            value={formValues[`${setting.category}.${setting.setting_key}`]}
            onChange={(e) => handleChange(setting.category, setting.setting_key, e.target.value)}
          />
        </div>
      ) : (
        <input
          id={setting.setting_key}
          type={setting.value_type === 'number' ? 'number' : 'text'}
          value={formValues[`${setting.category}.${setting.setting_key}`]}
          onChange={(e) => handleChange(setting.category, setting.setting_key, e.target.value)}
        />
      )}
    </div>
  );

  const renderThemeTab = () => {
    const themeSettings = settingsList.filter((s) => s.category === 'theme');
    const byKey = Object.fromEntries(themeSettings.map((s) => [s.setting_key, s]));

    return (
      <>
        <ThemePresetPicker
          activePresetId={activePresetId}
          onSelect={handleApplyPreset}
          applying={applyingPreset}
        />

        <ThemePreview formValues={formValues} />

        <div className="theme-custom-section">
          <h3 className="theme-custom-title">Fine-tune individual colors</h3>
          <p className="theme-custom-hint">
            Optional — adjust specific colors after picking a preset above.
          </p>

          {THEME_COLOR_GROUPS.map((group) => {
            const groupSettings = group.keys
              .map((key) => byKey[key])
              .filter(Boolean);

            if (groupSettings.length === 0) return null;

            return (
              <div key={group.id} className="theme-color-group card">
                <div className="theme-color-group-header">
                  <h4>{group.label}</h4>
                  <span className="field-hint">{group.hint}</span>
                </div>
                <div className="settings-grid">
                  {groupSettings.map(renderSettingField)}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderStoreTab = () => {
    const storeSettings = settingsList.filter((s) => s.category === 'store');
    return (
      <div className="settings-grid">
        {storeSettings.map(renderSettingField)}
      </div>
    );
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="admin-settings">
      <h1 className="page-title">App Settings</h1>
      <p className="settings-desc">
        Use theme presets for quick changes, or fine-tune colors below. All settings are saved in the database.
      </p>

      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`settings-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {activeTab === 'theme' ? renderThemeTab() : renderStoreTab()}

        {message && (
          <div className={`settings-message ${message.includes('success') || message.includes('applied') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {activeTab === 'theme' && (
          <p className="settings-save-hint">
            Presets save automatically when clicked. Use Save only if you changed individual colors below.
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving || applyingPreset}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      {showCropper && (
        <ImageCropperModal
          src={cropImageSrc}
          onClose={() => {
            setShowCropper(false);
            setCropImageSrc(null);
          }}
          onCrop={handleCroppedLogo}
        />
      )}
    </div>
  );
}
