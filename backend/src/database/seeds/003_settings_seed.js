export async function seed(knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('settings').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  await knex('settings').insert([
    { key_name: 'store.app_name', value: 'WINVEL', type: 'string' },
    { key_name: 'store.tagline', value: 'WEAR YOUR VIBE', type: 'string' },
    { key_name: 'store.currency', value: 'INR', type: 'string' },
    { key_name: 'store.currency_symbol', value: '₹', type: 'string' },
    { key_name: 'store.free_shipping_threshold', value: '999', type: 'number' },
    { key_name: 'theme.primary', value: '#1A1918', type: 'color' },
    { key_name: 'theme.secondary', value: '#8C6E4A', type: 'color' },
    { key_name: 'theme.accent', value: '#EFE8DB', type: 'color' },
    { key_name: 'theme.bg', value: '#FAF8F5', type: 'color' },
    { key_name: 'theme.surface', value: '#FFFFFF', type: 'color' },
    { key_name: 'theme.text', value: '#1A1918', type: 'color' },
    { key_name: 'theme.text_muted', value: '#78716C', type: 'color' },
    { key_name: 'theme.border', value: '#E8E2D8', type: 'color' },
    { key_name: 'theme.sidebar_bg', value: '#F5F2EC', type: 'color' },
    { key_name: 'theme.sidebar_active', value: '#EFE7DB', type: 'color' },
    { key_name: 'theme.sidebar_active_border', value: '#A08260', type: 'color' },
    { key_name: 'theme.radius', value: '8px', type: 'string' },
    { key_name: 'theme.font_family', value: 'Inter, system-ui, sans-serif', type: 'string' },
    { key_name: 'theme.font_serif', value: "Inter, system-ui, sans-serif", type: 'string' },
    { key_name: 'theme.auth_banner', value: '/images/auth_banner.png', type: 'image' }
  ]);

  console.log('Settings seed data inserted successfully!');
}
