import { test, expect, loginAs, expectSidebarHasDepartments } from '../fixtures/auth';

/**
 * DEPT-32 — PM blocked from department page
 */
test.describe('DEPT-32 PM blocked from department page', () => {
  test('PM has no Departments in sidebar and direct URL → 403', async ({ page }) => {
    await loginAs(page, 'pm');

    await expectSidebarHasDepartments(page, false);

    await page.goto('/settings/departments');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
  });
});
