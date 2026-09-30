import { createMicroservice } from './createMicroservice.js';
import settingsRoutes from '../services/settings/settings.routes.js';
import bannersRoutes from '../services/banners/banners.routes.js';

const PORT = process.env.SETTINGS_SERVICE_PORT || 4007;

const { app, start } = createMicroservice({
  serviceName: 'Settings Service',
  port: PORT,
  routes: (expressApp) => {
    expressApp.use('/api/banners', bannersRoutes);
    expressApp.use('/banners', bannersRoutes);
    expressApp.use('/api/settings', settingsRoutes);
    expressApp.use('/settings', settingsRoutes);
    expressApp.use('/', settingsRoutes);
  },
});

export { app };

if (process.argv[1] && process.argv[1].endsWith('settings.service.js')) {
  start();
}
