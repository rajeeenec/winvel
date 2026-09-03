import { Router } from 'express';
import authRoutes from '../services/auth/auth.routes.js';
import productsRoutes from '../services/products/products.routes.js';
import ordersRoutes from '../services/orders/orders.routes.js';
import usersRoutes from '../services/users/users.routes.js';
import categoriesRoutes from '../services/categories/categories.routes.js';
import settingsRoutes from '../services/settings/settings.routes.js';
import rolesRoutes from '../services/roles/roles.routes.js';
import vendorsRoutes from '../services/vendors/vendors.routes.js';
import inventoryRoutes from '../services/inventory/inventory.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/settings', settingsRoutes);
router.use('/roles', rolesRoutes);
router.use('/vendors', vendorsRoutes);
router.use('/inventory', inventoryRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Winvel API is running' });
});

export default router;
