import bcrypt from 'bcryptjs';
import { error } from '../../utils/response.js';
import * as usersRepo from './users.repository.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s\-()]{7,15}$/;

export async function getUsers(filters) {
  return usersRepo.findAll(filters);
}

export async function getUserById(id) {
  const user = await usersRepo.findById(id);
  if (!user) throw error('User not found', 404);
  return user;
}

export async function createUser(data) {
  const name = (data.name || data.firstName || '').trim();
  const email = (data.email || '').toLowerCase().trim();
  const phone = (data.phone || '').trim();

  if (!name) {
    throw error('Full name is required', 400);
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    throw error('Please provide a valid email address', 400);
  }
  if (!data.password || data.password.length < 6) {
    throw error('Password is required and must be at least 6 characters', 400);
  }
  if (phone && !PHONE_REGEX.test(phone)) {
    throw error('Please provide a valid phone number (e.g. +91 9876543210)', 400);
  }

  // Uniqueness check for email
  const existingEmail = await usersRepo.findByEmail(email);
  if (existingEmail) {
    throw error('This email address is already registered', 400);
  }

  // Uniqueness check for phone
  if (phone) {
    const existingPhone = await usersRepo.findByPhone(phone);
    if (existingPhone) {
      throw error('This phone number is already registered to another account', 400);
    }
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  return usersRepo.createUser({
    email,
    passwordHash,
    name,
    phone,
    roleId: data.roleId !== undefined ? data.roleId : 2,
  });
}

export async function updateUser(id, data) {
  const existing = await usersRepo.findById(id);
  if (!existing) throw error('User not found', 404);

  if (data.email) {
    const email = data.email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(email)) {
      throw error('Please provide a valid email address', 400);
    }
    const existingEmail = await usersRepo.findByEmail(email, id);
    if (existingEmail) {
      throw error('This email address is already registered to another account', 400);
    }
  }

  if (data.phone) {
    const phone = data.phone.trim();
    if (!PHONE_REGEX.test(phone)) {
      throw error('Please provide a valid phone number', 400);
    }
    const existingPhone = await usersRepo.findByPhone(phone, id);
    if (existingPhone) {
      throw error('This phone number is already registered to another account', 400);
    }
  }

  return usersRepo.updateUser(id, data);
}

export async function toggleUserStatus(id, isActive) {
  const existing = await usersRepo.findById(id);
  if (!existing) throw error('User not found', 404);
  return usersRepo.updateStatus(id, isActive);
}
