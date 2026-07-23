import request from 'supertest';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../../app.js';
import { initModels } from '../../../models/index.js';

import { DATABASE_URL, TEST_DATABASE_URL } from '../../../utils/config.js';
import { createSequelize } from '../../../utils/db.js';

const REGISTER_MUTATION = `#graphql
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
      }
    }
  }
`;

const CREATE_TOPIC_MUTATION = `#graphql
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      title
      description
      status
      deadline
    }
  }
`;

const UPDATE_TOPIC_MUTATION = `#graphql
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

const DELETE_TOPIC_MUTATION = `#graphql
  mutation DeleteTopic($id: ID!) {
    deleteTopic(id: $id)
  }
`;

const TOPICS_QUERY = `#graphql
  query Topics {
    topics {
      id
      title
      description
      status
    }
  }
`;

const TOPIC_QUERY = `#graphql
  query Topic($id: ID!) {
    topic(id: $id) {
      id
      title
      description
      status
    }
  }
`;

let app;
let sequelize;
let models;

async function graphql({ query, variables, token }) {
  const operation = request(app).post('/api/graphql').send({
    query,
    variables,
  });

  if (token) {
    operation.set('Authorization', `Bearer ${token}`);
  }

  return operation;
}

async function registerUser(email) {
  const response = await graphql({
    query: REGISTER_MUTATION,
    variables: {
      input: {
        email,
        password: 'password123',
      },
    },
  });

  return response.body.data.register;
}

async function createTopic(token, input = {}) {
  const response = await graphql({
    query: CREATE_TOPIC_MUTATION,
    token,
    variables: {
      input: {
        title: 'JavaScript',
        description: 'Core language topics',
        ...input,
      },
    },
  });

  return response.body.data.createTopic;
}

beforeAll(async () => {
  sequelize = createSequelize(TEST_DATABASE_URL || DATABASE_URL);

  if (!sequelize) {
    throw new Error(
      'Failed to initialize database connection. TEST_DATABASE_URL or DATABASE_URL may be missing or invalid.'
    );
  }

  models = initModels(sequelize);

  app = await createApp({
    sequelize,
    models,
  });
});

afterAll(async () => {
  if (sequelize) {
    await sequelize.close();
  }
});

describe('Topics GraphQL ownership', () => {
  beforeEach(async () => {
    await models.User.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
  });

  it('requires authentication to create a topic', async () => {
    const response = await graphql({
      query: CREATE_TOPIC_MUTATION,
      variables: {
        input: {
          title: 'JavaScript',
        },
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Unauthorized');
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('creates a topic for the current user', async () => {
    const user = await registerUser('owner@test.com');

    const topic = await createTopic(user.token);

    expect(topic.title).toBe('JavaScript');

    const storedTopic = await models.Topic.findByPk(topic.id);

    expect(storedTopic.userId).toBe(Number(user.user.id));
  });

  it('lists only topics owned by the current user', async () => {
    const userA = await registerUser('user-a@test.com');
    const userB = await registerUser('user-b@test.com');

    await createTopic(userA.token, {
      title: 'User A Topic',
    });

    const response = await graphql({
      query: TOPICS_QUERY,
      token: userB.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.topics).toEqual([]);
  });

  it('does not return another user topic by id', async () => {
    const userA = await registerUser('detail-a@test.com');
    const userB = await registerUser('detail-b@test.com');
    const topic = await createTopic(userA.token, {
      title: 'Private Topic',
    });

    const response = await graphql({
      query: TOPIC_QUERY,
      token: userB.token,
      variables: {
        id: topic.id,
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(response.body.data.topic).toBeNull();
  });

  it('rejects updating another user topic', async () => {
    const userA = await registerUser('update-a@test.com');
    const userB = await registerUser('update-b@test.com');
    const topic = await createTopic(userA.token);

    const response = await graphql({
      query: UPDATE_TOPIC_MUTATION,
      token: userB.token,
      variables: {
        id: topic.id,
        input: {
          status: 'learning',
        },
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('rejects deleting another user topic', async () => {
    const userA = await registerUser('delete-a@test.com');
    const userB = await registerUser('delete-b@test.com');
    const topic = await createTopic(userA.token);

    const response = await graphql({
      query: DELETE_TOPIC_MUTATION,
      token: userB.token,
      variables: {
        id: topic.id,
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('updates and deletes topics owned by the current user', async () => {
    const user = await registerUser('owner-actions@test.com');
    const topic = await createTopic(user.token);

    const updateResponse = await graphql({
      query: UPDATE_TOPIC_MUTATION,
      token: user.token,
      variables: {
        id: topic.id,
        input: {
          status: 'learning',
        },
      },
    });

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateTopic.status).toBe('learning');

    const deleteResponse = await graphql({
      query: DELETE_TOPIC_MUTATION,
      token: user.token,
      variables: {
        id: topic.id,
      },
    });

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteTopic).toBe(true);

    const storedTopic = await models.Topic.findByPk(topic.id);

    expect(storedTopic).toBeNull();
  });
});
