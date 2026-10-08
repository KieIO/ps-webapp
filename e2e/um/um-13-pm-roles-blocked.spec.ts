import { test, expect, loginAs, expectSidebarHasRoles } from '../fixtures/auth';

/**
 * UM-13 — PM cannot access Roles page
 * Manual: Roles not in sidebar; direct URL blocked / not usable for edit.
 */
test.describe('UM-13 PM cannot access Roles page', () => {
  test('PM has no Roles in sidebar and /roles redirects to forbidden', async ({ page }) => {
    await loginAs(page, 'pm');

    await expectSidebarHasRoles(page, false);

    await page.goto('/roles');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
  });
});
