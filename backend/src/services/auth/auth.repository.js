import { db } from '../../config/database.js';

export async function findUserByEmail(email) {
  const row = await db('users')
    .select('id', 'email', 'password_hash', 'first_name', 'last_name', 'role', 'is_active')
    .where({ email })
    .first();
  return row || null;
}

export async function findUserById(id) {
  const row = await db('users')
    .select('id', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'created_at')
    .where({ id })
    .first();
  return row || null;
}

export async function createUser({ email, passwordHash, firstName, lastName, role = 'customer' }) {
  const [insertId] = await db('users').insert({
    email,
    password_hash: passwordHash,
    first_name: firstName,
    last_name: lastName,
    role,
  });
  return findUserById(insertId);
}


