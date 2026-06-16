import request from 'supertest';
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../../app.js';
import { createSequelize } from '../../../utils/db.js';
import { initModels } from '../../../models/index.js';
import { DATABASE_URL } from '../../../utils/config.js';

const REGISTER_MUTATION = `#graphql
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        displayName
      }
    }
  }
`;

const LOGIN_MUTATION = `#graphql
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        displayName
      }
    }
  }
`;

const ME_QUERY = `#graphql
  query {
    me {
      id
      email
      displayName
    }
  }
`;

let app;
let sequelize;
let models;

beforeAll(async () => {
  sequelize = createSequelize(DATABASE_URL);

  models = initModels(sequelize);

  app = await createApp({
    sequelize,
    models,
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth GraphQL', () => {
  beforeEach(async () => {
    await models.User.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
  });

  it('registers a new user', async () => {
    const response = await request(app)
      .post('/api/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: {
          input: {
            email: 'test@example.com',
            password: 'password123',
            displayName: 'Test User',
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.register.token).toBeDefined();
    expect(response.body.data.register.user.email).toBe('test@example.com');

    const user = await models.User.findOne({
      where: {
        email: 'test@example.com',
      },
    });

    expect(user).not.toBeNull();
    expect(user.passwordHash).not.toBe('password123');
  });

  it('does not allow duplicate registration', async () => {
    await request(app)
      .post('/api/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: {
          input: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
      });

    const response = await request(app)
      .post('/api/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: {
          input: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
      });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('User already exists');
  });

  it('logs in existing user', async () => {
    await request(app)
      .post('/api/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: {
          input: {
            email: 'login@test.com',
            password: 'password123',
          },
        },
      });

    const response = await request(app)
      .post('/api/graphql')
      .send({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            email: 'login@test.com',
            password: 'password123',
          },
        },
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.login.token).toBeDefined();
    expect(response.body.data.login.user.email).toBe('login@test.com');
  });

  it('rejects invalid password', async () => {
    await request(app)
      .post('/api/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: {
          input: {
            email: 'wrong@test.com',
            password: 'password123',
          },
        },
      });

    const response = await request(app)
      .post('/api/graphql')
      .send({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            email: 'wrong@test.com',
            password: 'wrong-password',
          },
        },
      });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Invalid credentials');
  });

  it('returns current user with valid token', async () => {
    const registerResponse = await request(app)
      .post('/api/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: {
          input: {
            email: 'me@test.com',
            password: 'password123',
            displayName: 'Me User',
          },
        },
      });

    const token = registerResponse.body.data.register.token;

    const response = await request(app)
      .post('/api/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: ME_QUERY,
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.me.email).toBe('me@test.com');
  });

  it('returns null for me without token', async () => {
    const response = await request(app).post('/api/graphql').send({
      query: ME_QUERY,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.me).toBeNull();
  });
});
