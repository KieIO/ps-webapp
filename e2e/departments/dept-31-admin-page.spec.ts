import { test, expect, loginAs } from '../fixtures/auth';

/**
 * DEPT-31 — Admin opens /settings/departments
 */
test.describe('DEPT-31 Admin opens department management page', () => {
  test('admin sees page header, table, and Create department button', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/departments');

    await expect(page).toHaveURL(/\/settings\/departments/);
    await expect(page.getByRole('heading', { name: 'Department management' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create department/ })).toBeVisible();
    // Seeded rows (project / creative / admin)
    await expect(page.getByRole('cell', { name: 'project', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'creative', exact: true })).toBeVisible();
  });
});
