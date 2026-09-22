import * as repository from './orderStatuses.repository.js';

export async function getAllOrderStatuses(activeOnly = false) {
  return repository.findAll(activeOnly);
}

export async function getOrderStatusById(id) {
  const status = await repository.findById(id);
  if (!status) {
    throw new Error('Order status not found');
  }
  return status;
}

export async function createOrderStatus(data) {
  if (!data.name) {
    throw new Error('Status name is required');
  }
  return repository.create(data);
}

export async function updateOrderStatus(id, data) {
  await getOrderStatusById(id);
  return repository.update(id, data);
}

export async function deleteOrderStatus(id) {
  await getOrderStatusById(id);
  await repository.remove(id);
  return { message: 'Order status deleted successfully' };
}
