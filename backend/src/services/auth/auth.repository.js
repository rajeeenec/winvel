import { db } from '../../config/database.js';

export async function findUserByEmail(email) {
  const row = await db('users as u')
    .select('u.id', 'u.email', 'u.password_hash', 'u.first_name', 'u.last_name', 'r.name as role', 'u.status')
    .join('roles as r', 'u.role_id', 'r.id')
    .where({ 'u.email': email })
    .first();
  
  if (row) {
    row.is_active = row.status === 'active';
  }
  return row || null;
}

export async function findUserById(id) {
  const row = await db('users as u')
    .select('u.id', 'u.email', 'u.first_name', 'u.last_name', 'r.name as role', 'u.phone', 'u.status', 'u.created_at')
    .join('roles as r', 'u.role_id', 'r.id')
    .where({ 'u.id': id })
    .first();

  if (row) {
    row.is_active = row.status === 'active';
  }
  return row || null;
}

export async function createUser({ email, passwordHash, firstName, lastName, phone, role = 'customer' }) {
  const roleId = role === 'admin' ? 2 : 1;
  const [insertId] = await db('users').insert({
    email,
    password_hash: passwordHash,
    first_name: firstName,
    last_name: lastName,
    phone,
    role_id: roleId,
    status: 'active'
  });
  return findUserById(insertId);
}


