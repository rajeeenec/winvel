import { db } from '../../config/database.js';

let tableChecked = false;
async function ensureVendorsTable() {
  if (tableChecked) return;
  const hasTable = await db.schema.hasTable('vendors');
  if (!hasTable) {
    await db.schema.createTable('vendors', (table) => {
      table.bigIncrements('id').primary();
      table.string('name', 150).notNullable();
      table.string('contact_person', 100).nullable();
      table.string('email', 255).notNullable().unique();
      table.string('phone', 20).nullable().unique();
      table.string('gstin', 50).nullable();
      table.text('address').nullable();
      table.enum('status', ['active', 'inactive', 'blocked']).notNullable().defaultTo('active');
      table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(db.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
  }
  tableChecked = true;
}

export async function findAll() {
  await ensureVendorsTable();
  const rows = await db('vendors').select('*').orderBy('created_at', 'desc');
  for (const row of rows) {
    row.is_active = row.status === 'active';
  }
  return rows;
}

export async function findById(id) {
  await ensureVendorsTable();
  const row = await db('vendors').where({ id }).first();
  if (row) {
    row.is_active = row.status === 'active';
  }
  return row || null;
}

export async function findByEmail(email, excludeId = null) {
  await ensureVendorsTable();
  const query = db('vendors').where({ email: email.toLowerCase().trim() });
  if (excludeId) {
    query.whereNot({ id: excludeId });
  }
  return query.first();
}

export async function findByPhone(phone, excludeId = null) {
  await ensureVendorsTable();
  if (!phone || !phone.trim()) return null;
  const cleanPhone = phone.trim();
  const query = db('vendors').where({ phone: cleanPhone });
  if (excludeId) {
    query.whereNot({ id: excludeId });
  }
  return query.first();
}

export async function create({ name, contactPerson, email, phone, gstin, address }) {
  await ensureVendorsTable();
  const [insertId] = await db('vendors').insert({
    name: name.trim(),
    contact_person: contactPerson ? contactPerson.trim() : null,
    email: email.toLowerCase().trim(),
    phone: phone ? phone.trim() : null,
    gstin: gstin ? gstin.trim() : null,
    address: address ? address.trim() : null,
    status: 'active',
  });
  return findById(insertId);
}

export async function update(id, { name, contactPerson, email, phone, gstin, address }) {
  await ensureVendorsTable();
  const payload = {};
  if (name !== undefined) payload.name = name.trim();
  if (contactPerson !== undefined) payload.contact_person = contactPerson ? contactPerson.trim() : null;
  if (email !== undefined) payload.email = email.toLowerCase().trim();
  if (phone !== undefined) payload.phone = phone ? phone.trim() : null;
  if (gstin !== undefined) payload.gstin = gstin ? gstin.trim() : null;
  if (address !== undefined) payload.address = address ? address.trim() : null;

  if (Object.keys(payload).length > 0) {
    await db('vendors').where({ id }).update(payload);
  }
  return findById(id);
}

export async function updateStatus(id, isActive) {
  await ensureVendorsTable();
  const status = isActive ? 'active' : 'blocked';
  await db('vendors').where({ id }).update({ status });
  return findById(id);
}
