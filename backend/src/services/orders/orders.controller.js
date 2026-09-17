import { success } from '../../utils/response.js';
import * as ordersService from './orders.service.js';

export async function getOrders(req, res, next) {
  try {
    const filters = {};
    if (req.user.role === 'customer') {
      filters.userId = req.user.id;
    }
    if (req.query.status) filters.status = req.query.status;

    const orders = await ordersService.getOrders(filters);
    return success(res, orders);
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await ordersService.getOrderById(parseInt(req.params.id));

    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    return success(res, order);
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const { items, shipping_address, payment_method, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order items are required' });
    }

    if (!shipping_address || !shipping_address.full_name || !shipping_address.address_line1 || !shipping_address.city || !shipping_address.postal_code) {
      return res.status(400).json({ success: false, error: 'Delivery address details are incomplete' });
    }

    const orderResult = await ordersService.createOrder({
      userId,
      items,
      shippingAddress: shipping_address,
      paymentMethod: payment_method || 'cod',
      notes,
    });

    return success(res, orderResult, 201);
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification details' });
    }

    const updatedOrder = await ordersService.verifyPayment({
      orderId: parseInt(order_id),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    return success(res, updatedOrder);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const order = await ordersService.updateOrderStatus(parseInt(req.params.id), status);
    return success(res, order);
  } catch (err) {
    next(err);
  }
}
