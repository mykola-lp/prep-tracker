import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';

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

const CREATE_QUESTION_MUTATION = `#graphql
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      topicId
      prompt
      answer
      status
      deadline
    }
  }
`;

async function registerUser(request, user) {
  const response = await request.post('/api/graphql', {
    data: {
      query: REGISTER_MUTATION,
      variables: {
        input: user,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.register;
}

async function createTopic(request, token, input) {
  const response = await request.post('/api/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      query: CREATE_TOPIC_MUTATION,
      variables: {
        input,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.createTopic;
}

async function createQuestion(request, token, input) {
  const response = await request.post('/api/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      query: CREATE_QUESTION_MUTATION,
      variables: {
        input,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.createQuestion;
}

test.describe('notes flow', () => {
  test('renders notes list with parent metadata for the current user', async ({ page }) => {
    const email = `notes-${randomUUID()}@example.com`;
    const password = 'password123';
    const user = await registerUser(page.request, {
      email,
      password,
      displayName: 'Notes User',
    });

    const topic = await createTopic(page.request, user.token, {
      title: 'JavaScript',
      description: 'Core language topics',
      deadline: '2026-08-20',
    });

    const question = await createQuestion(page.request, user.token, {
      topicId: topic.id,
      prompt: 'What is a closure?',
      deadline: '2026-08-21',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Notes' }).click();

    await expect(page.getByRole('heading', { name: 'Capture study notes quickly' })).toBeVisible();

    const form = page.locator('form').first();
    const selects = form.locator('select');
    await selects.nth(0).selectOption('topic');
    await selects.nth(1).selectOption(topic.id);
    await form.getByLabel('Body').fill('Review scope and lexical environment.');
    await page.getByRole('button', { name: 'Create note' }).click();

    await expect(
      page.getByRole('heading', { name: 'Review scope and lexical environment.' })
    ).toBeVisible();
    await expect(page.getByText('topic', { exact: true })).toBeVisible();
    await expect(page.getByText('Topic: JavaScript')).toBeVisible();

    await selects.nth(0).selectOption('question');
    await selects.nth(1).selectOption(question.id);
    await form.getByLabel('Body').fill('Answer with a concrete example.');
    await page.getByRole('button', { name: 'Create note' }).click();

    await expect(
      page.getByRole('heading', { name: 'Answer with a concrete example.' })
    ).toBeVisible();
    await expect(page.getByText('question', { exact: true })).toBeVisible();
    await expect(page.getByText('Question: What is a closure?')).toBeVisible();
  });

  test('creates, edits, and deletes a note through the UI', async ({ page }) => {
    const email = `notes-${randomUUID()}@example.com`;
    const password = 'password123';
    const user = await registerUser(page.request, {
      email,
      password,
      displayName: 'Notes User',
    });

    const topic = await createTopic(page.request, user.token, {
      title: 'System design',
      description: 'Scaling and architecture',
      deadline: '2026-08-30',
    });

    const question = await createQuestion(page.request, user.token, {
      topicId: topic.id,
      prompt: 'How do you scale reads?',
      deadline: '2026-08-31',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Notes' }).click();

    const form = page.locator('form').first();
    const selects = form.locator('select');
    await selects.nth(0).selectOption('question');
    await selects.nth(1).selectOption(question.id);
    await form.getByLabel('Body').fill('Use replicas, caching, and queues.');
    await page.getByRole('button', { name: 'Create note' }).click();

    await expect(
      page.getByRole('heading', { name: 'Use replicas, caching, and queues.' })
    ).toBeVisible();
    await expect(page.getByText('question', { exact: true })).toBeVisible();
    await expect(page.getByText('Question: How do you scale reads?')).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).last().click();
    await expect(page.getByRole('heading', { name: 'Edit note' })).toBeVisible();

    await page.getByLabel('Body').fill('Use replicas, caching, queues, and retries.');
    await page.getByRole('button', { name: 'Update note' }).click();

    await expect(
      page.getByRole('heading', { name: 'Use replicas, caching, queues, and retries.' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).last().click();
    await expect(page.getByRole('button', { name: 'Confirm delete' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('button', { name: 'Confirm delete' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Delete' }).last().click();
    await page.getByRole('button', { name: 'Confirm delete' }).click();

    await expect(
      page.getByRole('heading', { name: 'Use replicas, caching, queues, and retries.' })
    ).toHaveCount(0);
  });

  test('shows the empty state for a user without notes', async ({ page }) => {
    const email = `notes-${randomUUID()}@example.com`;
    const password = 'password123';

    await registerUser(page.request, {
      email,
      password,
      displayName: 'Notes User',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Notes' }).click();

    await expect(page.getByText('No notes yet.')).toBeVisible();
    await expect(page.getByText('Capture study notes quickly')).toBeVisible();
  });

  test('shows a validation error when body is missing', async ({ page }) => {
    const email = `notes-${randomUUID()}@example.com`;
    const password = 'password123';
    const user = await registerUser(page.request, {
      email,
      password,
      displayName: 'Notes User',
    });

    const topic = await createTopic(page.request, user.token, {
      title: 'JavaScript',
      description: 'Core language topics',
      deadline: '2026-08-20',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Notes' }).click();
    const form = page.locator('form').first();
    const selects = form.locator('select');
    await selects.nth(0).selectOption('topic');
    await selects.nth(1).selectOption(topic.id);
    await page.getByRole('button', { name: 'Create note' }).click();

    await expect(page.getByRole('alert')).toHaveText('Note body is required.');
  });
});
