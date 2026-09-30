import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as bannersController from './banners.controller.js';

const router = Router();

// Public route for storefront active banners
router.get('/', bannersController.getPublicBanners);

// Admin routes
router.get('/admin', authenticate, requireRole('admin'), bannersController.getAllBanners);
router.get('/:id', bannersController.getBannerById);
router.post('/', authenticate, requireRole('admin'), bannersController.createBanner);
router.put('/:id', authenticate, requireRole('admin'), bannersController.updateBanner);
router.delete('/:id', authenticate, requireRole('admin'), bannersController.deleteBanner);

export default router;
