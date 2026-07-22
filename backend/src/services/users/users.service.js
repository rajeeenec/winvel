import { error } from '../../utils/response.js';
import * as usersRepo from './users.repository.js';

export async function getUsers(filters) {
  return usersRepo.findAll(filters);
}

export async function getUserById(id) {
  const user = await usersRepo.findById(id);
  if (!user) throw error('User not found', 404);
  return user;
}

export async function toggleUserStatus(id, isActive) {
  const existing = await usersRepo.findById(id);
  if (!existing) throw error('User not found', 404);
  return usersRepo.updateStatus(id, isActive);
}
