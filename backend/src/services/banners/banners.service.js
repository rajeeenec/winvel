import * as bannersRepo from './banners.repository.js';
import { error } from '../../utils/response.js';

export async function getPublicBanners() {
  return bannersRepo.findAll({ publicOnly: true });
}

export async function getAllBanners() {
  return bannersRepo.findAll({ publicOnly: false });
}

export async function getBannerById(id) {
  const banner = await bannersRepo.findById(id);
  if (!banner) throw error('Banner not found', 404);
  return banner;
}

export async function createBanner(data) {
  return bannersRepo.create(data);
}

export async function updateBanner(id, data) {
  await getBannerById(id);
  return bannersRepo.update(id, data);
}

export async function deleteBanner(id) {
  await getBannerById(id);
  return bannersRepo.remove(id);
}
