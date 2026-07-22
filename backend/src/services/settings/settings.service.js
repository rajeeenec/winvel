import { error } from '../../utils/response.js';
import * as settingsRepo from './settings.repository.js';

function formatSettings(rows) {
  const grouped = {};
  const flat = {};

  for (const row of rows) {
    if (!grouped[row.category]) grouped[row.category] = {};
    grouped[row.category][row.setting_key] = castValue(row);
    flat[`${row.category}.${row.setting_key}`] = castValue(row);
  }

  return { grouped, flat, list: rows };
}

function castValue(row) {
  switch (row.value_type) {
    case 'number':
      return Number(row.setting_value);
    case 'boolean':
      return row.setting_value === 'true';
    default:
      return row.setting_value;
  }
}

export async function getPublicSettings() {
  const rows = await settingsRepo.findAll({ publicOnly: true });
  return formatSettings(rows);
}

export async function getAllSettings() {
  const rows = await settingsRepo.findAll();
  return formatSettings(rows);
}

export async function getSettingsByCategory(category, { publicOnly = false } = {}) {
  const rows = await settingsRepo.findByCategory(category, { publicOnly });
  return formatSettings(rows);
}

export async function updateSettings(updates) {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw error('No settings to update', 400);
  }

  for (const item of updates) {
    if (!item.category || !item.settingKey) {
      throw error('Each update requires category and settingKey', 400);
    }

    const existing = await settingsRepo.findByKey(item.category, item.settingKey);
    if (!existing) {
      throw error(`Setting not found: ${item.category}.${item.settingKey}`, 404);
    }
  }

  const rows = await settingsRepo.bulkUpdate(
    updates.map((u) => ({
      category: u.category,
      settingKey: u.settingKey,
      settingValue: String(u.settingValue),
    }))
  );

  return formatSettings(rows);
}
