import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as ordersController from './orders.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrder);
router.patch('/:id/status', requireRole('admin'), ordersController.updateOrderStatus);

export default router;
