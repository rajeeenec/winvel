import { db } from '../../config/database.js';

export async function findAll({ categoryId, featured, activeOnly = true } = {}) {
  const query = db('products as p')
    .select('p.*', 'c.name as category_name')
    .leftJoin('categories as c', 'p.category_id', 'c.id');

  if (activeOnly) {
    query.where('p.is_active', true);
  }
  if (categoryId) {
    query.where('p.category_id', categoryId);
  }
  if (featured) {
    query.where('p.is_featured', true);
  }

  return await query.orderBy('p.created_at', 'desc');
}

export async function findById(id) {
  const row = await db('products as p')
    .select('p.*', 'c.name as category_name')
    .leftJoin('categories as c', 'p.category_id', 'c.id')
    .where('p.id', id)
    .first();
  return row || null;
}

export async function findVariantsByProductId(productId) {
  return await db('product_variants')
    .where({ product_id: productId })
    .orderBy(['size', 'color']);
}

export async function create(product) {
  const [insertId] = await db('products').insert({
    category_id: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compare_price: product.comparePrice || null,
    sku: product.sku,
    image_url: product.imageUrl || null,
    is_active: product.isActive ?? true,
    is_featured: product.isFeatured ?? false,
  });
  return findById(insertId);
}

export async function update(id, product) {
  await db('products')
    .where({ id })
    .update({
      category_id: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compare_price: product.comparePrice || null,
      sku: product.sku,
      image_url: product.imageUrl || null,
      is_active: product.isActive ?? true,
      is_featured: product.isFeatured ?? false,
    });
  return findById(id);
}

export async function remove(id) {
  await db('products')
    .where({ id })
    .update({ is_active: false });
}


