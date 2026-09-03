import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as vendorsController from './vendors.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', vendorsController.getVendors);
router.get('/:id', vendorsController.getVendor);
router.post('/', vendorsController.createVendor);
router.put('/:id', vendorsController.updateVendor);
router.patch('/:id/status', vendorsController.toggleVendorStatus);

export default router;
