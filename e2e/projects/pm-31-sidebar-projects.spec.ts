import {
  test,
  expect,
  loginAs,
  logout,
  expectSidebarHasProjects,
} from '../fixtures/auth';

/**
 * PM-31 — Sidebar Projects by role
 * Default MANAGE_PROJECTS includes Admin, PM, Employee.
 */
test.describe('PM-31 Sidebar Projects by role', () => {
  test('Projects nav visible for Admin, PM, Employee', async ({ page }) => {
    await loginAs(page, 'admin');
    await expectSidebarHasProjects(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasProjects(page, true);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasProjects(page, true);
  });
});
