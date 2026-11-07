import { test, expect, loginAs, logout, expectSidebarHasDepartments } from '../fixtures/auth';

/**
 * DEPT-30 / A1–A6 — Sidebar Department management by role
 * Default MANAGE_DEPARTMENTS: Admin / Head / Creative Head; not PM / Employee / CM.
 */
test.describe('DEPT-30 Sidebar Department management by role', () => {
  test('visible for Admin/Head/CH; hidden for PM/Employee/CM', async ({ page }) => {
    await loginAs(page, 'admin');
    await expectSidebarHasDepartments(page, true);
    await logout(page);

    await loginAs(page, 'head');
    await expectSidebarHasDepartments(page, true);
    await logout(page);

    await loginAs(page, 'creative_head');
    await expectSidebarHasDepartments(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasDepartments(page, false);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasDepartments(page, false);
    await logout(page);

    await loginAs(page, 'creative_manager');
    await expectSidebarHasDepartments(page, false);
  });
});
