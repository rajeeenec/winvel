import { db } from '../../config/database.js';

let googleIdChecked = false;
async function ensureUsersGoogleIdColumn() {
  if (googleIdChecked) return;
  const hasColumn = await db.schema.hasColumn('users', 'google_id');
  if (!hasColumn) {
    await db.schema.table('users', (table) => {
      table.string('google_id', 255).nullable();
    });
  }
  googleIdChecked = true;
}

export async function findUserByEmailOrPhone(identifier) {
  await ensureUsersGoogleIdColumn();
  if (!identifier) return null;
  const clean = identifier.trim();
  const row = await db('users as u')
    .select('u.id', 'u.email', 'u.phone', 'u.password_hash', 'u.first_name', 'u.last_name', 'r.name as role', 'u.status')
    .join('roles as r', 'u.role_id', 'r.id')
    .where('u.email', clean)
    .orWhere('u.phone', clean)
    .first();

  if (row) {
    row.name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
    row.is_active = row.status === 'active';
  }
  return row || null;
}

export async function findUserByEmail(email) {
  return findUserByEmailOrPhone(email);
}

export async function findUserByGoogleId(googleId) {
  await ensureUsersGoogleIdColumn();
  if (!googleId) return null;
  const row = await db('users as u')
    .select('u.id', 'u.email', 'u.password_hash', 'u.first_name', 'u.last_name', 'r.name as role', 'u.status', 'u.google_id')
    .join('roles as r', 'u.role_id', 'r.id')
    .where({ 'u.google_id': googleId })
    .first();

  if (row) {
    row.name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
    row.is_active = row.status === 'active';
  }
  return row || null;
}

export async function findUserById(id) {
  await ensureUsersGoogleIdColumn();
  const row = await db('users as u')
    .select('u.id', 'u.email', 'u.first_name', 'u.last_name', 'r.name as role', 'u.phone', 'u.status', 'u.created_at', 'u.google_id')
    .join('roles as r', 'u.role_id', 'r.id')
    .where({ 'u.id': id })
    .first();

  if (row) {
    row.name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
    row.is_active = row.status === 'active';
  }
  return row || null;
}

export async function createUser({ email, passwordHash, name, firstName, lastName, phone, googleId, role = 'customer' }) {
  await ensureUsersGoogleIdColumn();
  const roleId = role === 'admin' ? 2 : 1;
  const finalFirstName = firstName || name || email.split('@')[0];
  const [insertId] = await db('users').insert({
    email,
    password_hash: passwordHash || null,
    first_name: finalFirstName,
    last_name: lastName || null,
    phone: phone || null,
    google_id: googleId || null,
    role_id: roleId,
    status: 'active',
  });
  return findUserById(insertId);
}

export async function updateUser(id, { name, firstName, lastName, email, phone }) {
  await ensureUsersGoogleIdColumn();
  const payload = {};
  if (name !== undefined || firstName !== undefined) {
    payload.first_name = (name || `${firstName || ''} ${lastName || ''}`).trim();
    payload.last_name = null;
  }
  if (email !== undefined && email) {
    payload.email = email.toLowerCase().trim();
  }
  if (phone !== undefined) {
    payload.phone = phone ? phone.trim() : null;
  }

  if (Object.keys(payload).length > 0) {
    await db('users').where({ id }).update(payload);
  }
  return findUserById(id);
}
