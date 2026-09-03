import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.user?.role ? String(req.user.role).toLowerCase() : '';
    const allowedRoles = roles.map((r) => String(r).toLowerCase());

    const isAdmin = userRole === 'admin' || userRole === 'super admin';
    const isAllowed = allowedRoles.some((r) => r === userRole || (r === 'admin' && isAdmin));

    if (!req.user || !isAllowed) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
}
