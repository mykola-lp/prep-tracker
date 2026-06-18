import { requireAuth } from '../auth/authorization.js';

export async function getTopics({ models, user }) {
  requireAuth(user);

  return models.Topic.findAll({
    where: {
      userId: user.id,
    },
  });
}
