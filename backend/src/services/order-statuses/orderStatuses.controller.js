import * as service from './orderStatuses.service.js';

export async function getAll(req, res, next) {
  try {
    const activeOnly = req.query.active === 'true';
    const statuses = await service.getAllOrderStatuses(activeOnly);
    res.json({ success: true, data: statuses });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const status = await service.getOrderStatusById(req.params.id);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const status = await service.createOrderStatus(req.body);
    res.status(201).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const status = await service.updateOrderStatus(req.params.id, req.body);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await service.deleteOrderStatus(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
