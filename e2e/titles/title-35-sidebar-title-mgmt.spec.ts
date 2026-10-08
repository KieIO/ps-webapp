import {
  test,
  expect,
  loginAs,
  logout,
  expectSidebarHasTitleManagement,
} from '../fixtures/auth';

/**
 * TITLE-35 — Sidebar Title management by role
 * Default MANAGE_TITLES: Admin / Head / Creative Head yes; PM / Employee no.
 */
test.describe('TITLE-35 Sidebar Title management by role', () => {
  test('Title management visible for Admin/Head; hidden for PM/Employee', async ({ page }) => {
    await loginAs(page, 'admin');
    await expectSidebarHasTitleManagement(page, true);
    await logout(page);

    await loginAs(page, 'head');
    await expectSidebarHasTitleManagement(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasTitleManagement(page, false);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasTitleManagement(page, false);
  });
});
