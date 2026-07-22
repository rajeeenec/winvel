import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticate, authController.getProfile);

export default router;
