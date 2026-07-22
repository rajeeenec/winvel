import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as productsController from './products.controller.js';

const router = Router();

// Public routes
router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProduct);

// Admin routes
router.post('/', authenticate, requireRole('admin'), productsController.createProduct);
router.put('/:id', authenticate, requireRole('admin'), productsController.updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), productsController.deleteProduct);

export default router;
