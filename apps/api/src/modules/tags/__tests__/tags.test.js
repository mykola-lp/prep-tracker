import request from 'supertest';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../../app.js';
import { initModels } from '../../../models/index.js';

import { DATABASE_URL } from '../../../utils/config.js';
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
      status
    }
  }
`;

const CREATE_TAG_MUTATION = `#graphql
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      name
    }
  }
`;

const DELETE_TAG_MUTATION = `#graphql
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`;

const TAGS_QUERY = `#graphql
  query Tags {
    tags {
      id
      name
    }
  }
`;

const ADD_TAG_TO_TOPIC_MUTATION = `#graphql
  mutation AddTagToTopic($topicId: ID!, $tagId: ID!) {
    addTagToTopic(topicId: $topicId, tagId: $tagId) {
      id
      tags {
        id
        name
      }
    }
  }
`;

const REMOVE_TAG_FROM_TOPIC_MUTATION = `#graphql
  mutation RemoveTagFromTopic($topicId: ID!, $tagId: ID!) {
    removeTagFromTopic(topicId: $topicId, tagId: $tagId) {
      id
      tags {
        id
      }
    }
  }
`;

const TOPICS_BY_TAG_QUERY = `#graphql
  query TopicsByTag($tagId: ID, $status: ProgressStatus) {
    topics(tagId: $tagId, status: $status) {
      id
      title
      status
    }
  }
`;

const CREATE_QUESTION_MUTATION = `#graphql
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      prompt
      status
    }
  }
`;

const QUESTIONS_BY_TAG_QUERY = `#graphql
  query QuestionsByTag($tagId: ID, $status: ProgressStatus) {
    questions(tagId: $tagId, status: $status) {
      id
      prompt
      status
    }
  }
`;

const ADD_TAG_TO_QUESTION_MUTATION = `#graphql
  mutation AddTagToQuestion($questionId: ID!, $tagId: ID!) {
    addTagToQuestion(questionId: $questionId, tagId: $tagId) {
      id
      tags {
        id
        name
      }
    }
  }
`;

const CREATE_NOTE_MUTATION = `#graphql
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      body
    }
  }
`;

const NOTES_BY_TAG_QUERY = `#graphql
  query NotesByTag($tagId: ID) {
    notes(tagId: $tagId) {
      id
      body
    }
  }
`;

const ADD_TAG_TO_NOTE_MUTATION = `#graphql
  mutation AddTagToNote($noteId: ID!, $tagId: ID!) {
    addTagToNote(noteId: $noteId, tagId: $tagId) {
      id
      tags {
        id
        name
      }
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

async function createTag(token, name = 'frontend') {
  const response = await graphql({
    query: CREATE_TAG_MUTATION,
    token,
    variables: { input: { name } },
  });

  return response.body;
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

  return response.body.data.createNote;
}

beforeAll(async () => {
  sequelize = createSequelize(DATABASE_URL);

  if (!sequelize) {
    throw new Error(
      'Failed to initialize database connection. DATABASE_URL may be missing or invalid.'
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

describe('Tags GraphQL', () => {
  beforeEach(async () => {
    await models.User.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
  });

  it('requires authentication to create a tag', async () => {
    const response = await graphql({
      query: CREATE_TAG_MUTATION,
      variables: { input: { name: 'frontend' } },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('creates a tag for the current user', async () => {
    const user = await registerUser('owner@test.com');
    const result = await createTag(user.token, 'frontend');

    expect(result.errors).toBeUndefined();
    expect(result.data.createTag.name).toBe('frontend');

    const stored = await models.Tag.findByPk(result.data.createTag.id);
    expect(stored.userId).toBe(Number(user.user.id));
  });

  it('rejects duplicate tag names for the same user', async () => {
    const user = await registerUser('dup@test.com');
    await createTag(user.token, 'frontend');

    const result = await createTag(user.token, 'frontend');

    expect(result.errors).toBeDefined();
    expect(result.errors[0].extensions.code).toBe('VALIDATION_ERROR');
  });

  it('allows different users to have tags with the same name', async () => {
    const userA = await registerUser('user-a@test.com');
    const userB = await registerUser('user-b@test.com');

    const resultA = await createTag(userA.token, 'frontend');
    const resultB = await createTag(userB.token, 'frontend');

    expect(resultA.errors).toBeUndefined();
    expect(resultB.errors).toBeUndefined();
  });

  it('lists only tags owned by the current user', async () => {
    const userA = await registerUser('list-a@test.com');
    const userB = await registerUser('list-b@test.com');
    await createTag(userA.token, 'frontend');

    const response = await graphql({ query: TAGS_QUERY, token: userB.token });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.tags).toEqual([]);
  });

  it('assigns a tag to a topic owned by the current user', async () => {
    const user = await registerUser('assign@test.com');
    const topic = await createTopic(user.token);
    const tagResult = await createTag(user.token, 'frontend');
    const tagId = tagResult.data.createTag.id;

    const response = await graphql({
      query: ADD_TAG_TO_TOPIC_MUTATION,
      token: user.token,
      variables: { topicId: topic.id, tagId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.addTagToTopic.tags).toHaveLength(1);
    expect(response.body.data.addTagToTopic.tags[0].name).toBe('frontend');
  });

  it('rejects assigning another user tag to a topic', async () => {
    const userA = await registerUser('topic-owner@test.com');
    const userB = await registerUser('tag-owner@test.com');
    const topic = await createTopic(userA.token);
    const tagResult = await createTag(userB.token, 'frontend');
    const tagId = tagResult.data.createTag.id;

    const response = await graphql({
      query: ADD_TAG_TO_TOPIC_MUTATION,
      token: userA.token,
      variables: { topicId: topic.id, tagId },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('rejects assigning a tag to another user topic', async () => {
    const userA = await registerUser('topic-owner-2@test.com');
    const userB = await registerUser('tag-owner-2@test.com');
    const topic = await createTopic(userA.token);
    const tagResult = await createTag(userB.token, 'frontend');
    const tagId = tagResult.data.createTag.id;

    const response = await graphql({
      query: ADD_TAG_TO_TOPIC_MUTATION,
      token: userB.token,
      variables: { topicId: topic.id, tagId },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('removes a tag from a topic', async () => {
    const user = await registerUser('remove@test.com');
    const topic = await createTopic(user.token);
    const tagResult = await createTag(user.token, 'frontend');
    const tagId = tagResult.data.createTag.id;

    await graphql({
      query: ADD_TAG_TO_TOPIC_MUTATION,
      token: user.token,
      variables: { topicId: topic.id, tagId },
    });

    const response = await graphql({
      query: REMOVE_TAG_FROM_TOPIC_MUTATION,
      token: user.token,
      variables: { topicId: topic.id, tagId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.removeTagFromTopic.tags).toEqual([]);
  });

  it('deletes a tag owned by the current user', async () => {
    const user = await registerUser('delete-tag@test.com');
    const tagResult = await createTag(user.token, 'frontend');
    const tagId = tagResult.data.createTag.id;

    const response = await graphql({
      query: DELETE_TAG_MUTATION,
      token: user.token,
      variables: { id: tagId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteTag).toBe(true);

    const stored = await models.Tag.findByPk(tagId);
    expect(stored).toBeNull();
  });

  it('rejects deleting another user tag', async () => {
    const userA = await registerUser('delete-a@test.com');
    const userB = await registerUser('delete-b@test.com');
    const tagResult = await createTag(userA.token, 'frontend');
    const tagId = tagResult.data.createTag.id;

    const response = await graphql({
      query: DELETE_TAG_MUTATION,
      token: userB.token,
      variables: { id: tagId },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('filters topics by tag', async () => {
    const user = await registerUser('filter-tag@test.com');
    const topicA = await createTopic(user.token, { title: 'Tagged topic' });
    const topicB = await createTopic(user.token, { title: 'Untagged topic' });
    const tagResult = await createTag(user.token, 'frontend');
    const tagId = tagResult.data.createTag.id;

    await graphql({
      query: ADD_TAG_TO_TOPIC_MUTATION,
      token: user.token,
      variables: { topicId: topicA.id, tagId },
    });

    const response = await graphql({
      query: TOPICS_BY_TAG_QUERY,
      token: user.token,
      variables: { tagId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.topics).toHaveLength(1);
    expect(response.body.data.topics[0].id).toBe(topicA.id);
  });

  it('filters topics by status', async () => {
    const user = await registerUser('filter-status@test.com');
    await createTopic(user.token, { title: 'New topic' });

    const response = await graphql({
      query: TOPICS_BY_TAG_QUERY,
      token: user.token,
      variables: { status: 'new' },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.topics).toHaveLength(1);
    expect(response.body.data.topics[0].status).toBe('new');
  });

  it('filters questions by tag', async () => {
    const user = await registerUser('filter-question-tag@test.com');
    const topic = await createTopic(user.token);
    const questionA = await createQuestion(user.token, topic.id, { prompt: 'Tagged question' });
    await createQuestion(user.token, topic.id, { prompt: 'Untagged question' });
    const tagResult = await createTag(user.token, 'algorithms');
    const tagId = tagResult.data.createTag.id;

    await graphql({
      query: ADD_TAG_TO_QUESTION_MUTATION,
      token: user.token,
      variables: { questionId: questionA.id, tagId },
    });

    const response = await graphql({
      query: QUESTIONS_BY_TAG_QUERY,
      token: user.token,
      variables: { tagId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.questions).toHaveLength(1);
    expect(response.body.data.questions[0].id).toBe(questionA.id);
  });

  it('filters questions by status', async () => {
    const user = await registerUser('filter-question-status@test.com');
    const topic = await createTopic(user.token);
    await createQuestion(user.token, topic.id);

    const response = await graphql({
      query: QUESTIONS_BY_TAG_QUERY,
      token: user.token,
      variables: { status: 'new' },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.questions).toHaveLength(1);
    expect(response.body.data.questions[0].status).toBe('new');
  });

  it('filters notes by tag', async () => {
    const user = await registerUser('filter-note-tag@test.com');
    const topic = await createTopic(user.token);
    const noteA = await createNote(user.token, { topicId: topic.id, body: 'Tagged note' });
    await createNote(user.token, { topicId: topic.id, body: 'Untagged note' });
    const tagResult = await createTag(user.token, 'review');
    const tagId = tagResult.data.createTag.id;

    await graphql({
      query: ADD_TAG_TO_NOTE_MUTATION,
      token: user.token,
      variables: { noteId: noteA.id, tagId },
    });

    const response = await graphql({
      query: NOTES_BY_TAG_QUERY,
      token: user.token,
      variables: { tagId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.notes).toHaveLength(1);
    expect(response.body.data.notes[0].id).toBe(noteA.id);
  });
});
