import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as categoriesController from './categories.controller.js';

const router = Router();

router.get('/', categoriesController.getCategories);
router.get('/:id', categoriesController.getCategoryById);
router.post('/', authenticate, requireRole('admin'), categoriesController.createCategory);
router.put('/:id', authenticate, requireRole('admin'), categoriesController.updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), categoriesController.deleteCategory);

export default router;
