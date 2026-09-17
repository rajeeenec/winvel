import { db } from '../../config/database.js';
import { resolveFileUrl } from '../../utils/fileResolver.js';

export async function findAll({ userId, status } = {}) {
  const query = db('orders as o')
    .select(
      'o.*',
      'o.order_status as status',
      'u.email',
      'u.phone as user_phone',
      'u.first_name',
      'u.last_name',
      db.raw("TRIM(CONCAT(COALESCE(u.first_name,''), ' ', COALESCE(u.last_name,''))) as user_customer_name")
    )
    .leftJoin('users as u', 'o.user_id', 'u.id');

  if (userId) {
    query.where('o.user_id', userId);
  }
  if (status && status !== 'all') {
    query.where('o.order_status', status);
  }

  const orders = await query.orderBy('o.created_at', 'desc');

  for (const order of orders) {
    order.items = await findItemsByOrderId(order.id);
    order.address = await db('order_addresses').where({ order_id: order.id }).first();
    order.payment = await db('payments').where({ order_id: order.id }).orderBy('id', 'desc').first();
    order.payment_method = order.payment ? order.payment.payment_method : 'cod';
    order.customer_name = order.address?.full_name || order.user_customer_name || 'Customer';
    order.phone = order.address?.phone || order.user_phone || '';
  }

  return orders;
}

export async function findById(id) {
  const row = await db('orders as o')
    .select(
      'o.*',
      'o.order_status as status',
      'u.email',
      'u.phone as user_phone',
      'u.first_name',
      'u.last_name',
      db.raw("TRIM(CONCAT(COALESCE(u.first_name,''), ' ', COALESCE(u.last_name,''))) as user_customer_name")
    )
    .leftJoin('users as u', 'o.user_id', 'u.id')
    .where('o.id', id)
    .first();

  if (!row) return null;

  const items = await findItemsByOrderId(id);
  const address = await db('order_addresses').where({ order_id: id }).first();
  const payment = await db('payments').where({ order_id: id }).orderBy('id', 'desc').first();

  return {
    ...row,
    items,
    address,
    payment,
    payment_method: payment ? payment.payment_method : 'cod',
    customer_name: address?.full_name || row.user_customer_name || 'Customer',
    phone: address?.phone || row.user_phone || '',
  };
}

export async function findItemsByOrderId(orderId) {
  const rows = await db('order_items')
    .select('*', 'size_name as size', 'color_name as color')
    .where({ order_id: orderId });
    
  for (const row of rows) {
    if (row.image_url) {
      row.image_url = await resolveFileUrl(row.image_url);
    }
  }
  return rows;
}

export async function createOrderWithItems({ userId, items, shippingAddress, paymentMethod, notes }) {
  return await db.transaction(async (trx) => {
    // 1. Calculate totals
    const subtotal = items.reduce((acc, item) => acc + Number(item.unit_price) * Number(item.quantity), 0);
    const shippingAmount = subtotal >= 999 || subtotal === 0 ? 0 : 99;
    const totalAmount = subtotal + shippingAmount;
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Insert Order
    const [orderId] = await trx('orders').insert({
      order_number: orderNumber,
      user_id: userId,
      subtotal,
      discount_amount: 0,
      shipping_amount: shippingAmount,
      tax_amount: 0,
      coupon_discount: 0,
      total_amount: totalAmount,
      payment_status: 'pending',
      order_status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      notes: notes || null,
      placed_at: new Date(),
    });

    // 3. Prepare and insert Order Items safely
    const itemsToInsert = [];
    for (const item of items) {
      let productId = item.product_id;
      let variantId = item.variant_id;

      // Fallback for missing variant_id
      if (!variantId && productId) {
        const variantRow = await trx('product_variants').where({ product_id: productId }).first();
        if (variantRow) {
          variantId = variantRow.id;
        } else {
          // If product has no variant record, grab any first variant
          const anyVariant = await trx('product_variants').first();
          if (anyVariant) {
            variantId = anyVariant.id;
            productId = anyVariant.product_id;
          }
        }
      }

      itemsToInsert.push({
        order_id: orderId,
        product_id: productId,
        variant_id: variantId,
        product_name: item.product_name,
        sku: item.sku || `SKU-${productId}-${variantId}`,
        size_name: item.size || item.size_name || null,
        color_name: item.color || item.color_name || null,
        image_url: item.image_url || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: 0,
        total_price: Number(item.unit_price) * Number(item.quantity),
      });
    }

    if (itemsToInsert.length > 0) {
      await trx('order_items').insert(itemsToInsert);
    }

    // 4. Insert Shipping Address
    await trx('order_addresses').insert({
      order_id: orderId,
      address_type: 'shipping',
      full_name: shippingAddress.full_name,
      phone: shippingAddress.phone,
      address_line1: shippingAddress.address_line1,
      address_line2: shippingAddress.address_line2 || null,
      landmark: shippingAddress.landmark || null,
      city: shippingAddress.city,
      district: shippingAddress.district || null,
      state: shippingAddress.state || 'Tamil Nadu',
      country: shippingAddress.country || 'India',
      postal_code: shippingAddress.postal_code,
    });

    // 5. Insert Payment entry
    await trx('payments').insert({
      order_id: orderId,
      payment_method: paymentMethod,
      amount: totalAmount,
      currency: 'INR',
      status: paymentMethod === 'cod' ? 'pending' : 'created',
    });

    return {
      id: orderId,
      order_number: orderNumber,
      total_amount: totalAmount,
      order_status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
    };
  });
}

export async function updatePaymentGatewayOrder(orderId, gatewayOrderId) {
  await db('payments')
    .where({ order_id: orderId })
    .update({ gateway_order_id: gatewayOrderId });
}

export async function markPaymentSuccess({ orderId, razorpayOrderId, razorpayPaymentId }) {
  await db.transaction(async (trx) => {
    await trx('orders')
      .where({ id: orderId })
      .update({
        payment_status: 'paid',
        order_status: 'confirmed',
      });

    await trx('payments')
      .where({ order_id: orderId })
      .update({
        status: 'success',
        gateway_order_id: razorpayOrderId,
        gateway_payment_id: razorpayPaymentId,
        transaction_id: razorpayPaymentId,
        paid_at: new Date(),
      });
  });

  return findById(orderId);
}

export async function updateStatus(id, status) {
  await db('orders')
    .where({ id })
    .update({ order_status: status });
  return findById(id);
}
