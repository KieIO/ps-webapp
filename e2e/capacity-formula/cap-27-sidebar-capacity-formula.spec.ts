import {
  test,
  expect,
  loginAs,
  logout,
  expectSidebarHasCapacityFormula,
} from '../fixtures/auth';

/**
 * CAP-27 — Sidebar Capacity formula by role
 * Visible for Admin / Head / Creative Head; absent for PM / Employee.
 */
test.describe('CAP-27 Sidebar Capacity formula by role', () => {
  test('Capacity formula visibility matches MANAGE_TITLES roles', async ({ page }) => {
    await loginAs(page, 'admin');
    await expectSidebarHasCapacityFormula(page, true);
    await logout(page);

    await loginAs(page, 'head');
    await expectSidebarHasCapacityFormula(page, true);
    await logout(page);

    await loginAs(page, 'creative_head');
    await expectSidebarHasCapacityFormula(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasCapacityFormula(page, false);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasCapacityFormula(page, false);
  });
});
