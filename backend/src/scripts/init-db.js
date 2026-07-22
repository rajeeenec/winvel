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
  const [tables] = await connection.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = ? AND table_name = 'settings'`,
    [env.db.database]
  );

  if (tables[0].count === 0) {
    console.log('Creating settings table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT NOT NULL,
        value_type ENUM('string', 'number', 'boolean', 'color', 'image') NOT NULL DEFAULT 'string',
        label VARCHAR(255) NOT NULL,
        description TEXT,
        is_public BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_setting (category, setting_key)
      )
    `);
  }

  try {
    await connection.execute(`
      ALTER TABLE settings
      MODIFY value_type ENUM('string', 'number', 'boolean', 'color', 'image') NOT NULL DEFAULT 'string'
    `);
  } catch {
    // Table may not exist yet on first run
  }

  await connection.execute(`
    INSERT IGNORE INTO settings (category, setting_key, setting_value, value_type, label, description, is_public) VALUES
    ('store', 'logo_url', '', 'image', 'Store Logo', 'Upload store logo (PNG, JPG, SVG)', TRUE)
  `);

  const [settings] = await connection.execute('SELECT COUNT(*) AS count FROM settings');
  if (settings[0].count === 0) {
    console.log('Seeding default settings...');
    const seedPath = path.resolve(__dirname, '../../../database/settings-seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seed);
  } else {
    console.log('Settings already exist.');
  }
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
  await connection.execute(
    'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
    ['admin@winvel.com', adminHash, 'Admin', 'User', 'admin']
  );
  console.log('Admin login: admin@winvel.com / admin123');
}

async function initDatabase() {
  console.log('Connecting to MySQL...');
  await waitForMysql();

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    multipleStatements: true,
  });

  try {
    const alreadyInitialized = await isInitialized(connection);

    if (alreadyInitialized) {
      console.log('Database already initialized (Docker may have run schema + seed).');
      console.log('Skipping schema/seed, ensuring admin user exists...');
    } else {
      const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
      const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

      const schema = fs.readFileSync(schemaPath, 'utf8');
      const seed = fs.readFileSync(seedPath, 'utf8');

      console.log('Running schema...');
      await connection.query(schema);

      console.log('Running seed data...');
      await connection.query(seed);
    }

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
