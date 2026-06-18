import { expect, test } from '@playwright/test';

test('shows the application shell', async ({ page }) => {
  await page.route('**/api/graphql', async (route) => {
    await route.fulfill({
      json: {
        data: {
          health: {
            status: 'ok',
            service: 'prep-tracker-api',
            database: 'not_configured',
          },
        },
      },
    });
  });

  await page.goto('/health');

  await expect(page.getByRole('heading', { name: 'Infrastructure is wired.' })).toBeVisible();
  await expect(page.getByText('Prep Tracker')).toBeVisible();
  await expect(page.getByText('not_configured')).toBeVisible();
});
