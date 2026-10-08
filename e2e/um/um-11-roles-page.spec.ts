import { test, expect, loginAs } from '../fixtures/auth';

/**
 * UM-11 — Open Roles matrix (Admin)
 * Manual: Sidebar → Roles (`/roles`) → permission matrix loads.
 */
test.describe('UM-11 Open Roles matrix (Admin)', () => {
  test('admin can open /roles and see permission matrix', async ({ page }) => {
    await loginAs(page, 'admin');

    await page.goto('/roles');
    await expect(page).toHaveURL(/\/roles/);
    await expect(page.getByRole('heading', { name: 'Roles & Permissions' })).toBeVisible();
    await expect(page.getByText('Permission matrix')).toBeVisible();
    // Matrix has role columns
    await expect(page.getByRole('columnheader', { name: 'Admin' })).toBeVisible();
  });
});
