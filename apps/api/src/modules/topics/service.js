import { requireAuth, findOwnedRecord } from '../auth/authorization.js';

export async function getTopic({ models, user, id }) {
  requireAuth(user);

  return models.Topic.findOne({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function getTopics({ models, user }) {
  requireAuth(user);

  return models.Topic.findAll({
    where: {
      userId: user.id,
    },
  });
}

export async function createTopic({ models, user, input }) {
  requireAuth(user);

  return models.Topic.create({
    ...input,
    userId: user.id,
  });
}

export async function updateTopic({ models, user, id, input }) {
  requireAuth(user);

  const topic = await findOwnedRecord(models.Topic, id, user.id);

  return topic.update(input);
}

export async function deleteTopic({ models, user, id }) {
  requireAuth(user);

  const topic = await findOwnedRecord(models.Topic, id, user.id);
  await topic.destroy();

  return true;
}
