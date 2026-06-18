import { verifyToken } from '../utils/jwt.js';

// #1: JWT-only
// Context: { user: { id: 5 } }
// Resolver: const user = await User.findByPk(context.user.id);
// Pros: no database query during authentication.
// Cons: user data must be loaded on demand.

// #2: DB-backed
// Context:
// {
//   user: {
//     id: 5,
//     email: 'john@test.com',
//     displayName: 'John'
//   }
// }
// Resolver: return context.user;
// Pros: user data is immediately available.
// Cons: one database query per authenticated request.

// #3 DB-backed + DataLoader
// Context: { user, loaders }
// Resolver: loaders.userLoader.load(user.id)
// Batching + request-level cache.

export function createContext({ req, models, sequelize }) {
  const authHeader = req.headers.authorization;
  let user = null;

  if (authHeader?.startsWith('Bearer ')) {
    const [, token] = authHeader.split(' ');
    const payload = verifyToken(token);

    if (payload?.sub) {
      user = {
        id: payload.sub,
      };
    }
  }

  return {
    req,
    models,
    sequelize,
    user,
  };
}
