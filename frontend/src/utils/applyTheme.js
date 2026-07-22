import { THEME_CSS_MAP } from '../config/themeMap';

export function applyTheme(flatSettings = {}) {
  const root = document.documentElement;

  for (const [settingKey, cssVar] of Object.entries(THEME_CSS_MAP)) {
    const value = flatSettings[settingKey];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }
}
