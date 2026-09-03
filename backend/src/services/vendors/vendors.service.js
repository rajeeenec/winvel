import { error } from '../../utils/response.js';
import * as vendorsRepo from './vendors.repository.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s\-()]{7,15}$/;

export async function getVendors() {
  return vendorsRepo.findAll();
}

export async function getVendorById(id) {
  const vendor = await vendorsRepo.findById(id);
  if (!vendor) throw error('Vendor not found', 404);
  return vendor;
}

export async function createVendor(data) {
  const name = (data.name || '').trim();
  const email = (data.email || '').toLowerCase().trim();
  const phone = (data.phone || '').trim();

  if (!name) {
    throw error('Vendor company name is required', 400);
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    throw error('Please provide a valid email address', 400);
  }
  if (phone && !PHONE_REGEX.test(phone)) {
    throw error('Please provide a valid phone number (e.g. +91 9876543210)', 400);
  }

  // Uniqueness check for email
  const existingEmail = await vendorsRepo.findByEmail(email);
  if (existingEmail) {
    throw error('This email address is already registered to another vendor', 400);
  }

  // Uniqueness check for phone
  if (phone) {
    const existingPhone = await vendorsRepo.findByPhone(phone);
    if (existingPhone) {
      throw error('This phone number is already registered to another vendor', 400);
    }
  }

  return vendorsRepo.create({
    name,
    contactPerson: data.contactPerson,
    email,
    phone,
    gstin: data.gstin,
    address: data.address,
  });
}

export async function updateVendor(id, data) {
  const existing = await vendorsRepo.findById(id);
  if (!existing) throw error('Vendor not found', 404);

  if (data.email) {
    const email = data.email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(email)) {
      throw error('Please provide a valid email address', 400);
    }
    const existingEmail = await vendorsRepo.findByEmail(email, id);
    if (existingEmail) {
      throw error('This email address is already registered to another vendor', 400);
    }
  }

  if (data.phone) {
    const phone = data.phone.trim();
    if (!PHONE_REGEX.test(phone)) {
      throw error('Please provide a valid phone number', 400);
    }
    const existingPhone = await vendorsRepo.findByPhone(phone, id);
    if (existingPhone) {
      throw error('This phone number is already registered to another vendor', 400);
    }
  }

  return vendorsRepo.update(id, data);
}

export async function toggleVendorStatus(id, isActive) {
  const existing = await vendorsRepo.findById(id);
  if (!existing) throw error('Vendor not found', 404);
  return vendorsRepo.updateStatus(id, isActive);
}
