import { db } from '../../config/database.js';
import { resolveFileUrl } from '../../utils/fileResolver.js';

let schemaColumnsChecked = false;
async function ensureProductsColumns() {
  if (schemaColumnsChecked) return;
  const hasSku = await db.schema.hasColumn('products', 'sku');
  if (!hasSku) {
    await db.schema.table('products', (table) => {
      table.string('sku', 100).nullable();
    });
  }
  const hasSizeChart = await db.schema.hasColumn('products', 'size_chart_url');
  if (!hasSizeChart) {
    await db.schema.table('products', (table) => {
      table.text('size_chart_url').nullable();
    });
  }
  const hasFittingOpts = await db.schema.hasColumn('products', 'fitting_options');
  if (!hasFittingOpts) {
    await db.schema.table('products', (table) => {
      table.string('fitting_options', 255).nullable();
    });
  }
  schemaColumnsChecked = true;
}

async function syncProductVariants(productId, sizesArray, basePrice = 0, productSku = 'SKU') {
  if (!Array.isArray(sizesArray) || sizesArray.length === 0) return;

  const existingSizes = await db('sizes').select('id', 'name');
  const sizeMap = new Map(existingSizes.map((s) => [s.name.toUpperCase(), s.id]));

  const validSizeIds = [];
  for (let i = 0; i < sizesArray.length; i++) {
    const sizeName = String(sizesArray[i]).trim().toUpperCase();
    if (!sizeName) continue;

    let sizeId = sizeMap.get(sizeName);
    if (!sizeId) {
      const [newSizeId] = await db('sizes').insert({
        name: sizeName,
        sort_order: i + 1,
        status: true,
      });
      sizeId = newSizeId;
      sizeMap.set(sizeName, sizeId);
    }
    validSizeIds.push(sizeId);

    const existingVar = await db('product_variants')
      .where({ product_id: productId, size_id: sizeId })
      .first();

    if (!existingVar) {
      const variantSku = `${productSku || 'SKU-' + productId}-${sizeName}`;
      await db('product_variants').insert({
        product_id: productId,
        size_id: sizeId,
        color_id: null,
        sku: variantSku,
        price: basePrice || 0,
        stock_quantity: 50,
        status: true,
      });
    }
  }

  // Optionally remove variants for sizes unselected by admin
  if (validSizeIds.length > 0) {
    await db('product_variants')
      .where({ product_id: productId })
      .whereNotIn('size_id', validSizeIds)
      .delete();
  }
}

export async function findAll({ categoryId, featured, activeOnly = true } = {}) {
  await ensureProductsColumns();

  const query = db('products as p')
    .select(
      'p.*',
      'c.name as category_name',
      'c.id as category_id',
      'c.has_fitting as category_has_fitting',
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
      row.size_chart_url = await resolveFileUrl(row.size_chart_url);
      row.is_active = row.status === 'active';
      row.is_featured = row.featured === 1 || row.featured === true;
      row.price = row.base_price;
      row.sku = row.sku || `SKU-${row.id}`;

      const catHasFitting = row.category_has_fitting !== undefined && row.category_has_fitting !== null
        ? Boolean(row.category_has_fitting)
        : true;
      row.has_fitting = catHasFitting;
      if (!catHasFitting || !row.fitting_options) {
        row.fitting_options = [];
      } else {
        row.fitting_options = typeof row.fitting_options === 'string'
          ? row.fitting_options.split(',').map((s) => s.trim()).filter(Boolean)
          : row.fitting_options;
      }

      productMap.set(row.id, row);
    }
  }

  const products = Array.from(productMap.values());
  for (const p of products) {
    p.variants = await findVariantsByProductId(p.id);
    p.sizes = Array.from(new Set(p.variants.map((v) => v.size).filter(Boolean)));
  }

  return products;
}

export async function findById(id) {
  await ensureProductsColumns();
  const row = await db('products as p')
    .select(
      'p.*',
      'c.name as category_name',
      'c.id as category_id',
      'c.has_fitting as category_has_fitting',
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
    row.size_chart_url = await resolveFileUrl(row.size_chart_url);
    row.is_active = row.status === 'active';
    row.is_featured = row.featured === 1 || row.featured === true;
    row.price = row.base_price;
    row.sku = row.sku || `SKU-${row.id}`;

    const catHasFitting = row.category_has_fitting !== undefined && row.category_has_fitting !== null
      ? Boolean(row.category_has_fitting)
      : true;
    row.has_fitting = catHasFitting;
    if (!catHasFitting || !row.fitting_options) {
      row.fitting_options = [];
    } else {
      row.fitting_options = typeof row.fitting_options === 'string'
        ? row.fitting_options.split(',').map((s) => s.trim()).filter(Boolean)
        : row.fitting_options;
    }

    const variants = await findVariantsByProductId(id);
    row.variants = variants;
    row.sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
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
  await ensureProductsColumns();
  const skuCode = product.sku ? product.sku.trim().toUpperCase() : null;

  const rawFitting = product.fitting_options || product.fittingOptions;
  const fittingOptsStr = Array.isArray(rawFitting) ? rawFitting.join(',') : (rawFitting || null);

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
    size_chart_url: product.size_chart_url || product.sizeChartUrl || null,
    fitting_options: fittingOptsStr,
  });

  if (product.categoryId) {
    await db('product_categories').insert({
      product_id: insertId,
      category_id: product.categoryId,
    });
  }

  if (product.imageUrl || product.image_url) {
    await db('product_images').insert({
      product_id: insertId,
      image_url: product.imageUrl || product.image_url,
      is_primary: true,
    });
  }

  if (product.sizes) {
    await syncProductVariants(insertId, product.sizes, product.base_price || product.price, skuCode);
  }

  return findById(insertId);
}

export async function update(id, product) {
  await ensureProductsColumns();
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
  if (product.size_chart_url !== undefined || product.sizeChartUrl !== undefined) {
    updatePayload.size_chart_url = product.size_chart_url ?? product.sizeChartUrl ?? null;
  }

  const rawFitting = product.fitting_options !== undefined ? product.fitting_options : product.fittingOptions;
  if (rawFitting !== undefined) {
    updatePayload.fitting_options = Array.isArray(rawFitting) ? rawFitting.join(',') : (rawFitting || null);
  }

  if (Object.keys(updatePayload).length > 0) {
    await db('products').where({ id }).update(updatePayload);
  }

  if (product.categoryId) {
    await db('product_categories').where({ product_id: id }).delete();
    await db('product_categories').insert({
      product_id: id,
      category_id: product.categoryId,
    });
  }

  if (product.imageUrl || product.image_url) {
    await db('product_images').where({ product_id: id, is_primary: true }).delete();
    await db('product_images').insert({
      product_id: id,
      image_url: product.imageUrl || product.image_url,
      is_primary: true,
    });
  }

  if (product.sizes) {
    const skuCode = updatePayload.sku || product.sku || `SKU-${id}`;
    const basePrice = updatePayload.base_price || product.base_price || 0;
    await syncProductVariants(id, product.sizes, basePrice, skuCode);
  }

  return findById(id);
}

export async function remove(id) {
  await db('products')
    .where({ id })
    .update({ status: 'archived' });
}
