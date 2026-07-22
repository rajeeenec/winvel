import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/database.js';

async function start() {
  try {
    await testConnection();
    console.log('MySQL connected successfully');

    app.listen(env.port, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${env.port}`);
      console.log(`API available at http://localhost:${env.port}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
