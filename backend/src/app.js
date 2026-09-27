import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());

// Toggle Microservices Proxy Mode vs Monolith Mode
const USE_MICROSERVICES = process.env.USE_MICROSERVICES !== 'false';

const servicePorts = {
  auth: process.env.AUTH_SERVICE_PORT || 4001,
  orders: process.env.ORDER_SERVICE_PORT || 4002,
  files: process.env.FILE_SERVICE_PORT || 4003,
  stock: process.env.STOCK_SERVICE_PORT || 4004,
  catalog: process.env.CATALOG_SERVICE_PORT || 4005,
  users: process.env.USER_SERVICE_PORT || 4006,
  settings: process.env.SETTINGS_SERVICE_PORT || 4007,
};

const createServiceProxy = (targetPort, serviceName, pathPrefix = '') => {
  return createProxyMiddleware({
    target: `http://127.0.0.1:${targetPort}`,
    changeOrigin: true,
    pathRewrite: pathPrefix ? (path) => pathPrefix + path : undefined,
    onError: (err, _req, res) => {
      console.error(`⚠️ Proxy error for [${serviceName}] on port ${targetPort}:`, err.message);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: `${serviceName} is currently unavailable. Other services remain online.`,
          service: serviceName,
          port: targetPort,
        });
      }
    },
  });
};

if (USE_MICROSERVICES) {
  console.log('🔄 API Gateway operating in Microservices Proxy Mode');

  // Static uploads & upload endpoints -> File Service (Port 4003)
  app.use('/uploads', createServiceProxy(servicePorts.files, 'File Service', '/uploads'));
  app.use('/upload', createServiceProxy(servicePorts.files, 'File Service', '/upload'));

  // Microservice Proxy Routes
  app.use('/api/auth', createServiceProxy(servicePorts.auth, 'Auth Service', '/api/auth'));
  app.use('/api/roles', createServiceProxy(servicePorts.auth, 'Auth Service', '/api/roles'));

  app.use('/api/orders', createServiceProxy(servicePorts.orders, 'Order Service', '/api/orders'));
  app.use('/api/order-statuses', createServiceProxy(servicePorts.orders, 'Order Service', '/api/order-statuses'));

  app.use('/api/inventory', createServiceProxy(servicePorts.stock, 'Stock Management Service', '/api/inventory'));

  app.use('/api/products', createServiceProxy(servicePorts.catalog, 'Catalog Service', '/api/products'));
  app.use('/api/categories', createServiceProxy(servicePorts.catalog, 'Catalog Service', '/api/categories'));

  app.use('/api/users', createServiceProxy(servicePorts.users, 'User & Vendor Service', '/api/users'));
  app.use('/api/vendors', createServiceProxy(servicePorts.users, 'User & Vendor Service', '/api/vendors'));

  app.use('/api/settings', createServiceProxy(servicePorts.settings, 'Settings Service', '/api/settings'));
} else {
  console.log('📦 API Gateway operating in Monolithic Mode');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
  app.use('/api', routes);
}

// Health check endpoint for API Gateway
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Winveel API Gateway is running',
    mode: USE_MICROSERVICES ? 'Microservices Proxy' : 'Monolith',
    services: servicePorts,
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
