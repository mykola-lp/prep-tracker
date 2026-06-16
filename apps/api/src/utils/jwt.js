import jwt from 'jsonwebtoken';

import { JWT_SECRET } from './config.js';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
}

export function verifyToken(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') return null;
    if (error.name === 'JsonWebTokenError') return null;

    return null;
  }
}
