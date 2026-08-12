import { db } from '../../config/database.js';

export async function findAll({ publicOnly = false } = {}) {
  const query = db('settings');

  if (publicOnly) {
    query.where({ is_public: true });
  }

  return await query.orderBy(['category', 'setting_key']);
}

export async function findByCategory(category, { publicOnly = false } = {}) {
  const query = db('settings').where({ category });

  if (publicOnly) {
    query.where({ is_public: true });
  }

  return await query.orderBy('setting_key');
}

export async function findByKey(category, settingKey) {
  const row = db('settings')
    .where({ category, setting_key: settingKey })
    .first();
  return row || null;
}

export async function upsert({ category, settingKey, settingValue }) {
  await db('settings')
    .insert({
      category,
      setting_key: settingKey,
      setting_value: settingValue,
      value_type: 'string',
      label: settingKey,
      is_public: false,
    })
    .onConflict(['category', 'setting_key'])
    .merge({
      setting_value: settingValue,
    });

  return findByKey(category, settingKey);
}

export async function bulkUpdate(updates) {
  await db.transaction(async (trx) => {
    for (const { category, settingKey, settingValue } of updates) {
      await trx('settings')
        .where({ category, setting_key: settingKey })
        .update({ setting_value: settingValue });
    }
  });

  return findAll();
}


