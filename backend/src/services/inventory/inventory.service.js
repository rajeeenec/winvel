import { error } from '../../utils/response.js';
import * as inventoryRepo from './inventory.repository.js';

export async function getInventoryBatches() {
  return inventoryRepo.findAll();
}

export async function getInventoryBatchById(id) {
  const batch = await inventoryRepo.findById(id);
  if (!batch) throw error('Inventory batch not found', 404);
  return batch;
}

export async function createInventoryBatch(data) {
  if (!data.vendorId) {
    throw error('Please select a vendor for this inventory batch', 400);
  }
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw error('At least one product line item is required', 400);
  }

  // Validate each item
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.productId) {
      throw error(`Line item #${i + 1}: Please select a product`, 400);
    }
    if (!item.quantity || parseInt(item.quantity) <= 0) {
      throw error(`Line item #${i + 1}: Quantity must be greater than 0`, 400);
    }
    if (item.unitCost === undefined || parseFloat(item.unitCost) < 0) {
      throw error(`Line item #${i + 1}: Unit cost price is required`, 400);
    }
  }

  const batchNumber = data.batchNumber
    ? data.batchNumber.trim().toUpperCase()
    : `BATCH-${Date.now().toString().slice(-6)}`;

  return inventoryRepo.createBatch({
    vendorId: data.vendorId,
    batchNumber,
    receivedDate: data.receivedDate,
    items: data.items,
    notes: data.notes,
  });
}
