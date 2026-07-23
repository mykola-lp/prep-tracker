import bcrypt from 'bcrypt';

import { signToken } from '../../utils/jwt.js';

export async function getCurrentUser({ models, userId }) {
  if (!userId) {
    return null;
  }

  return models.User.findByPk(userId);
}

export async function registerUser({ models, email, password, displayName }) {
  if (!email?.trim()) {
    throw new Error('Email is required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const existing = await models.User.findOne({
    where: { email },
  });

  if (existing) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await models.User.create({
    email,
    passwordHash,
    displayName,
  });

  const token = signToken(user);

  return { user, token };
}

export async function loginUser({ models, email, password }) {
  const user = await models.User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const token = signToken(user);

  return { user, token };
}
