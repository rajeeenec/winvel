import bcrypt from 'bcryptjs';

export async function seed(knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('product_categories').truncate();
  await knex('product_images').truncate();
  await knex('product_variants').truncate();
  await knex('products').truncate();
  await knex('colors').truncate();
  await knex('sizes').truncate();
  await knex('role_permissions').truncate();
  await knex('permissions').truncate();
  await knex('users').truncate();
  await knex('roles').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // 1. Seed Roles
  await knex('roles').insert([
    { id: 1, name: 'Customer', description: 'General shopping customer account' },
    { id: 2, name: 'Admin', description: 'Store administrator with catalog/order access' },
    { id: 3, name: 'Super Admin', description: 'Full control super administrator' }
  ]);

  // 2. Seed Admin User
  const adminHash = await bcrypt.hash('admin123', 10);
  await knex('users').insert([
    {
      id: 1,
      role_id: 2,
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@winvel.com',
      password_hash: adminHash,
      status: 'active'
    }
  ]);

  // 3. Seed Sizes
  await knex('sizes').insert([
    { id: 1, name: 'S', sort_order: 1 },
    { id: 2, name: 'M', sort_order: 2 },
    { id: 3, name: 'L', sort_order: 3 },
    { id: 4, name: 'XL', sort_order: 4 },
    { id: 5, name: 'XXL', sort_order: 5 }
  ]);

  // 4. Seed Colors
  await knex('colors').insert([
    { id: 1, name: 'Black', hex_code: '#000000', sort_order: 1 },
    { id: 2, name: 'Sage Green', hex_code: '#879883', sort_order: 2 },
    { id: 3, name: 'White', hex_code: '#ffffff', sort_order: 3 },
    { id: 4, name: 'Lavender', hex_code: '#c8a2c8', sort_order: 4 },
    { id: 5, name: 'Sand Beige', hex_code: '#e1c699', sort_order: 5 },
    { id: 6, name: 'Deep Teal', hex_code: '#005a5b', sort_order: 6 }
  ]);

  // 5. Seed Products
  await knex('products').insert([
    { id: 1, name: 'Classic Black Tee', slug: 'classic-black-tee', short_description: 'Premium quality black t-shirt', description: 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', brand: 'WINVEL', base_price: 699.00, status: 'active', featured: true, is_new: true },
    { id: 2, name: 'Sage Green Tee', slug: 'sage-green-tee', short_description: 'Premium quality sage green t-shirt', description: 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', brand: 'WINVEL', base_price: 699.00, status: 'active', featured: true, is_new: true },
    { id: 3, name: 'Essential White Tee', slug: 'essential-white-tee', short_description: 'Premium quality white t-shirt', description: 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', brand: 'WINVEL', base_price: 599.00, status: 'active', featured: true, is_new: true },
    { id: 4, name: 'Lavender Tee', slug: 'lavender-tee', short_description: 'Premium quality lavender purple t-shirt', description: 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', brand: 'WINVEL', base_price: 599.00, status: 'active', featured: true, is_new: true },
    { id: 5, name: 'Sand Beige Tee', slug: 'sand-beige-tee', short_description: 'Premium quality beige t-shirt', description: 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', brand: 'WINVEL', base_price: 699.00, status: 'active', featured: true, is_new: true },
    { id: 6, name: 'Deep Teal Tee', slug: 'deep-teal-tee', short_description: 'Premium quality deep teal t-shirt', description: 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', brand: 'WINVEL', base_price: 699.00, status: 'active', featured: true, is_new: true }
  ]);

  // 6. Seed Product Variants
  await knex('product_variants').insert([
    { id: 1, product_id: 1, size_id: 1, color_id: 1, sku: 'TEE-BLK-S', price: 699.00, compare_at_price: 899.00, stock_quantity: 50 },
    { id: 2, product_id: 1, size_id: 2, color_id: 1, sku: 'TEE-BLK-M', price: 699.00, compare_at_price: 899.00, stock_quantity: 75 },
    { id: 3, product_id: 1, size_id: 3, color_id: 1, sku: 'TEE-BLK-L', price: 699.00, compare_at_price: 899.00, stock_quantity: 60 },
    { id: 4, product_id: 1, size_id: 4, color_id: 1, sku: 'TEE-BLK-XL', price: 699.00, compare_at_price: 899.00, stock_quantity: 40 },
    { id: 5, product_id: 2, size_id: 1, color_id: 2, sku: 'TEE-GRN-S', price: 699.00, compare_at_price: null, stock_quantity: 30 },
    { id: 6, product_id: 2, size_id: 2, color_id: 2, sku: 'TEE-GRN-M', price: 699.00, compare_at_price: null, stock_quantity: 45 },
    { id: 7, product_id: 2, size_id: 3, color_id: 2, sku: 'TEE-GRN-L', price: 699.00, compare_at_price: null, stock_quantity: 40 },
    { id: 8, product_id: 3, size_id: 1, color_id: 3, sku: 'TEE-WHT-S', price: 599.00, compare_at_price: null, stock_quantity: 100 },
    { id: 9, product_id: 3, size_id: 2, color_id: 3, sku: 'TEE-WHT-M', price: 599.00, compare_at_price: null, stock_quantity: 150 },
    { id: 10, product_id: 3, size_id: 3, color_id: 3, sku: 'TEE-WHT-L', price: 599.00, compare_at_price: null, stock_quantity: 120 },
    { id: 11, product_id: 4, size_id: 1, color_id: 4, sku: 'TEE-LAV-S', price: 599.00, compare_at_price: 749.00, stock_quantity: 25 },
    { id: 12, product_id: 4, size_id: 2, color_id: 4, sku: 'TEE-LAV-M', price: 599.00, compare_at_price: 749.00, stock_quantity: 20 },
    { id: 13, product_id: 4, size_id: 3, color_id: 4, sku: 'TEE-LAV-L', price: 599.00, compare_at_price: 749.00, stock_quantity: 30 },
    { id: 14, product_id: 5, size_id: 1, color_id: 5, sku: 'TEE-BGE-S', price: 699.00, compare_at_price: null, stock_quantity: 40 },
    { id: 15, product_id: 5, size_id: 2, color_id: 5, sku: 'TEE-BGE-M', price: 699.00, compare_at_price: null, stock_quantity: 50 },
    { id: 16, product_id: 5, size_id: 3, color_id: 5, sku: 'TEE-BGE-L', price: 699.00, compare_at_price: null, stock_quantity: 45 },
    { id: 17, product_id: 6, size_id: 1, color_id: 6, sku: 'TEE-TEL-S', price: 699.00, compare_at_price: 899.00, stock_quantity: 35 },
    { id: 18, product_id: 6, size_id: 2, color_id: 6, sku: 'TEE-TEL-M', price: 699.00, compare_at_price: 899.00, stock_quantity: 45 },
    { id: 19, product_id: 6, size_id: 3, color_id: 6, sku: 'TEE-TEL-L', price: 699.00, compare_at_price: 899.00, stock_quantity: 40 }
  ]);

  // 7. Seed Product Images
  await knex('product_images').insert([
    { product_id: 1, variant_id: null, image_url: '/images/products/product_black.png', alt_text: 'Classic Black Tee Primary', sort_order: 1, is_primary: true },
    { product_id: 2, variant_id: null, image_url: '/images/products/product_green.png', alt_text: 'Sage Green Tee Primary', sort_order: 1, is_primary: true },
    { product_id: 3, variant_id: null, image_url: '/images/products/product_white.png', alt_text: 'Essential White Tee Primary', sort_order: 1, is_primary: true },
    { product_id: 4, variant_id: null, image_url: '/images/products/product_lavender.png', alt_text: 'Lavender Tee Primary', sort_order: 1, is_primary: true },
    { product_id: 5, variant_id: null, image_url: '/images/products/product_beige.png', alt_text: 'Sand Beige Tee Primary', sort_order: 1, is_primary: true },
    { product_id: 6, variant_id: null, image_url: '/images/products/product_teal.png', alt_text: 'Deep Teal Tee Primary', sort_order: 1, is_primary: true }
  ]);

  // 8. Seed Product Categories Relationship
  await knex('product_categories').insert([
    { product_id: 1, category_id: 1 },
    { product_id: 1, category_id: 5 },
    { product_id: 2, category_id: 1 },
    { product_id: 2, category_id: 5 },
    { product_id: 3, category_id: 4 },
    { product_id: 3, category_id: 5 },
    { product_id: 4, category_id: 2 },
    { product_id: 4, category_id: 5 },
    { product_id: 5, category_id: 4 },
    { product_id: 5, category_id: 5 },
    { product_id: 6, category_id: 1 },
    { product_id: 6, category_id: 5 }
  ]);

  console.log('Product seed data inserted successfully!');
}
