import { success } from '../../utils/response.js';
import * as usersService from './users.service.js';

export async function getUsers(req, res, next) {
  try {
    const { role } = req.query;
    const users = await usersService.getUsers({ role });
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

export async function toggleUserStatus(req, res, next) {
  try {
    const { isActive } = req.body;
    const user = await usersService.toggleUserStatus(parseInt(req.params.id), isActive);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}
