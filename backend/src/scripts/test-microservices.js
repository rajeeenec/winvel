import { app as authApp } from '../microservices/auth.service.js';
import { app as ordersApp } from '../microservices/orders.service.js';
import { app as fileApp } from '../microservices/file.service.js';
import { app as stockApp } from '../microservices/stock.service.js';
import { app as catalogApp } from '../microservices/catalog.service.js';
import { app as userApp } from '../microservices/user.service.js';
import { app as settingsApp } from '../microservices/settings.service.js';
import gatewayApp from '../app.js';
import { testConnection } from '../config/database.js';

async function runTests() {
  console.log('--- TESTING MICROSERVICES ARCHITECTURE & ROUTING ---');
  await testConnection();

  const services = [
    { name: 'Auth Service', port: 4001, app: authApp },
    { name: 'Order Service', port: 4002, app: ordersApp },
    { name: 'File Service', port: 4003, app: fileApp },
    { name: 'Stock Management Service', port: 4004, app: stockApp },
    { name: 'Catalog Service', port: 4005, app: catalogApp },
    { name: 'User & Vendor Service', port: 4006, app: userApp },
    { name: 'Settings Service', port: 4007, app: settingsApp },
    { name: 'API Gateway', port: 4000, app: gatewayApp },
  ];

  const servers = [];
  for (const s of services) {
    const server = s.app.listen(s.port, '127.0.0.1');
    servers.push(server);
    console.log(`✅ Started ${s.name} on http://127.0.0.1:${s.port}`);
  }

  console.log('\n--- TESTING ROUTE INTEGRATION VIA GATEWAY (PORT 4000) ---');

  // Test GET /api/settings
  try {
    const res = await fetch('http://127.0.0.1:4000/api/settings');
    const status = res.status;
    const body = await res.json();
    console.log(`[GET /api/settings] Status: ${status}`, body ? 'SUCCESS' : 'EMPTY');
  } catch (err) {
    console.error('[GET /api/settings] FAILED:', err.message);
  }

  // Test POST /api/auth/login (testing route matching)
  try {
    const res = await fetch('http://127.0.0.1:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@winveel.com', password: 'wrongpassword' }),
    });
    const status = res.status;
    const body = await res.json();
    console.log(`[POST /api/auth/login] Status: ${status}`, body);
  } catch (err) {
    console.error('[POST /api/auth/login] FAILED:', err.message);
  }

  // Test GET /api/products
  try {
    const res = await fetch('http://127.0.0.1:4000/api/products');
    const status = res.status;
    console.log(`[GET /api/products] Status: ${status}`);
  } catch (err) {
    console.error('[GET /api/products] FAILED:', err.message);
  }

  // Test GET /api/inventory
  try {
    const res = await fetch('http://127.0.0.1:4000/api/inventory');
    const status = res.status;
    console.log(`[GET /api/inventory] Status: ${status}`);
  } catch (err) {
    console.error('[GET /api/inventory] FAILED:', err.message);
  }

  // Close servers
  servers.forEach((srv) => srv.close());
  console.log('\n--- ALL MICROSERVICE INTEGRATION TESTS COMPLETED ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
