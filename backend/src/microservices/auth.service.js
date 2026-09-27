import { createMicroservice } from './createMicroservice.js';
import authRoutes from '../services/auth/auth.routes.js';
import rolesRoutes from '../services/roles/roles.routes.js';

const PORT = process.env.AUTH_SERVICE_PORT || 4001;

const { app, start } = createMicroservice({
  serviceName: 'Auth Service',
  port: PORT,
  routes: (expressApp) => {
    expressApp.use('/api/auth', authRoutes);
    expressApp.use('/api/roles', rolesRoutes);
    expressApp.use('/roles', rolesRoutes);
    expressApp.use('/', authRoutes);
  },
});

export { app };

if (process.argv[1] && process.argv[1].endsWith('auth.service.js')) {
  start();
}
