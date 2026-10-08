import { test, expect, loginAs } from '../fixtures/auth';

/**
 * CLIENT-42 — Create client button on settings page
 * UI: Admin on /settings/clients sees Create client.
 */
test.describe('CLIENT-42 Create client button', () => {
  test('Admin sees Create client on /settings/clients', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/clients');
    await expect(page.getByRole('heading', { name: 'Client management' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create client/ })).toBeVisible();

    await page.getByRole('button', { name: /Create client/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Create client')).toBeVisible();
  });
});
