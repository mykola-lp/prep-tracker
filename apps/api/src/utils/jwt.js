import jwt from 'jsonwebtoken';

import { JWT_SECRET } from './config.js';

function getJWTSecret() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return JWT_SECRET;
}

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    getJWTSecret(),
    {
      expiresIn: '7d',
    }
  );
}

export function verifyToken(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, getJWTSecret());
  } catch {
    return null;
  }
}
