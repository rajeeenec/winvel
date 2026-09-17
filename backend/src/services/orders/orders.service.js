import { error } from '../../utils/response.js';
import * as ordersRepo from './orders.repository.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../../utils/razorpay.js';

export async function getOrders(filters) {
  return ordersRepo.findAll(filters);
}

export async function getOrderById(id) {
  const order = await ordersRepo.findById(id);
  if (!order) throw error('Order not found', 404);
  return order;
}

export async function createOrder({ userId, items, shippingAddress, paymentMethod, notes }) {
  const order = await ordersRepo.createOrderWithItems({
    userId,
    items,
    shippingAddress,
    paymentMethod,
    notes,
  });

  if (paymentMethod === 'razorpay') {
    const razorpayOrder = await createRazorpayOrder({
      amount: order.total_amount,
      currency: 'INR',
      receipt: `receipt_${order.id}`,
    });

    await ordersRepo.updatePaymentGatewayOrder(order.id, razorpayOrder.id);

    return {
      order_id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      payment_method: 'razorpay',
      razorpay_order_id: razorpayOrder.id,
      razorpay_key_id: razorpayOrder.key_id,
      is_mock: razorpayOrder.is_mock,
    };
  }

  return {
    order_id: order.id,
    order_number: order.order_number,
    total_amount: order.total_amount,
    payment_method: 'cod',
    order_status: order.order_status,
  };
}

export async function verifyPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const isValid = verifyRazorpaySignature({
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  });

  if (!isValid) {
    throw error('Invalid payment signature', 400);
  }

  return ordersRepo.markPaymentSuccess({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
  });
}

export async function updateOrderStatus(id, status) {
  const existing = await ordersRepo.findById(id);
  if (!existing) throw error('Order not found', 404);
  return ordersRepo.updateStatus(id, status);
}
