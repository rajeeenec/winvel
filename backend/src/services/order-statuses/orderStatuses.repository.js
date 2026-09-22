import { db } from '../../config/database.js';

let tableChecked = false;
async function ensureOrderStatusesTable() {
  if (tableChecked) return;
  const hasTable = await db.schema.hasTable('order_statuses');
  if (!hasTable) {
    await db.schema.createTable('order_statuses', (table) => {
      table.bigIncrements('id').primary();
      table.string('code', 50).unique().notNullable();
      table.string('name', 100).notNullable();
      table.string('customer_label_msg', 255);
      table.boolean('show_to_customer').notNullable().defaultTo(true);
      table.boolean('send_email').notNullable().defaultTo(false);
      table.string('badge_color', 20).notNullable().defaultTo('blue');
      table.integer('sort_order').notNullable().defaultTo(0);
      table.boolean('status').notNullable().defaultTo(true);
      table.timestamps(true, true);
    });

    // Seed defaults
    await db('order_statuses').insert([
      { id: 1, code: 'ORDER_PLACED', name: 'Order Placed', customer_label_msg: 'Your order has been placed successfully.', show_to_customer: true, send_email: true, badge_color: 'blue', sort_order: 1, status: true },
      { id: 2, code: 'PAYMENT_STATUS', name: 'Payment Status', customer_label_msg: 'Payment status updated for your order.', show_to_customer: true, send_email: false, badge_color: 'amber', sort_order: 2, status: true },
      { id: 3, code: 'CONFIRMED', name: 'Confirmed', customer_label_msg: 'Your order has been confirmed by the seller.', show_to_customer: true, send_email: true, badge_color: 'indigo', sort_order: 3, status: true },
      { id: 4, code: 'PACKING_IN_PROGRESS', name: 'Packing in Progress', customer_label_msg: 'Your order items are being packed with care.', show_to_customer: true, send_email: false, badge_color: 'purple', sort_order: 4, status: true },
      { id: 5, code: 'READY_FOR_PICKUP', name: 'Ready for Pickup', customer_label_msg: 'Your package is ready for courier pickup.', show_to_customer: true, send_email: false, badge_color: 'teal', sort_order: 5, status: true },
      { id: 6, code: 'OUT_FOR_DELIVERY', name: 'Out for Delivery', customer_label_msg: 'Your package is out for delivery today.', show_to_customer: true, send_email: true, badge_color: 'amber', sort_order: 6, status: true },
      { id: 7, code: 'DELIVERED', name: 'Delivered', customer_label_msg: 'Your order has been delivered successfully.', show_to_customer: true, send_email: true, badge_color: 'emerald', sort_order: 7, status: true },
      { id: 8, code: 'COMPLETED', name: 'Completed', customer_label_msg: 'Order completed. Thank you for shopping with us!', show_to_customer: true, send_email: false, badge_color: 'emerald', sort_order: 8, status: true },
      { id: 9, code: 'CANCELED', name: 'Canceled', customer_label_msg: 'Your order has been canceled.', show_to_customer: true, send_email: true, badge_color: 'rose', sort_order: 9, status: true },
      { id: 10, code: 'RETURN_PLACED', name: 'Return Placed', customer_label_msg: 'Return request has been initiated.', show_to_customer: true, send_email: true, badge_color: 'orange', sort_order: 10, status: true }
    ]);
  }
  tableChecked = true;
}

export async function findAll(activeOnly = false) {
  await ensureOrderStatusesTable();
  const query = db('order_statuses');
  if (activeOnly) {
    query.where('status', true);
  }
  const rows = await query.orderBy('sort_order', 'asc');
  return rows.map((row) => ({
    ...row,
    show_to_customer: Boolean(row.show_to_customer),
    send_email: Boolean(row.send_email),
    status: Boolean(row.status),
  }));
}

export async function findById(id) {
  await ensureOrderStatusesTable();
  const row = await db('order_statuses').where({ id }).first();
  if (row) {
    row.show_to_customer = Boolean(row.show_to_customer);
    row.send_email = Boolean(row.send_email);
    row.status = Boolean(row.status);
  }
  return row || null;
}

export async function create({ code, name, customer_label_msg, show_to_customer, send_email, badge_color, sort_order, status }) {
  await ensureOrderStatusesTable();
  const formattedCode = (code || name).toUpperCase().replace(/[^A-Z0-9_]+/g, '_');
  const [insertId] = await db('order_statuses').insert({
    code: formattedCode,
    name,
    customer_label_msg: customer_label_msg || `Order is currently in ${name} status.`,
    show_to_customer: show_to_customer !== undefined ? Boolean(show_to_customer) : true,
    send_email: send_email !== undefined ? Boolean(send_email) : false,
    badge_color: badge_color || 'blue',
    sort_order: sort_order || 0,
    status: status !== undefined ? Boolean(status) : true,
  });
  return findById(insertId);
}

export async function update(id, data) {
  await ensureOrderStatusesTable();
  const updatePayload = {};
  if (data.code !== undefined) updatePayload.code = data.code.toUpperCase().replace(/[^A-Z0-9_]+/g, '_');
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.customer_label_msg !== undefined) updatePayload.customer_label_msg = data.customer_label_msg;
  if (data.show_to_customer !== undefined) updatePayload.show_to_customer = Boolean(data.show_to_customer);
  if (data.send_email !== undefined) updatePayload.send_email = Boolean(data.send_email);
  if (data.badge_color !== undefined) updatePayload.badge_color = data.badge_color;
  if (data.sort_order !== undefined) updatePayload.sort_order = parseInt(data.sort_order, 10);
  if (data.status !== undefined) updatePayload.status = Boolean(data.status);

  if (Object.keys(updatePayload).length > 0) {
    await db('order_statuses').where({ id }).update(updatePayload);
  }
  return findById(id);
}

export async function remove(id) {
  await ensureOrderStatusesTable();
  await db('order_statuses').where({ id }).delete();
}
