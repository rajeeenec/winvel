import { success } from '../../utils/response.js';
import * as usersService from './users.service.js';

export async function getUsers(req, res, next) {
  try {
    const { role, type } = req.query;
    const users = await usersService.getUsers({ role, type });
    return success(res, users);
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await usersService.getUserById(parseInt(req.params.id));
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const user = await usersService.createUser(req.body);
    return success(res, user, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await usersService.updateUser(parseInt(req.params.id), req.body);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function toggleUserStatus(req, res, next) {
  try {
    const { isActive } = req.body;
    const user = await usersService.toggleUserStatus(parseInt(req.params.id), isActive);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}
