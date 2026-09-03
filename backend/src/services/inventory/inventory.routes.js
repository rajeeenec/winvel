import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as inventoryController from './inventory.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', inventoryController.getInventoryBatches);
router.get('/:id', inventoryController.getInventoryBatch);
router.post('/', inventoryController.createInventoryBatch);

export default router;
