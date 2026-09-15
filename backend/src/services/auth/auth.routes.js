import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.get('/me', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/me', authenticate, authController.updateProfile);

export default router;
