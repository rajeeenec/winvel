import { getPool } from '../../config/database.js';

export async function findAll({ publicOnly = false } = {}) {
  let query = 'SELECT * FROM settings';
  const params = [];

  if (publicOnly) {
    query += ' WHERE is_public = TRUE';
  }

  query += ' ORDER BY category, setting_key';
  const [rows] = await getPool().execute(query, params);
  return rows;
}

export async function findByCategory(category, { publicOnly = false } = {}) {
  let query = 'SELECT * FROM settings WHERE category = ?';
  const params = [category];

  if (publicOnly) {
    query += ' AND is_public = TRUE';
  }

  query += ' ORDER BY setting_key';
  const [rows] = await getPool().execute(query, params);
  return rows;
}

export async function findByKey(category, settingKey) {
  const [rows] = await getPool().execute(
    'SELECT * FROM settings WHERE category = ? AND setting_key = ?',
    [category, settingKey]
  );
  return rows[0] || null;
}

export async function upsert({ category, settingKey, settingValue }) {
  await getPool().execute(
    `INSERT INTO settings (category, setting_key, setting_value, value_type, label, is_public)
     VALUES (?, ?, ?, 'string', ?, FALSE)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [category, settingKey, settingValue, settingKey]
  );
  return findByKey(category, settingKey);
}

export async function bulkUpdate(updates) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const { category, settingKey, settingValue } of updates) {
      await connection.execute(
        'UPDATE settings SET setting_value = ? WHERE category = ? AND setting_key = ?',
        [settingValue, category, settingKey]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return findAll();
}
