import { error } from '../../utils/response.js';
import * as ordersRepo from './orders.repository.js';

export async function getOrders(filters) {
  return ordersRepo.findAll(filters);
}

export async function getOrderById(id) {
  const order = await ordersRepo.findById(id);
  if (!order) throw error('Order not found', 404);

  const items = await ordersRepo.findItemsByOrderId(id);
  return { ...order, items };
}

export async function updateOrderStatus(id, status) {
  const existing = await ordersRepo.findById(id);
  if (!existing) throw error('Order not found', 404);
  return ordersRepo.updateStatus(id, status);
}
