import { getPool } from '../../config/database.js';

export async function findUserByEmail(email) {
  const [rows] = await getPool().execute(
    'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await getPool().execute(
    'SELECT id, email, first_name, last_name, role, phone, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

export async function createUser({ email, passwordHash, firstName, lastName, role = 'customer' }) {
  const [result] = await getPool().execute(
    'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
    [email, passwordHash, firstName, lastName, role]
  );
  return findUserById(result.insertId);
}
