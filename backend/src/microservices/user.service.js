import { createMicroservice } from './createMicroservice.js';
import usersRoutes from '../services/users/users.routes.js';
import vendorsRoutes from '../services/vendors/vendors.routes.js';

const PORT = process.env.USER_SERVICE_PORT || 4006;

const { app, start } = createMicroservice({
  serviceName: 'User & Vendor Service',
  port: PORT,
  routes: (expressApp) => {
    expressApp.use('/api/users', usersRoutes);
    expressApp.use('/api/vendors', vendorsRoutes);
    expressApp.use('/users', usersRoutes);
    expressApp.use('/vendors', vendorsRoutes);
  },
});

export { app };

if (process.argv[1] && process.argv[1].endsWith('user.service.js')) {
  start();
}
