import { success } from '../../utils/response.js';
import * as vendorsService from './vendors.service.js';

export async function getVendors(req, res, next) {
  try {
    const vendors = await vendorsService.getVendors();
    return success(res, vendors);
  } catch (err) {
    next(err);
  }
}

export async function getVendor(req, res, next) {
  try {
    const vendor = await vendorsService.getVendorById(parseInt(req.params.id));
    return success(res, vendor);
  } catch (err) {
    next(err);
  }
}

export async function createVendor(req, res, next) {
  try {
    const vendor = await vendorsService.createVendor(req.body);
    return success(res, vendor, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateVendor(req, res, next) {
  try {
    const vendor = await vendorsService.updateVendor(parseInt(req.params.id), req.body);
    return success(res, vendor);
  } catch (err) {
    next(err);
  }
}

export async function toggleVendorStatus(req, res, next) {
  try {
    const { isActive } = req.body;
    const vendor = await vendorsService.toggleVendorStatus(parseInt(req.params.id), isActive);
    return success(res, vendor);
  } catch (err) {
    next(err);
  }
}
