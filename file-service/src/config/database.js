import knex from 'knex';
import { env } from './env.js';

export const db = knex({
  client: 'mysql2',
  connection: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
  },
  pool: { min: 2, max: 10 }
});

export async function testConnection() {
  await db.raw('SELECT 1');
  return true;
}
