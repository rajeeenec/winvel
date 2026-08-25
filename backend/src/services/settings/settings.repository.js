import { db } from '../../config/database.js';
import { resolveFileUrl } from '../../utils/fileResolver.js';

export async function findAll({ publicOnly = false } = {}) {
  const rows = await db('settings').orderBy('key_name');
  const mapped = [];

  for (const row of rows) {
    const dotIdx = row.key_name.indexOf('.');
    const category = dotIdx > -1 ? row.key_name.substring(0, dotIdx) : 'general';
    const settingKey = dotIdx > -1 ? row.key_name.substring(dotIdx + 1) : row.key_name;

    let val = row.value;
    if (settingKey === 'logo_url' && val) {
      val = await resolveFileUrl(val);
    }

    mapped.push({
      category,
      setting_key: settingKey,
      setting_value: val || '',
      value_type: row.type,
      label: settingKey,
      is_public: true
    });
  }

  return mapped;
}

export async function findByCategory(category, { publicOnly = false } = {}) {
  const rows = await findAll({ publicOnly });
  return rows.filter((r) => r.category === category);
}

export async function findByKey(category, settingKey) {
  const rows = await findAll();
  return rows.find((r) => r.category === category && r.setting_key === settingKey) || null;
}

export async function upsert({ category, settingKey, settingValue }) {
  const keyName = `${category}.${settingKey}`;
  await db('settings')
    .insert({
      key_name: keyName,
      value: settingValue,
      type: 'string',
    })
    .onConflict('key_name')
    .merge({
      value: settingValue,
    });

  return findByKey(category, settingKey);
}

export async function bulkUpdate(updates) {
  await db.transaction(async (trx) => {
    for (const { category, settingKey, settingValue } of updates) {
      const keyName = `${category}.${settingKey}`;
      await trx('settings')
        .where({ key_name: keyName })
        .update({ value: settingValue });
    }
  });

  return findAll();
}
