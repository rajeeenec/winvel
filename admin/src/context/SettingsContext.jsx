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
      const res = await api.get('/settings');
      const data = res.data || res;
      if (data && data.flat) {
        setSettings(data);
        applyTheme({ ...DEFAULT_THEME, ...data.flat });
      } else if (Array.isArray(data)) {
        const flat = { ...DEFAULT_THEME, ...DEFAULT_STORE };
        data.forEach((item) => {
          flat[item.key_name || `${item.category}.${item.setting_key}`] = item.value || item.setting_value;
        });
        const grouped = flatToGrouped(flat);
        setSettings({ grouped, flat, list: data });
        applyTheme(flat);
      } else {
        applyTheme(DEFAULT_THEME);
        const flat = { ...DEFAULT_THEME, ...DEFAULT_STORE };
        setSettings({ grouped: flatToGrouped(flat), flat, list: [] });
      }
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

  const updateSettings = async (flatUpdates) => {
    const settingsArray = Object.entries(flatUpdates).map(([key, value]) => {
      const dot = key.indexOf('.');
      return {
        category: key.slice(0, dot),
        settingKey: key.slice(dot + 1),
        settingValue: String(value),
      };
    });

    const res = await api.put('/settings', { settings: settingsArray });
    const data = res.data || res;
    
    // Update state and re-apply theme
    const newFlat = { ...settings.flat, ...flatUpdates };
    const newGrouped = flatToGrouped(newFlat);
    const updatedState = { grouped: newGrouped, flat: newFlat, list: data.list || settings.list };
    
    setSettings(updatedState);
    applyTheme({ ...DEFAULT_THEME, ...newFlat });
    return updatedState;
  };

  const get = (category, key, fallback = '') => {
    return settings.grouped[category]?.[key] ?? settings.flat[`${category}.${key}`] ?? fallback;
  };

  const appName = get('store', 'app_name', 'WINVEL');
  const tagline = get('store', 'tagline', 'WEAR YOUR VIBE');
  const currencySymbol = get('store', 'currency_symbol', '₹');

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        loadSettings,
        updateSettings,
        get,
        appName,
        tagline,
        currencySymbol,
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
