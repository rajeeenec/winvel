import { success } from '../../utils/response.js';
import * as settingsRepo from './settings.repository.js';
import * as settingsService from './settings.service.js';

export async function uploadLogo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Logo image is required' });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    await settingsRepo.bulkUpdate([
      { category: 'store', settingKey: 'logo_url', settingValue: logoUrl },
    ]);

    const settings = await settingsService.getAllSettings();
    return success(res, { logoUrl, settings });
  } catch (err) {
    next(err);
  }
}
