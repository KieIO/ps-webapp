import {
  test,
  expect,
  loginAs,
  logout,
  expectSidebarHasDepartments,
} from '../fixtures/auth';

/**
 * DEPT-30 — Sidebar Department management by role
 * Default MANAGE_DEPARTMENTS: Admin / Head / Creative Head; not PM / Employee.
 */
test.describe('DEPT-30 Sidebar Department management by role', () => {
  test('Department management visible for Admin/Head; hidden for PM/Employee', async ({
    page,
  }) => {
    await loginAs(page, 'admin');
    await expectSidebarHasDepartments(page, true);
    await logout(page);

    await loginAs(page, 'head');
    await expectSidebarHasDepartments(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasDepartments(page, false);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasDepartments(page, false);
  });
});
