import { db } from '../../config/database.js';
import { resolveFileUrl } from '../../utils/fileResolver.js';

export async function findAll({ userId, status } = {}) {
  const query = db('orders as o')
    .select('o.*', 'o.order_status as status', 'u.email', 'u.first_name', 'u.last_name')
    .join('users as u', 'o.user_id', 'u.id');

  if (userId) {
    query.where('o.user_id', userId);
  }
  if (status) {
    query.where('o.order_status', status);
  }

  return await query.orderBy('o.created_at', 'desc');
}

export async function findById(id) {
  const row = await db('orders as o')
    .select('o.*', 'o.order_status as status', 'u.email', 'u.first_name', 'u.last_name')
    .join('users as u', 'o.user_id', 'u.id')
    .where('o.id', id)
    .first();
  return row || null;
}

export async function findItemsByOrderId(orderId) {
  const rows = await db('order_items')
    .select('*', 'size_name as size', 'color_name as color')
    .where({ order_id: orderId });
    
  for (const row of rows) {
    row.image_url = await resolveFileUrl(row.image_url);
  }
  return rows;
}

export async function updateStatus(id, status) {
  await db('orders')
    .where({ id })
    .update({ order_status: status });
  return findById(id);
}
