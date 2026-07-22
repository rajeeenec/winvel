import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as usersController from './users.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUser);
router.patch('/:id/status', usersController.toggleUserStatus);

export default router;
