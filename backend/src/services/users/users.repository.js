import { db } from '../../config/database.js';

export async function findAll({ role, type } = {}) {
  const query = db('users as u')
    .select(
      'u.id',
      'u.email',
      'u.first_name',
      'u.last_name',
      'r.name as role',
      'u.role_id',
      'u.phone',
      'u.status',
      'u.created_at',
      db.raw('COUNT(DISTINCT o.id) as order_count'),
      db.raw('COALESCE(SUM(o.total_amount), 0) as total_spent')
    )
    .join('roles as r', 'u.role_id', 'r.id')
    .leftJoin('orders as o', 'u.id', 'o.user_id')
    .groupBy('u.id', 'u.email', 'u.first_name', 'u.last_name', 'r.name', 'u.role_id', 'u.phone', 'u.status', 'u.created_at');

  if (role) {
    query.where('r.name', role);
  }

  if (type === 'staff') {
    query.whereNot('r.name', 'Customer');
  } else if (type === 'customer') {
    query.where('r.name', 'Customer');
  }

  const rows = await query.orderBy('u.created_at', 'desc');
  for (const row of rows) {
    row.name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
    row.is_active = row.status === 'active';
    row.total_spent = parseFloat(row.total_spent) || 0;
    row.order_count = parseInt(row.order_count) || 0;
  }
  return rows;
}

export async function findById(id) {
  const row = await db('users as u')
    .select(
      'u.id',
      'u.email',
      'u.first_name',
      'u.last_name',
      'r.name as role',
      'u.role_id',
      'u.phone',
      'u.status',
      'u.created_at',
      db.raw('COUNT(DISTINCT o.id) as order_count'),
      db.raw('COALESCE(SUM(o.total_amount), 0) as total_spent')
    )
    .join('roles as r', 'u.role_id', 'r.id')
    .leftJoin('orders as o', 'u.id', 'o.user_id')
    .where('u.id', id)
    .groupBy('u.id', 'u.email', 'u.first_name', 'u.last_name', 'r.name', 'u.role_id', 'u.phone', 'u.status', 'u.created_at')
    .first();

  if (row) {
    row.name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
    row.is_active = row.status === 'active';
    row.total_spent = parseFloat(row.total_spent) || 0;
    row.order_count = parseInt(row.order_count) || 0;
  }
  return row || null;
}

export async function findByEmail(email, excludeId = null) {
  const query = db('users').where({ email: email.toLowerCase().trim() });
  if (excludeId) {
    query.whereNot({ id: excludeId });
  }
  return query.first();
}

export async function findByPhone(phone, excludeId = null) {
  if (!phone || !phone.trim()) return null;
  const cleanPhone = phone.trim();
  const query = db('users').where({ phone: cleanPhone });
  if (excludeId) {
    query.whereNot({ id: excludeId });
  }
  return query.first();
}

export async function createUser({ email, passwordHash, name, firstName, lastName, phone, roleId = 2 }) {
  const finalName = (name || `${firstName || ''} ${lastName || ''}`).trim();
  const [insertId] = await db('users').insert({
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    first_name: finalName,
    last_name: null,
    phone: phone ? phone.trim() : null,
    role_id: roleId,
    status: 'active',
  });
  return findById(insertId);
}

export async function updateUser(id, { name, firstName, lastName, phone, roleId }) {
  const payload = {};
  if (name !== undefined || firstName !== undefined) {
    payload.first_name = (name || `${firstName || ''} ${lastName || ''}`).trim();
    payload.last_name = null;
  }
  if (phone !== undefined) payload.phone = phone ? phone.trim() : null;
  if (roleId !== undefined) payload.role_id = roleId;

  if (Object.keys(payload).length > 0) {
    await db('users').where({ id }).update(payload);
  }
  return findById(id);
}

export async function updateStatus(id, isActive) {
  const status = isActive ? 'active' : 'blocked';
  await db('users')
    .where({ id })
    .update({ status: status });
  return findById(id);
}
