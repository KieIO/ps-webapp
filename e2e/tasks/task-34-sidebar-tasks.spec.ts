import { test, expect, loginAs, logout, expectSidebarHasTaskNav } from '../fixtures/auth';

/**
 * TASK-34 — Sidebar Task management by role
 * Default: Task management children (Project Tasks / Non-project) for all seed roles.
 */
test.describe('TASK-34 Sidebar Task management by role', () => {
  test('Project Tasks + Non-project visible for Admin, PM, Employee', async ({ page }) => {
    await loginAs(page, 'admin');
    await expectSidebarHasTaskNav(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasTaskNav(page, true);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasTaskNav(page, true);
  });
});
