import { success } from '../../utils/response.js';
import * as inventoryService from './inventory.service.js';

export async function getInventoryBatches(req, res, next) {
  try {
    const batches = await inventoryService.getInventoryBatches();
    return success(res, batches);
  } catch (err) {
    next(err);
  }
}

export async function getInventoryBatch(req, res, next) {
  try {
    const batch = await inventoryService.getInventoryBatchById(parseInt(req.params.id));
    return success(res, batch);
  } catch (err) {
    next(err);
  }
}

export async function createInventoryBatch(req, res, next) {
  try {
    const batch = await inventoryService.createInventoryBatch(req.body);
    return success(res, batch, 201);
  } catch (err) {
    next(err);
  }
}
