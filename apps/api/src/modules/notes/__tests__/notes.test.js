import request from 'supertest';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../../app.js';
import { initModels } from '../../../models/index.js';

import { DATABASE_URL, TEST_DATABASE_URL } from '../../../utils/config.js';
import { createSequelize } from '../../../utils/db.js';

// @todo: src/__tests__/helpers/graphqlHelpers.js

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
    }
  }
`;

const CREATE_QUESTION_MUTATION = `#graphql
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      prompt
    }
  }
`;

const CREATE_NOTE_MUTATION = `#graphql
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      body
      topicId
      questionId
    }
  }
`;

const UPDATE_NOTE_MUTATION = `#graphql
  mutation UpdateNote($id: ID!, $input: UpdateNoteInput!) {
    updateNote(id: $id, input: $input) {
      id
      body
    }
  }
`;

const DELETE_NOTE_MUTATION = `#graphql
  mutation DeleteNote($id: ID!) {
    deleteNote(id: $id)
  }
`;

const NOTES_QUERY = `#graphql
  query Notes {
    notes {
      id
      body
    }
  }
`;

const NOTE_QUERY = `#graphql
  query Note($id: ID!) {
    note(id: $id) {
      id
      body
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
        ...input,
      },
    },
  });

  return response.body.data.createTopic;
}

async function createQuestion(token, topicId, input = {}) {
  const response = await graphql({
    query: CREATE_QUESTION_MUTATION,
    token,
    variables: {
      input: {
        topicId,
        prompt: 'What is a closure?',
        ...input,
      },
    },
  });

  return response.body.data.createQuestion;
}

async function createNote(token, input = {}) {
  const response = await graphql({
    query: CREATE_NOTE_MUTATION,
    token,
    variables: {
      input: {
        body: 'Remember: closures capture scope',
        ...input,
      },
    },
  });

  return response.body;
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

describe('Notes GraphQL ownership', () => {
  beforeEach(async () => {
    await models.User.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
  });

  it('requires authentication to create a note', async () => {
    const response = await graphql({
      query: CREATE_NOTE_MUTATION,
      variables: {
        input: {
          topicId: 1,
          body: 'Some note',
        },
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Unauthorized');
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('creates a note attached to a topic owned by the current user', async () => {
    const user = await registerUser('owner@test.com');
    const topic = await createTopic(user.token);

    const result = await createNote(user.token, { topicId: topic.id });

    expect(result.errors).toBeUndefined();
    expect(result.data.createNote.topicId).toBe(topic.id);
    expect(result.data.createNote.questionId).toBeNull();

    const stored = await models.Note.findByPk(result.data.createNote.id);
    expect(stored.userId).toBe(Number(user.user.id));
  });

  it('creates a note attached to a question owned by the current user', async () => {
    const user = await registerUser('owner2@test.com');
    const topic = await createTopic(user.token);
    const question = await createQuestion(user.token, topic.id);

    const result = await createNote(user.token, { questionId: question.id });

    expect(result.errors).toBeUndefined();
    expect(result.data.createNote.questionId).toBe(question.id);
    expect(result.data.createNote.topicId).toBeNull();
  });

  it('rejects a note with both topicId and questionId (XOR violation)', async () => {
    const user = await registerUser('both-parents@test.com');
    const topic = await createTopic(user.token);
    const question = await createQuestion(user.token, topic.id);

    const result = await createNote(user.token, {
      topicId: topic.id,
      questionId: question.id,
    });

    expect(result.errors).toBeDefined();
    expect(result.errors[0].extensions.code).toBe('VALIDATION_ERROR');
    expect(result.data?.createNote).toBeFalsy();
  });

  it('rejects a note with neither topicId nor questionId (XOR violation)', async () => {
    const user = await registerUser('no-parent@test.com');

    const result = await createNote(user.token, {});

    expect(result.errors).toBeDefined();
    expect(result.errors[0].extensions.code).toBe('VALIDATION_ERROR');
    expect(result.data?.createNote).toBeFalsy();
  });

  it('rejects attaching a note to another user topic', async () => {
    const userA = await registerUser('topic-owner@test.com');
    const userB = await registerUser('note-creator@test.com');
    const topic = await createTopic(userA.token);

    const result = await createNote(userB.token, { topicId: topic.id });

    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toBe('Not found');
    expect(result.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(result.data?.createNote).toBeFalsy();
  });

  it('rejects attaching a note to another user question', async () => {
    const userA = await registerUser('question-owner@test.com');
    const userB = await registerUser('note-creator-2@test.com');
    const topic = await createTopic(userA.token);
    const question = await createQuestion(userA.token, topic.id);

    const result = await createNote(userB.token, { questionId: question.id });

    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toBe('Not found');
    expect(result.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(result.data?.createNote).toBeFalsy();
  });

  it('lists only notes owned by the current user', async () => {
    const userA = await registerUser('user-a@test.com');
    const userB = await registerUser('user-b@test.com');
    const topicA = await createTopic(userA.token);

    await createNote(userA.token, { topicId: topicA.id });

    const response = await graphql({
      query: NOTES_QUERY,
      token: userB.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.notes).toEqual([]);
  });

  it('does not return another user note by id', async () => {
    const userA = await registerUser('detail-a@test.com');
    const userB = await registerUser('detail-b@test.com');
    const topic = await createTopic(userA.token);
    const created = await createNote(userA.token, { topicId: topic.id });

    const response = await graphql({
      query: NOTE_QUERY,
      token: userB.token,
      variables: {
        id: created.data.createNote.id,
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(response.body.data.note).toBeNull();
  });

  it('rejects updating another user note', async () => {
    const userA = await registerUser('update-a@test.com');
    const userB = await registerUser('update-b@test.com');
    const topic = await createTopic(userA.token);
    const created = await createNote(userA.token, { topicId: topic.id });

    const response = await graphql({
      query: UPDATE_NOTE_MUTATION,
      token: userB.token,
      variables: {
        id: created.data.createNote.id,
        input: {
          body: 'Hacked note',
        },
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('rejects deleting another user note', async () => {
    const userA = await registerUser('delete-a@test.com');
    const userB = await registerUser('delete-b@test.com');
    const topic = await createTopic(userA.token);
    const created = await createNote(userA.token, { topicId: topic.id });

    const response = await graphql({
      query: DELETE_NOTE_MUTATION,
      token: userB.token,
      variables: {
        id: created.data.createNote.id,
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('updates and deletes notes owned by the current user', async () => {
    const user = await registerUser('owner-actions@test.com');
    const topic = await createTopic(user.token);
    const created = await createNote(user.token, { topicId: topic.id });

    const updateResponse = await graphql({
      query: UPDATE_NOTE_MUTATION,
      token: user.token,
      variables: {
        id: created.data.createNote.id,
        input: {
          body: 'Updated body',
        },
      },
    });

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateNote.body).toBe('Updated body');

    const deleteResponse = await graphql({
      query: DELETE_NOTE_MUTATION,
      token: user.token,
      variables: {
        id: created.data.createNote.id,
      },
    });

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteNote).toBe(true);

    const stored = await models.Note.findByPk(created.data.createNote.id);
    expect(stored).toBeNull();
  });
});
