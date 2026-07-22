import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as categoriesController from './categories.controller.js';

const router = Router();

router.get('/', categoriesController.getCategories);
router.post('/', authenticate, requireRole('admin'), categoriesController.createCategory);

export default router;
