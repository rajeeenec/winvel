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
  'theme.sidebar_bg': '--color-sidebar-bg',
  'theme.sidebar_active': '--color-sidebar-active',
  'theme.sidebar_active_border': '--color-sidebar-active-border',
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
  'theme.font_serif': '--font-serif',
};

export const DEFAULT_THEME = {
  'theme.primary': '#1A1918',
  'theme.secondary': '#8C6E4A',
  'theme.accent': '#EFE8DB',
  'theme.bg': '#FAF8F5',
  'theme.surface': '#FFFFFF',
  'theme.text': '#1A1918',
  'theme.text_muted': '#78716C',
  'theme.border': '#E8E2D8',
  'theme.sidebar_bg': '#F5F2EC',
  'theme.sidebar_active': '#EFE7DB',
  'theme.sidebar_active_border': '#A08260',
  'theme.success': '#2E6B47',
  'theme.warning': '#B45309',
  'theme.danger': '#B91C1C',
  'theme.primary_hover': '#33312E',
  'theme.secondary_hover': '#755A3B',
  'theme.success_bg': '#E6F4EA',
  'theme.success_text': '#137333',
  'theme.warning_bg': '#FEF3C7',
  'theme.warning_text': '#92400E',
  'theme.danger_bg': '#FEE2E2',
  'theme.danger_text': '#991B1B',
  'theme.info_bg': '#EFE8DB',
  'theme.info_text': '#1A1918',
  'theme.radius': '8px',
  'theme.font_family': 'Inter, system-ui, sans-serif',
  'theme.font_serif': 'Inter, system-ui, sans-serif',
};

export const DEFAULT_STORE = {
  'store.app_name': 'WINVEL',
  'store.tagline': 'WEAR YOUR VIBE',
  'store.currency': 'INR',
  'store.currency_symbol': '₹',
  'store.free_shipping_threshold': 999,
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
