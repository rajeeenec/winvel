import { db } from '../../config/database.js';

let schemaColumnsChecked = false;
async function ensureCategoriesColumns() {
  if (schemaColumnsChecked) return;
  const hasFittingCol = await db.schema.hasColumn('categories', 'has_fitting');
  if (!hasFittingCol) {
    await db.schema.table('categories', (table) => {
      table.boolean('has_fitting').defaultTo(true);
    });
  }
  schemaColumnsChecked = true;
}

export async function findAll(activeOnly = true) {
  await ensureCategoriesColumns();
  const query = db('categories');
  if (activeOnly) {
    query.where('status', true);
  }
  const rows = await query.orderBy('name');
  return rows.map((row) => ({
    ...row,
    is_active: row.status === 1 || row.status === true,
    has_fitting: row.has_fitting !== undefined && row.has_fitting !== null ? Boolean(row.has_fitting) : true,
  }));
}

export async function findById(id) {
  await ensureCategoriesColumns();
  const row = await db('categories').where({ id }).first();
  if (row) {
    row.is_active = row.status === 1 || row.status === true;
    row.has_fitting = row.has_fitting !== undefined && row.has_fitting !== null ? Boolean(row.has_fitting) : true;
  }
  return row || null;
}

export async function create({ name, slug, description, sort_order, status, has_fitting }) {
  await ensureCategoriesColumns();
  const [insertId] = await db('categories').insert({
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    description: description || null,
    sort_order: sort_order || 0,
    status: status !== undefined ? status : true,
    has_fitting: has_fitting !== undefined ? Boolean(has_fitting) : true,
  });
  return findById(insertId);
}

export async function update(id, { name, slug, description, sort_order, status, has_fitting }) {
  await ensureCategoriesColumns();
  const updatePayload = {};
  if (name !== undefined) updatePayload.name = name;
  if (slug !== undefined) updatePayload.slug = slug;
  if (description !== undefined) updatePayload.description = description;
  if (sort_order !== undefined) updatePayload.sort_order = sort_order;
  if (status !== undefined) updatePayload.status = status;
  if (has_fitting !== undefined) updatePayload.has_fitting = Boolean(has_fitting);

  if (Object.keys(updatePayload).length > 0) {
    await db('categories').where({ id }).update(updatePayload);
  }
  return findById(id);
}

export async function remove(id) {
  await db('categories').where({ id }).delete();
}
