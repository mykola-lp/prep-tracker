import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { createApp } from '../app.js';

describe('health endpoints', () => {
  const app = createApp({
    databaseUrl: null,
  });

  test('returns REST health status', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'prep-tracker-api',
      database: 'not_configured',
    });
  });

  test('returns GraphQL health status', async () => {
    const response = await request(app)
      .post('/api/graphql')
      .send({
        query: '{ health { status service database } }',
      })
      .expect(200);

    expect(response.body.data.health).toEqual({
      status: 'ok',
      service: 'prep-tracker-api',
      database: 'not_configured',
    });
  });
});
