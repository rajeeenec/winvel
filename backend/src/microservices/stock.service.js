import { createMicroservice } from './createMicroservice.js';
import inventoryRoutes from '../services/inventory/inventory.routes.js';

const PORT = process.env.STOCK_SERVICE_PORT || 4004;

const { app, start } = createMicroservice({
  serviceName: 'Stock Management Service',
  port: PORT,
  routes: (expressApp) => {
    expressApp.use('/api/inventory', inventoryRoutes);
    expressApp.use('/inventory', inventoryRoutes);
    expressApp.use('/', inventoryRoutes);
  },
});

export { app };

if (process.argv[1] && process.argv[1].endsWith('stock.service.js')) {
  start();
}
