import { db } from '../../config/database.js';

export async function findAll({ publicOnly = false } = {}) {
  let query = db('banners').orderBy('sort_order', 'asc').orderBy('id', 'desc');
  if (publicOnly) {
    query = query.where('status', 1);
  }
  const rows = await query;
  return rows.map((r) => ({
    id: r.id,
    title: r.title || '',
    subtitle: r.subtitle || '',
    badge: r.position || r.badge || 'COLLECTION',
    image_url: r.image_url || '',
    button_text: r.button_text || 'SHOP NOW',
    button_url: r.button_url || '/shop',
    sort_order: r.sort_order || 0,
    status: Boolean(r.status),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function findById(id) {
  const row = await db('banners').where({ id }).first();
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || '',
    subtitle: row.subtitle || '',
    badge: row.position || row.badge || 'COLLECTION',
    image_url: row.image_url || '',
    button_text: row.button_text || 'SHOP NOW',
    button_url: row.button_url || '/shop',
    sort_order: row.sort_order || 0,
    status: Boolean(row.status),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function create(data) {
  const [id] = await db('banners').insert({
    title: data.title || 'NEW COLLECTION',
    subtitle: data.subtitle || 'Premium quality fashion for everyday style.',
    position: data.badge || 'NEW COLLECTION',
    image_url: data.image_url || '/images/hero_slide_1.png',
    button_text: data.button_text || 'SHOP NOW',
    button_url: data.button_url || '/shop',
    sort_order: data.sort_order ?? 0,
    status: data.status !== undefined ? (data.status ? 1 : 0) : 1,
  });
  return findById(id);
}

export async function update(id, data) {
  const payload = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.subtitle !== undefined) payload.subtitle = data.subtitle;
  if (data.badge !== undefined) payload.position = data.badge;
  if (data.position !== undefined) payload.position = data.position;
  if (data.image_url !== undefined) payload.image_url = data.image_url;
  if (data.button_text !== undefined) payload.button_text = data.button_text;
  if (data.button_url !== undefined) payload.button_url = data.button_url;
  if (data.sort_order !== undefined) payload.sort_order = data.sort_order;
  if (data.status !== undefined) payload.status = data.status ? 1 : 0;

  await db('banners').where({ id }).update(payload);
  return findById(id);
}

export async function remove(id) {
  return db('banners').where({ id }).del();
}
