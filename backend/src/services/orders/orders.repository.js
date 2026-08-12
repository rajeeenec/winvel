import { db } from '../../config/database.js';

export async function findAll({ userId, status } = {}) {
  const query = db('orders as o')
    .select('o.*', 'u.email', 'u.first_name', 'u.last_name')
    .join('users as u', 'o.user_id', 'u.id');

  if (userId) {
    query.where('o.user_id', userId);
  }
  if (status) {
    query.where('o.status', status);
  }

  return await query.orderBy('o.created_at', 'desc');
}

export async function findById(id) {
  const row = await db('orders as o')
    .select('o.*', 'u.email', 'u.first_name', 'u.last_name')
    .join('users as u', 'o.user_id', 'u.id')
    .where('o.id', id)
    .first();
  return row || null;
}

export async function findItemsByOrderId(orderId) {
  return await db('order_items as oi')
    .select('oi.*', 'pv.size', 'pv.color', 'p.name as product_name', 'p.image_url')
    .join('product_variants as pv', 'oi.product_variant_id', 'pv.id')
    .join('products as p', 'pv.product_id', 'p.id')
    .where('oi.order_id', orderId);
}

export async function updateStatus(id, status) {
  await db('orders')
    .where({ id })
    .update({ status });
  return findById(id);
}


