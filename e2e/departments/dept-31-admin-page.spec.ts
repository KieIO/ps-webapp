import { test, expect, loginAs } from '../fixtures/auth';

/**
 * DEPT-31 / B1+B2 — Admin opens /settings/departments list chrome
 */
test.describe('DEPT-31 Admin opens department management page', () => {
  test('admin sees header, columns, Create button, and seeded rows', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/departments');

    await expect(page).toHaveURL(/\/settings\/departments/);
    await expect(page.getByRole('heading', { name: 'Department management' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create department/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Code' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Description' })).toBeVisible();
    await expect(page.getByText(/\d+ total/)).toBeVisible();

    await expect(page.getByRole('cell', { name: 'project', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'creative', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'admin', exact: true })).toBeVisible();
  });
});
