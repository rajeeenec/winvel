import { getPool } from '../../config/database.js';

export async function findAll({ role } = {}) {
  let query = 'SELECT id, email, first_name, last_name, role, phone, is_active, created_at FROM users WHERE 1=1';
  const params = [];

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  query += ' ORDER BY created_at DESC';
  const [rows] = await getPool().execute(query, params);
  return rows;
}

export async function findById(id) {
  const [rows] = await getPool().execute(
    'SELECT id, email, first_name, last_name, role, phone, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

export async function updateStatus(id, isActive) {
  await getPool().execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
  return findById(id);
}
