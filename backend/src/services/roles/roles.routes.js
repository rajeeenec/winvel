import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as rolesController from './roles.controller.js';

const router = Router();

// All role management endpoints require authenticated admin
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/permissions', rolesController.getPermissions);
router.get('/', rolesController.getRoles);
router.get('/:id', rolesController.getRole);
router.post('/', rolesController.createRole);
router.put('/:id', rolesController.updateRole);
router.delete('/:id', rolesController.deleteRole);

export default router;
