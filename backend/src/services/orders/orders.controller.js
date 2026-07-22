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
