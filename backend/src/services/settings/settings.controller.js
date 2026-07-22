import { success } from '../../utils/response.js';
import * as settingsService from './settings.service.js';

export async function getPublicSettings(req, res, next) {
  try {
    const settings = await settingsService.getPublicSettings();
    return success(res, settings);
  } catch (err) {
    next(err);
  }
}

export async function getAllSettings(req, res, next) {
  try {
    const settings = await settingsService.getAllSettings();
    return success(res, settings);
  } catch (err) {
    next(err);
  }
}

export async function getSettingsByCategory(req, res, next) {
  try {
    const publicOnly = req.user?.role !== 'admin';
    const settings = await settingsService.getSettingsByCategory(req.params.category, { publicOnly });
    return success(res, settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const settings = await settingsService.updateSettings(req.body.settings);
    return success(res, settings);
  } catch (err) {
    next(err);
  }
}
