import { success } from '../../utils/response.js';
import * as rolesService from './roles.service.js';

export async function getRoles(req, res, next) {
  try {
    const roles = await rolesService.getRoles();
    return success(res, roles);
  } catch (err) {
    next(err);
  }
}

export async function getRole(req, res, next) {
  try {
    const role = await rolesService.getRoleById(parseInt(req.params.id));
    return success(res, role);
  } catch (err) {
    next(err);
  }
}

export async function getPermissions(req, res, next) {
  try {
    const permissions = await rolesService.getPermissions();
    return success(res, permissions);
  } catch (err) {
    next(err);
  }
}

export async function createRole(req, res, next) {
  try {
    const role = await rolesService.createRole(req.body);
    return success(res, role, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateRole(req, res, next) {
  try {
    const role = await rolesService.updateRole(parseInt(req.params.id), req.body);
    return success(res, role);
  } catch (err) {
    next(err);
  }
}

export async function deleteRole(req, res, next) {
  try {
    await rolesService.deleteRole(parseInt(req.params.id));
    return success(res, { message: 'Role deleted successfully' });
  } catch (err) {
    next(err);
  }
}
