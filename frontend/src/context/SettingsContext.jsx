import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { applyTheme } from '../utils/applyTheme';
import { DEFAULT_THEME, DEFAULT_STORE, flatToGrouped } from '../config/themeMap';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({ grouped: {}, flat: {}, list: [] });
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const data = await api.get('/settings');
      setSettings(data);
      applyTheme({ ...DEFAULT_THEME, ...data.flat });
    } catch {
      applyTheme(DEFAULT_THEME);
      const flat = { ...DEFAULT_THEME, ...DEFAULT_STORE };
      setSettings({ grouped: flatToGrouped(flat), flat, list: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = async (updates) => {
    const data = await api.put('/settings', { settings: updates });
    setSettings(data);
    applyTheme({ ...DEFAULT_THEME, ...data.flat });
    return data;
  };

  const get = (category, key, fallback = '') => {
    return settings.grouped[category]?.[key] ?? fallback;
  };

  const appName = get('store', 'app_name', 'Winvel');
  const tagline = get('store', 'tagline', 'Premium T-Shirts');
  const currencySymbol = get('store', 'currency_symbol', '$');
  const logoUrl = get('store', 'logo_url', '');

  const uploadLogo = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:5001/upload', {
      method: 'POST',
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error || 'Upload failed');
    }

    const fileData = json.data; // { id, filename, url }

    // Save the numeric file ID as string to main backend settings
    const updatedSettings = await updateSettings({
      'store.logo_url': String(fileData.id),
    });

    const resolvedUrl = updatedSettings.flat['store.logo_url'];

    return {
      logoUrl: resolvedUrl,
      settings: updatedSettings,
    };
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        loadSettings,
        updateSettings,
        uploadLogo,
        get,
        appName,
        tagline,
        currencySymbol,
        logoUrl,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
