import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes: verify JWT and attach user to request
export const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'User not found for token' });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Authorize roles
export const roleGuard = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  return next();
};