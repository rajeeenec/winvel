import { db } from '../../config/database.js';

export async function findAll({ role } = {}) {
  const query = db('users as u')
    .select('u.id', 'u.email', 'u.first_name', 'u.last_name', 'r.name as role', 'u.phone', 'u.status', 'u.created_at')
    .join('roles as r', 'u.role_id', 'r.id');

  if (role) {
    query.where('r.name', role);
  }

  const rows = await query.orderBy('u.created_at', 'desc');
  for (const row of rows) {
    row.is_active = row.status === 'active';
  }
  return rows;
}

export async function findById(id) {
  const row = await db('users as u')
    .select('u.id', 'u.email', 'u.first_name', 'u.last_name', 'r.name as role', 'u.phone', 'u.status', 'u.created_at')
    .join('roles as r', 'u.role_id', 'r.id')
    .where('u.id', id)
    .first();

  if (row) {
    row.is_active = row.status === 'active';
  }
  return row || null;
}

export async function updateStatus(id, isActive) {
  const status = isActive ? 'active' : 'blocked';
  await db('users')
    .where({ id })
    .update({ status: status });
  return findById(id);
}


