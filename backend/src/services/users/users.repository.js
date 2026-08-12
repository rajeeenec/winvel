import { db } from '../../config/database.js';

export async function findAll({ role } = {}) {
  const query = db('users')
    .select('id', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'created_at');

  if (role) {
    query.where({ role });
  }

  return await query.orderBy('created_at', 'desc');
}

export async function findById(id) {
  const row = await db('users')
    .select('id', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'created_at')
    .where({ id })
    .first();
  return row || null;
}

export async function updateStatus(id, isActive) {
  await db('users')
    .where({ id })
    .update({ is_active: isActive });
  return findById(id);
}


