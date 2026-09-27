import { createMicroservice } from './createMicroservice.js';
import ordersRoutes from '../services/orders/orders.routes.js';
import orderStatusesRoutes from '../services/order-statuses/orderStatuses.routes.js';

const PORT = process.env.ORDER_SERVICE_PORT || 4002;

const { app, start } = createMicroservice({
  serviceName: 'Order Service',
  port: PORT,
  routes: (expressApp) => {
    expressApp.use('/api/orders', ordersRoutes);
    expressApp.use('/api/order-statuses', orderStatusesRoutes);
    expressApp.use('/order-statuses', orderStatusesRoutes);
    expressApp.use('/orders', ordersRoutes);
    expressApp.use('/', ordersRoutes);
  },
});

export { app };

if (process.argv[1] && process.argv[1].endsWith('orders.service.js')) {
  start();
}
