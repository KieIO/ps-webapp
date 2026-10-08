import { test, expect, loginAs } from '../fixtures/auth';

/**
 * TITLE-38 — Title page tabs + create chrome (Admin)
 */
test.describe('TITLE-38 Title page tabs + create chrome', () => {
  test('Admin sees three tabs and create buttons', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/titles');

    await expect(page.getByRole('heading', { name: 'Title management' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Job titles' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Job levels' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Job groups' })).toBeVisible();

    await expect(page.getByRole('button', { name: /Create job title/ })).toBeVisible();

    await page.getByRole('tab', { name: 'Job levels' }).click();
    await expect(page.getByRole('button', { name: /Create job level/ })).toBeVisible();

    await page.getByRole('tab', { name: 'Job groups' }).click();
    await expect(page.getByRole('button', { name: /Create job group/ })).toBeVisible();
  });
});
