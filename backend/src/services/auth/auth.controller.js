import { success } from '../../utils/response.js';
import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    const result = await authService.register({ email, password, firstName, lastName, phone });
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, identifier, password } = req.body;
    const loginId = identifier || email;
    if (!loginId || !password) {
      return res.status(400).json({ success: false, error: 'Email / Mobile number and password are required' });
    }
    const result = await authService.login({ identifier: loginId, password });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}
