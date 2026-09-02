export async function seed(knex) {
  // Clear existing categories
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('categories').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // Insert default category records
  await knex('categories').insert([
    { id: 1, parent_id: null, name: 'Men', slug: 'men', sort_order: 1, status: true },
    { id: 2, parent_id: null, name: 'Women', slug: 'women', sort_order: 2, status: true },
    { id: 3, parent_id: null, name: 'Oversized', slug: 'oversized', sort_order: 3, status: true },
    { id: 4, parent_id: null, name: 'Basics', slug: 'basics', sort_order: 4, status: true },
    { id: 5, parent_id: null, name: 'New Arrivals', slug: 'new-arrivals', sort_order: 5, status: true }
  ]);

  console.log('Category seed data inserted successfully!');
}
