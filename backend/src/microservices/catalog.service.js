import { createMicroservice } from './createMicroservice.js';
import productsRoutes from '../services/products/products.routes.js';
import categoriesRoutes from '../services/categories/categories.routes.js';

const PORT = process.env.CATALOG_SERVICE_PORT || 4005;

const { app, start } = createMicroservice({
  serviceName: 'Catalog Service',
  port: PORT,
  routes: (expressApp) => {
    expressApp.use('/api/products', productsRoutes);
    expressApp.use('/api/categories', categoriesRoutes);
    expressApp.use('/products', productsRoutes);
    expressApp.use('/categories', categoriesRoutes);
  },
});

export { app };

if (process.argv[1] && process.argv[1].endsWith('catalog.service.js')) {
  start();
}
