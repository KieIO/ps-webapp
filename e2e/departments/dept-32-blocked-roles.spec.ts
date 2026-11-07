import { test, expect, loginAs, expectSidebarHasDepartments } from '../fixtures/auth';

/**
 * DEPT-32 / A3–A6 — Blocked roles cannot open /settings/departments
 */
test.describe('DEPT-32 Blocked roles from department page', () => {
  for (const role of ['pm', 'employee', 'creative_manager'] as const) {
    test(`${role} has no Departments nav and direct URL → 403`, async ({ page }) => {
      await loginAs(page, role);
      await expectSidebarHasDepartments(page, false);

      await page.goto('/settings/departments');
      await expect(page).toHaveURL(/\/403/);
      await expect(page.getByText('Access denied')).toBeVisible();
    });
  }
});
