import { db } from '../../config/database.js';

export async function findAll(activeOnly = true) {
  const query = db('categories');
  if (activeOnly) {
    query.where('status', true);
  }
  return await query.orderBy('name');
}

export async function findById(id) {
  const row = await db('categories').where({ id }).first();
  if (row) {
    row.is_active = row.status === 1 || row.status === true;
  }
  return row || null;
}

export async function create({ name, slug, description }) {
  const [insertId] = await db('categories').insert({
    name,
    slug,
    description,
  });
  return findById(insertId);
}


