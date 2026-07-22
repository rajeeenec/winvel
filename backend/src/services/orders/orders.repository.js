import { getPool } from '../../config/database.js';

export async function findAll({ userId, status } = {}) {
  let query = `
    SELECT o.*, u.email, u.first_name, u.last_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (userId) {
    query += ' AND o.user_id = ?';
    params.push(userId);
  }
  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.created_at DESC';
  const [rows] = await getPool().execute(query, params);
  return rows;
}

export async function findById(id) {
  const [rows] = await getPool().execute(
    `SELECT o.*, u.email, u.first_name, u.last_name
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function findItemsByOrderId(orderId) {
  const [rows] = await getPool().execute(
    `SELECT oi.*, pv.size, pv.color, p.name AS product_name, p.image_url
     FROM order_items oi
     JOIN product_variants pv ON oi.product_variant_id = pv.id
     JOIN products p ON pv.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows;
}

export async function updateStatus(id, status) {
  await getPool().execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
}
