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
    { key_name: 'theme.primary', value: '#000000', type: 'color' },
    { key_name: 'theme.secondary', value: '#000000', type: 'color' },
    { key_name: 'theme.accent', value: '#ffffff', type: 'color' },
    { key_name: 'theme.bg', value: '#ffffff', type: 'color' },
    { key_name: 'theme.surface', value: '#ffffff', type: 'color' },
    { key_name: 'theme.text', value: '#000000', type: 'color' },
    { key_name: 'theme.text_muted', value: '#666666', type: 'color' },
    { key_name: 'theme.border', value: '#eeeeee', type: 'color' },
    { key_name: 'theme.radius', value: '4px', type: 'string' },
    { key_name: 'theme.font_family', value: 'Inter, system-ui, sans-serif', type: 'string' },
    { key_name: 'theme.auth_banner', value: '/images/auth_banner.png', type: 'image' }
  ]);

  console.log('Settings seed data inserted successfully!');
}
