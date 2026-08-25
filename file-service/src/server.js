import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/database.js';

async function start() {
  try {
    await testConnection();
    console.log('File Service connected to database successfully.');

    app.listen(env.port, '0.0.0.0', () => {
      console.log(`File Service running on http://0.0.0.0:${env.port}`);
      console.log(`Upload API available at http://localhost:${env.port}/upload`);
    });
  } catch (err) {
    console.error('Failed to start File Service:', err);
    process.exit(1);
  }
}

start();
