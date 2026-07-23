export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.extensions = { code: 'NOT_FOUND' };
  }
}

export function requireAuth(user) {
  if (!user) {
    const err = new Error('Unauthorized');

    err.extensions = { code: 'UNAUTHENTICATED' };
    throw err;
  }
}

export async function findOwnedRecord(model, id, userId) {
  const record = await model.findOne({
    where: {
      id,
      userId,
    },
  });

  if (!record) {
    throw new NotFoundError();
  }

  return record;
}
