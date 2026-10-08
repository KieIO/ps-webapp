import {
  test,
  loginAs,
  logout,
  expectSidebarHasCapacityFormula,
} from '../fixtures/auth';

/**
 * TITLE-36 — Sidebar Capacity formula by role
 * Same MANAGE_TITLES visibility as Title management.
 */
test.describe('TITLE-36 Sidebar Capacity formula by role', () => {
  test('Capacity formula visible for Admin/Head; hidden for PM/Employee', async ({ page }) => {
    await loginAs(page, 'admin');
    await expectSidebarHasCapacityFormula(page, true);
    await logout(page);

    await loginAs(page, 'head');
    await expectSidebarHasCapacityFormula(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasCapacityFormula(page, false);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasCapacityFormula(page, false);
  });
});
