import { db } from '../../config/database.js';

let tablesChecked = false;
async function ensureInventoryTables() {
  if (tablesChecked) return;

  const hasBatches = await db.schema.hasTable('inventory_batches');
  if (!hasBatches) {
    await db.schema.createTable('inventory_batches', (table) => {
      table.bigIncrements('id').primary();
      table.string('batch_number', 100).notNullable().unique();
      table.bigInteger('vendor_id').unsigned().nullable();
      table.date('received_date').notNullable();
      table.integer('total_items').notNullable().defaultTo(0);
      table.decimal('total_amount', 12, 2).notNullable().defaultTo(0.00);
      table.text('notes').nullable();
      table.enum('status', ['received', 'inspected', 'archived']).notNullable().defaultTo('received');
      table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(db.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.foreign('vendor_id').references('id').inTable('vendors').onDelete('SET NULL');
    });
  }

  const hasItems = await db.schema.hasTable('inventory_items');
  if (!hasItems) {
    await db.schema.createTable('inventory_items', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('batch_id').unsigned().notNullable();
      table.bigInteger('product_id').unsigned().notNullable();
      table.string('sku', 100).nullable();
      table.string('batch_no', 100).nullable();
      table.integer('quantity').notNullable().defaultTo(0);
      table.decimal('unit_cost', 10, 2).notNullable().defaultTo(0.00);
      table.decimal('total_cost', 12, 2).notNullable().defaultTo(0.00);
      table.timestamp('created_at').notNullable().defaultTo(db.fn.now());

      table.foreign('batch_id').references('id').inTable('inventory_batches').onDelete('CASCADE');
      table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    });
  } else {
    const hasBatchNo = await db.schema.hasColumn('inventory_items', 'batch_no');
    if (!hasBatchNo) {
      await db.schema.table('inventory_items', (table) => {
        table.string('batch_no', 100).nullable();
      });
    }
  }

  tablesChecked = true;
}

export async function findAll() {
  await ensureInventoryTables();
  const rows = await db('inventory_batches as ib')
    .select(
      'ib.*',
      'v.name as vendor_name',
      'v.email as vendor_email',
      'v.phone as vendor_phone',
      'v.gstin as vendor_gstin',
      db.raw('(SELECT COUNT(*) FROM inventory_items WHERE batch_id = ib.id) as batch_count')
    )
    .leftJoin('vendors as v', 'ib.vendor_id', 'v.id')
    .orderBy('ib.created_at', 'desc');

  for (const row of rows) {
    row.total_amount = parseFloat(row.total_amount) || 0;
    row.total_items = parseInt(row.total_items) || 0;
    row.batch_count = parseInt(row.batch_count) || 0;
  }
  return rows;
}

export async function findById(id) {
  await ensureInventoryTables();
  const batch = await db('inventory_batches as ib')
    .select(
      'ib.*',
      'v.name as vendor_name',
      'v.email as vendor_email',
      'v.phone as vendor_phone',
      'v.gstin as vendor_gstin',
      'v.contact_person as vendor_contact',
      db.raw('(SELECT COUNT(*) FROM inventory_items WHERE batch_id = ib.id) as batch_count')
    )
    .leftJoin('vendors as v', 'ib.vendor_id', 'v.id')
    .where('ib.id', id)
    .first();

  if (!batch) return null;

  batch.total_amount = parseFloat(batch.total_amount) || 0;
  batch.total_items = parseInt(batch.total_items) || 0;
  batch.batch_count = parseInt(batch.batch_count) || 0;

  const items = await db('inventory_items as ii')
    .select(
      'ii.*',
      'p.name as product_name',
      'p.base_price as selling_price',
      'c.name as category_name'
    )
    .leftJoin('products as p', 'ii.product_id', 'p.id')
    .leftJoin('product_categories as pc', 'p.id', 'pc.product_id')
    .leftJoin('categories as c', 'pc.category_id', 'c.id')
    .where('ii.batch_id', id);

  for (const item of items) {
    item.unit_cost = parseFloat(item.unit_cost) || 0;
    item.total_cost = parseFloat(item.total_cost) || 0;
    item.quantity = parseInt(item.quantity) || 0;
  }

  batch.items = items;
  return batch;
}

export async function createBatch({ vendorId, batchNumber, receivedDate, items, notes }) {
  await ensureInventoryTables();

  let totalItemsSum = 0;
  let totalAmountSum = 0;

  const processedItems = items.map((item) => {
    const qty = parseInt(item.quantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    const itemTotal = qty * cost;
    totalItemsSum += qty;
    totalAmountSum += itemTotal;

    return {
      product_id: item.productId,
      sku: item.sku ? item.sku.trim().toUpperCase() : null,
      batch_no: item.batchNo ? item.batchNo.trim().toUpperCase() : null,
      quantity: qty,
      unit_cost: cost,
      total_cost: itemTotal,
    };
  });

  const receiptCode = batchNumber || `REC-${Date.now().toString().slice(-6)}`;

  const [batchId] = await db('inventory_batches').insert({
    batch_number: receiptCode,
    vendor_id: vendorId || null,
    received_date: receivedDate || new Date().toISOString().split('T')[0],
    total_items: totalItemsSum,
    total_amount: totalAmountSum,
    notes: notes || null,
    status: 'received',
  });

  const batchItemsPayload = processedItems.map((item) => ({
    ...item,
    batch_id: batchId,
  }));

  if (batchItemsPayload.length > 0) {
    await db('inventory_items').insert(batchItemsPayload);
  }

  return findById(batchId);
}
