import { error } from '../../utils/response.js';
import * as rolesRepo from './roles.repository.js';

export async function getRoles() {
  return rolesRepo.findAll();
}

export async function getRoleById(id) {
  const role = await rolesRepo.findById(id);
  if (!role) throw error('Role not found', 404);
  return role;
}

export async function getPermissions() {
  return rolesRepo.findAllPermissions();
}

export async function createRole(data) {
  if (!data.name || !data.name.trim()) {
    throw error('Role name is required', 400);
  }
  return rolesRepo.create(data);
}

export async function updateRole(id, data) {
  const existing = await rolesRepo.findById(id);
  if (!existing) throw error('Role not found', 404);
  return rolesRepo.update(id, data);
}

export async function deleteRole(id) {
  const existing = await rolesRepo.findById(id);
  if (!existing) throw error('Role not found', 404);

  if ([1, 2].includes(Number(id)) || ['admin', 'customer'].includes(existing.name.toLowerCase())) {
    throw error('Default system roles cannot be deleted', 400);
  }

  await rolesRepo.remove(id);
}
