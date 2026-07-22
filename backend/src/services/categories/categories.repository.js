import { getPool } from '../../config/database.js';

export async function findAll(activeOnly = true) {
  let query = 'SELECT * FROM categories';
  if (activeOnly) query += ' WHERE is_active = TRUE';
  query += ' ORDER BY name';
  const [rows] = await getPool().execute(query);
  return rows;
}

export async function findById(id) {
  const [rows] = await getPool().execute('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function create({ name, slug, description }) {
  const [result] = await getPool().execute(
    'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
    [name, slug, description]
  );
  return findById(result.insertId);
}
