import {
  test,
  expect,
  loginAs,
  logout,
  expectSidebarHasClientManagement,
} from '../fixtures/auth';

/**
 * CLIENT-41 — Sidebar Client management by role
 * Default MANAGE_CLIENTS: creative_head, head, admin.
 */
test.describe('CLIENT-41 Sidebar Client management by role', () => {
  test('Client management visible for Admin/Head; hidden for PM/Employee', async ({ page }) => {
    await loginAs(page, 'admin');
    await expectSidebarHasClientManagement(page, true);
    await logout(page);

    await loginAs(page, 'head');
    await expectSidebarHasClientManagement(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasClientManagement(page, false);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasClientManagement(page, false);
  });
});
