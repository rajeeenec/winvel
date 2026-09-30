import { success } from '../../utils/response.js';
import * as bannersService from './banners.service.js';

export async function getPublicBanners(_req, res, next) {
  try {
    const banners = await bannersService.getPublicBanners();
    return success(res, banners);
  } catch (err) {
    next(err);
  }
}

export async function getAllBanners(_req, res, next) {
  try {
    const banners = await bannersService.getAllBanners();
    return success(res, banners);
  } catch (err) {
    next(err);
  }
}

export async function getBannerById(req, res, next) {
  try {
    const banner = await bannersService.getBannerById(req.params.id);
    return success(res, banner);
  } catch (err) {
    next(err);
  }
}

export async function createBanner(req, res, next) {
  try {
    const banner = await bannersService.createBanner(req.body);
    return success(res, banner, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateBanner(req, res, next) {
  try {
    const banner = await bannersService.updateBanner(req.params.id, req.body);
    return success(res, banner);
  } catch (err) {
    next(err);
  }
}

export async function deleteBanner(req, res, next) {
  try {
    await bannersService.deleteBanner(req.params.id);
    return success(res, { message: 'Banner deleted successfully' });
  } catch (err) {
    next(err);
  }
}
