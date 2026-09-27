import express from 'express';
import cors from 'cors';
import { testConnection } from '../config/database.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';

export function createMicroservice({ serviceName, port, routes }) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'UP',
      service: serviceName,
      port,
      timestamp: new Date().toISOString(),
    });
  });

  // Register microservice routes
  if (routes) {
    routes(app);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return {
    app,
    start: async () => {
      try {
        await testConnection();
        app.listen(port, '0.0.0.0', () => {
          console.log(`🚀 [${serviceName}] Microservice running on http://localhost:${port}`);
        });
      } catch (err) {
        console.error(`❌ [${serviceName}] Failed to start:`, err);
        process.exit(1);
      }
    },
  };
}
