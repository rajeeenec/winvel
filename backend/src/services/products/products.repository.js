import { db } from '../../config/database.js';
import { resolveFileUrl } from '../../utils/fileResolver.js';

let skuColumnChecked = false;
async function ensureProductsSkuColumn() {
  if (skuColumnChecked) return;
  const hasSku = await db.schema.hasColumn('products', 'sku');
  if (!hasSku) {
    await db.schema.table('products', (table) => {
      table.string('sku', 100).nullable();
    });
  }
  skuColumnChecked = true;
}

export async function findAll({ categoryId, featured, activeOnly = true } = {}) {
  await ensureProductsSkuColumn();

  const query = db('products as p')
    .select(
      'p.*',
      'c.name as category_name',
      'c.id as category_id',
      'pi.image_url'
    )
    .leftJoin('product_categories as pc', 'p.id', 'pc.product_id')
    .leftJoin('categories as c', 'pc.category_id', 'c.id')
    .leftJoin('product_images as pi', function() {
      this.on('p.id', '=', 'pi.product_id').andOn('pi.is_primary', '=', db.raw('?', [true]));
    });

  if (activeOnly) {
    query.where('p.status', 'active');
  }
  if (categoryId) {
    query.where('pc.category_id', categoryId);
  }
  if (featured) {
    query.where('p.featured', true);
  }

  const rows = await query.orderBy('p.created_at', 'desc');

  const productMap = new Map();
  for (const row of rows) {
    if (!productMap.has(row.id)) {
      const finalImage = row.image_url || row.image_url_legacy;
      row.image_url = await resolveFileUrl(finalImage);
      row.is_active = row.status === 'active';
      row.is_featured = row.featured === 1 || row.featured === true;
      row.price = row.base_price;
      row.sku = row.sku || `SKU-${row.id}`;
      productMap.set(row.id, row);
    }
  }

  return Array.from(productMap.values());
}

export async function findById(id) {
  await ensureProductsSkuColumn();
  const row = await db('products as p')
    .select(
      'p.*',
      'c.name as category_name',
      'c.id as category_id',
      'pi.image_url'
    )
    .leftJoin('product_categories as pc', 'p.id', 'pc.product_id')
    .leftJoin('categories as c', 'pc.category_id', 'c.id')
    .leftJoin('product_images as pi', function() {
      this.on('p.id', '=', 'pi.product_id').andOn('pi.is_primary', '=', db.raw('?', [true]));
    })
    .where('p.id', id)
    .first();

  if (row) {
    const finalImage = row.image_url || row.image_url_legacy;
    row.image_url = await resolveFileUrl(finalImage);
    row.is_active = row.status === 'active';
    row.is_featured = row.featured === 1 || row.featured === true;
    row.price = row.base_price;
    row.sku = row.sku || `SKU-${row.id}`;
  }
  return row || null;
}

export async function findVariantsByProductId(productId) {
  const rows = await db('product_variants as pv')
    .select('pv.*', 's.name as size', 'c.name as color')
    .leftJoin('sizes as s', 'pv.size_id', 's.id')
    .leftJoin('colors as c', 'pv.color_id', 'c.id')
    .where('pv.product_id', productId)
    .orderBy(['s.sort_order', 'c.sort_order']);
  return rows;
}

export async function create(product) {
  await ensureProductsSkuColumn();
  const skuCode = product.sku ? product.sku.trim().toUpperCase() : null;

  const [insertId] = await db('products').insert({
    name: product.name,
    slug: product.slug,
    sku: skuCode,
    short_description: product.short_description || product.shortDescription || null,
    description: product.description || null,
    base_price: product.base_price ?? product.price ?? 0,
    brand: product.brand || 'WINVEL',
    status: product.status || ((product.isActive ?? true) ? 'active' : 'inactive'),
    featured: product.featured ?? product.isFeatured ?? false,
    is_new: product.is_new ?? product.isNew ?? true,
  });

  if (product.categoryId) {
    await db('product_categories').insert({
      product_id: insertId,
      category_id: product.categoryId
    });
  }

  // Seed primary product image if URL is supplied
  if (product.imageUrl || product.image_url) {
    await db('product_images').insert({
      product_id: insertId,
      image_url: product.imageUrl || product.image_url,
      is_primary: true
    });
  }

  return findById(insertId);
}

export async function update(id, product) {
  await ensureProductsSkuColumn();
  const updatePayload = {};
  if (product.name !== undefined) updatePayload.name = product.name;
  if (product.slug !== undefined) updatePayload.slug = product.slug;
  if (product.sku !== undefined) updatePayload.sku = product.sku ? product.sku.trim().toUpperCase() : null;
  if (product.short_description !== undefined || product.shortDescription !== undefined) {
    updatePayload.short_description = product.short_description ?? product.shortDescription;
  }
  if (product.description !== undefined) updatePayload.description = product.description;
  if (product.base_price !== undefined || product.price !== undefined) {
    updatePayload.base_price = product.base_price ?? product.price;
  }
  if (product.brand !== undefined) updatePayload.brand = product.brand;
  if (product.status !== undefined) {
    updatePayload.status = product.status;
  } else if (product.isActive !== undefined) {
    updatePayload.status = product.isActive ? 'active' : 'inactive';
  }
  if (product.featured !== undefined) updatePayload.featured = product.featured;
  if (product.is_new !== undefined) updatePayload.is_new = product.is_new;

  if (Object.keys(updatePayload).length > 0) {
    await db('products').where({ id }).update(updatePayload);
  }

  if (product.categoryId) {
    await db('product_categories').where({ product_id: id }).delete();
    await db('product_categories').insert({
      product_id: id,
      category_id: product.categoryId
    });
  }

  if (product.imageUrl || product.image_url) {
    await db('product_images').where({ product_id: id, is_primary: true }).delete();
    await db('product_images').insert({
      product_id: id,
      image_url: product.imageUrl || product.image_url,
      is_primary: true
    });
  }

  return findById(id);
}

export async function remove(id) {
  await db('products')
    .where({ id })
    .update({ status: 'archived' });
}
