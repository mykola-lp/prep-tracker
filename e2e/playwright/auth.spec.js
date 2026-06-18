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

const ME_QUERY = `#graphql
  query {
    me {
      id
      email
      displayName
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

test.describe('auth flow', () => {
  test('shows the login form on /login', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('registers through the API, logs in from the UI, and loads me with the token', async ({
    page,
  }) => {
    const email = `auth-${randomUUID()}@example.com`;
    const password = 'password123';

    await registerUser(page.request, {
      email,
      password,
      displayName: 'Auth User',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();

    const meResponse = await page.request.post('/api/graphql', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        query: ME_QUERY,
      },
    });

    expect(meResponse.ok()).toBeTruthy();

    const meBody = await meResponse.json();
    expect(meBody.errors).toBeUndefined();
    expect(meBody.data.me.email).toBe(email);
    expect(meBody.data.me.displayName).toBe('Auth User');
  });
});
