import { getPool } from '../../config/database.js';

export async function findAll({ categoryId, featured, activeOnly = true } = {}) {
  let query = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (activeOnly) {
    query += ' AND p.is_active = TRUE';
  }
  if (categoryId) {
    query += ' AND p.category_id = ?';
    params.push(categoryId);
  }
  if (featured) {
    query += ' AND p.is_featured = TRUE';
  }

  query += ' ORDER BY p.created_at DESC';
  const [rows] = await getPool().execute(query, params);
  return rows;
}

export async function findById(id) {
  const [rows] = await getPool().execute(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function findVariantsByProductId(productId) {
  const [rows] = await getPool().execute(
    'SELECT * FROM product_variants WHERE product_id = ? ORDER BY size, color',
    [productId]
  );
  return rows;
}

export async function create(product) {
  const [result] = await getPool().execute(
    `INSERT INTO products (category_id, name, slug, description, price, compare_price, sku, image_url, is_active, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.categoryId,
      product.name,
      product.slug,
      product.description,
      product.price,
      product.comparePrice || null,
      product.sku,
      product.imageUrl || null,
      product.isActive ?? true,
      product.isFeatured ?? false,
    ]
  );
  return findById(result.insertId);
}

export async function update(id, product) {
  await getPool().execute(
    `UPDATE products SET
      category_id = ?, name = ?, slug = ?, description = ?, price = ?,
      compare_price = ?, sku = ?, image_url = ?, is_active = ?, is_featured = ?
     WHERE id = ?`,
    [
      product.categoryId,
      product.name,
      product.slug,
      product.description,
      product.price,
      product.comparePrice || null,
      product.sku,
      product.imageUrl || null,
      product.isActive ?? true,
      product.isFeatured ?? false,
      id,
    ]
  );
  return findById(id);
}

export async function remove(id) {
  await getPool().execute('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);
}
