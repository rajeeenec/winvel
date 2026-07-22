// Maps DB setting keys (category.key) → CSS custom properties
export const THEME_CSS_MAP = {
  'theme.primary': '--color-primary',
  'theme.secondary': '--color-secondary',
  'theme.accent': '--color-accent',
  'theme.bg': '--color-bg',
  'theme.surface': '--color-surface',
  'theme.text': '--color-text',
  'theme.text_muted': '--color-text-muted',
  'theme.border': '--color-border',
  'theme.success': '--color-success',
  'theme.warning': '--color-warning',
  'theme.danger': '--color-danger',
  'theme.primary_hover': '--color-primary-hover',
  'theme.secondary_hover': '--color-secondary-hover',
  'theme.success_bg': '--color-success-bg',
  'theme.success_text': '--color-success-text',
  'theme.warning_bg': '--color-warning-bg',
  'theme.warning_text': '--color-warning-text',
  'theme.danger_bg': '--color-danger-bg',
  'theme.danger_text': '--color-danger-text',
  'theme.info_bg': '--color-info-bg',
  'theme.info_text': '--color-info-text',
  'theme.radius': '--radius',
  'theme.font_family': '--font',
};

export const DEFAULT_THEME = {
  'theme.primary': '#1a1a2e',
  'theme.secondary': '#e94560',
  'theme.accent': '#0f3460',
  'theme.bg': '#f8f9fa',
  'theme.surface': '#ffffff',
  'theme.text': '#1a1a2e',
  'theme.text_muted': '#6c757d',
  'theme.border': '#dee2e6',
  'theme.success': '#28a745',
  'theme.warning': '#ffc107',
  'theme.danger': '#dc3545',
  'theme.primary_hover': '#2a2a4e',
  'theme.secondary_hover': '#d63851',
  'theme.success_bg': '#d4edda',
  'theme.success_text': '#155724',
  'theme.warning_bg': '#fff3cd',
  'theme.warning_text': '#856404',
  'theme.danger_bg': '#f8d7da',
  'theme.danger_text': '#721c24',
  'theme.info_bg': '#d1ecf1',
  'theme.info_text': '#0c5460',
  'theme.radius': '8px',
  'theme.font_family': 'Inter, system-ui, sans-serif',
};

export const DEFAULT_STORE = {
  'store.app_name': 'Winvel',
  'store.tagline': 'Premium T-Shirts',
  'store.currency': 'USD',
  'store.currency_symbol': '$',
  'store.free_shipping_threshold': 50,
};

export function flatToGrouped(flat) {
  const grouped = {};
  for (const [key, value] of Object.entries(flat)) {
    const dot = key.indexOf('.');
    const category = key.slice(0, dot);
    const settingKey = key.slice(dot + 1);
    if (!grouped[category]) grouped[category] = {};
    grouped[category][settingKey] = value;
  }
  return grouped;
}
