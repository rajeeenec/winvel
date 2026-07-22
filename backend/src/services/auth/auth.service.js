import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { error } from '../../utils/response.js';
import * as authRepo from './auth.repository.js';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

export async function register({ email, password, firstName, lastName }) {
  const existing = await authRepo.findUserByEmail(email);
  if (existing) throw error('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await authRepo.createUser({
    email,
    passwordHash,
    firstName,
    lastName,
  });

  const token = generateToken(user);
  return { user, token };
}

export async function login({ email, password }) {
  const user = await authRepo.findUserByEmail(email);
  if (!user || !user.is_active) throw error('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw error('Invalid credentials', 401);

  const token = generateToken(user);
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function getProfile(userId) {
  const user = await authRepo.findUserById(userId);
  if (!user) throw error('User not found', 404);
  return user;
}
