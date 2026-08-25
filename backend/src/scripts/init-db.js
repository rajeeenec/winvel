import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_RETRIES = 15;
const RETRY_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMysql() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const connection = await mysql.createConnection({
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
      });
      await connection.ping();
      await connection.end();
      return;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `MySQL not ready after ${MAX_RETRIES} attempts. ` +
          `If using Docker, wait until "docker ps" shows the container as healthy, then retry.`
        );
      }
      console.log(`Waiting for MySQL... (attempt ${attempt}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY_MS);
    }
  }
}

async function isInitialized(connection) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = ? AND table_name = 'categories'`,
    [env.db.database]
  );
  if (rows[0].count === 0) return false;

  const [categories] = await connection.execute(
    'SELECT COUNT(*) AS count FROM categories'
  );
  return categories[0].count > 0;
}

async function ensureSettings(connection) {
  // Settings are fully managed and seeded via seed.sql
  console.log('Settings verification complete (handled by seed.sql).');
}

async function ensureAdminUser(connection) {
  const [existing] = await connection.execute(
    'SELECT id FROM users WHERE email = ?',
    ['admin@winvel.com']
  );

  if (existing.length > 0) {
    console.log('Admin user already exists.');
    return;
  }

  console.log('Creating admin user...');
  const adminHash = await bcrypt.hash('admin123', 10);
  
  // Get the Admin role ID
  const [roles] = await connection.execute(
    "SELECT id FROM roles WHERE name = 'Admin'"
  );
  const roleId = roles.length > 0 ? roles[0].id : 2;

  await connection.execute(
    'INSERT INTO users (role_id, email, password_hash, first_name, last_name, status) VALUES (?, ?, ?, ?, ?, ?)',
    [roleId, 'admin@winvel.com', adminHash, 'Admin', 'User', 'active']
  );
  console.log('Admin login: admin@winvel.com / admin123');
}

async function initDatabase() {
  console.log('Connecting to MySQL...');
  await waitForMysql();

  // Connect without selecting database first, so we can drop and recreate it
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });

  try {
    console.log('Resetting and recreating winvel_db...');
    await connection.query('DROP DATABASE IF EXISTS winvel_db');
    await connection.query('CREATE DATABASE winvel_db');
    await connection.query('USE winvel_db');

    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    const schema = fs.readFileSync(schemaPath, 'utf8');
    const seed = fs.readFileSync(seedPath, 'utf8');

    console.log('Running database schema...');
    await connection.query(schema);

    console.log('Running database seed data...');
    await connection.query(seed);

    await ensureSettings(connection);
    await ensureAdminUser(connection);
    console.log('Database ready!');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
