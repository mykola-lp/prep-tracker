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

const UPDATE_TOPIC_MUTATION = `#graphql
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
      id
      title
      description
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

async function updateTopic(request, token, id, input) {
  const response = await request.post('/api/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      query: UPDATE_TOPIC_MUTATION,
      variables: {
        id,
        input,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.updateTopic;
}

test.describe('topics flow', () => {
  test('renders topics list with metadata for the current user', async ({ page }) => {
    const email = `topics-${randomUUID()}@example.com`;
    const password = 'password123';
    const user = await registerUser(page.request, {
      email,
      password,
      displayName: 'Topics User',
    });

    const topic = await createTopic(page.request, user.token, {
      title: 'JavaScript',
      description: 'Core language topics',
      deadline: '2026-08-20',
    });

    await updateTopic(page.request, user.token, topic.id, {
      status: 'learning',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Topics' }).click();

    await expect(page.getByRole('heading', { name: 'Manage your study roadmap' })).toBeVisible();
    const topicCard = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'JavaScript' }) });

    await expect(topicCard.getByRole('heading', { name: 'JavaScript' })).toBeVisible();
    await expect(topicCard.getByText('learning', { exact: true })).toBeVisible();
    await expect(topicCard.getByText('2026-08-20')).toBeVisible();
    await expect(topicCard.getByText('Core language topics')).toBeVisible();
  });

  test('creates, edits, and deletes a topic through the UI', async ({ page }) => {
    const email = `topics-${randomUUID()}@example.com`;
    const password = 'password123';
    const user = await registerUser(page.request, {
      email,
      password,
      displayName: 'Topics User',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Topics' }).click();

    await page.getByLabel('Title').fill('System design');
    await page.getByLabel('Description').fill('APIs, databases, scaling');
    await page.getByLabel('Deadline').fill('2026-08-25');
    await page.getByRole('button', { name: 'Create topic' }).click();

    await expect(page.getByRole('heading', { name: 'System design' })).toBeVisible();
    await expect(page.getByText('new', { exact: true })).toBeVisible();
    await expect(page.getByText('2026-08-25')).toBeVisible();
    await expect(page.getByText('APIs, databases, scaling')).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).last().click();
    await expect(page.getByRole('heading', { name: 'Edit topic' })).toBeVisible();

    await page.getByLabel('Title').fill('System design updated');
    await page.getByLabel('Description').fill('Updated description');
    await page.getByLabel('Status').selectOption('done');
    await page.getByLabel('Deadline').fill('2026-08-28');
    await page.getByRole('button', { name: 'Update topic' }).click();

    await expect(page.getByRole('heading', { name: 'System design updated' })).toBeVisible();
    await expect(page.getByText('done')).toBeVisible();
    await expect(page.getByText('2026-08-28')).toBeVisible();
    await expect(page.getByText('Updated description')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).last().click();
    await expect(page.getByRole('button', { name: 'Confirm delete' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('button', { name: 'Confirm delete' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Delete' }).last().click();
    await page.getByRole('button', { name: 'Confirm delete' }).click();

    await expect(page.getByRole('heading', { name: 'System design updated' })).toHaveCount(0);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();

    const remainingTopic = await page.request.post('/api/graphql', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        query: `#graphql
          query {
            topics {
              id
              title
            }
          }
        `,
      },
    });

    expect(remainingTopic.ok()).toBeTruthy();
    const remainingBody = await remainingTopic.json();
    expect(remainingBody.errors).toBeUndefined();
    expect(remainingBody.data.topics.some((topic) => topic.title === 'System design updated')).toBe(
      false
    );
  });

  test('shows the empty state for a user without topics', async ({ page }) => {
    const email = `topics-${randomUUID()}@example.com`;
    const password = 'password123';

    await registerUser(page.request, {
      email,
      password,
      displayName: 'Topics User',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Topics' }).click();

    await expect(page.getByText('No topics yet.')).toBeVisible();
    await expect(page.getByText('Create your first topic to start organizing prep.')).toBeVisible();
  });

  test('shows a validation error when title is missing', async ({ page }) => {
    const email = `topics-${randomUUID()}@example.com`;
    const password = 'password123';

    await registerUser(page.request, {
      email,
      password,
      displayName: 'Topics User',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Topics' }).click();
    await page.getByRole('button', { name: 'Create topic' }).click();

    await expect(page.getByRole('alert')).toHaveText('Topic title is required.');
  });
});
