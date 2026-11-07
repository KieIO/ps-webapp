import { test, expect, loginAs } from '../fixtures/auth';

/**
 * TITLE-38 / A1+B1 — Title page tabs, Job titles columns, create chrome (Admin)
 */
test.describe('TITLE-38 Title page tabs + create chrome', () => {
  test('Admin sees three tabs, Job titles columns, and create buttons', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/titles');

    await expect(page.getByRole('heading', { name: 'Title management' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Job titles' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Job levels' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Job groups' })).toBeVisible();

    await expect(page.getByRole('button', { name: /Create job title/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Code' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Job level' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Job group' })).toBeVisible();
    await expect(page.getByText(/\d+ total/)).toBeVisible();

    await page.getByRole('tab', { name: 'Job levels' }).click();
    await expect(page.getByRole('button', { name: /Create job level/ })).toBeVisible();

    await page.getByRole('tab', { name: 'Job groups' }).click();
    await expect(page.getByRole('button', { name: /Create job group/ })).toBeVisible();
  });
});
