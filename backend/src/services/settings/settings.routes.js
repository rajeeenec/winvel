import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { logoUpload } from '../../middleware/upload.js';
import * as settingsController from './settings.controller.js';
import * as uploadController from './upload.controller.js';

const router = Router();

router.get('/', settingsController.getPublicSettings);
router.get('/admin', authenticate, requireRole('admin'), settingsController.getAllSettings);
router.post(
  '/upload/logo',
  authenticate,
  requireRole('admin'),
  logoUpload.single('logo'),
  uploadController.uploadLogo
);
router.get('/:category', settingsController.getSettingsByCategory);
router.put('/', authenticate, requireRole('admin'), settingsController.updateSettings);

export default router;
