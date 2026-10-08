import {
  test,
  expect,
  loginAs,
  logout,
  expectSidebarHasUsers,
  expectSidebarHasRoles,
} from '../fixtures/auth';

/**
 * UM-18 — Sidebar differs by role
 * Expected: Employee limited; PM: Users yes, Roles no; Admin: Users + Roles.
 */
test.describe('UM-18 Sidebar differs by role', () => {
  test('Users / Roles visibility matches role', async ({ page }) => {
    // Admin: Users + Roles
    await loginAs(page, 'admin');
    await expectSidebarHasUsers(page, true);
    await expectSidebarHasRoles(page, true);
    await logout(page);

    // PM: Users yes, Roles no
    await loginAs(page, 'pm');
    await expectSidebarHasUsers(page, true);
    await expectSidebarHasRoles(page, false);
    await logout(page);

    // Employee: Users yes (self profile), Roles no / limited Settings
    await loginAs(page, 'employee');
    await expectSidebarHasUsers(page, true);
    await expectSidebarHasRoles(page, false);
  });
});
