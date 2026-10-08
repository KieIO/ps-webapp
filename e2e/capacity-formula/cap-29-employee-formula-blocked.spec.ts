import { test, expect, loginAs, expectSidebarHasCapacityFormula } from '../fixtures/auth';

/**
 * CAP-29 — Employee blocked from capacity formula page
 */
test.describe('CAP-29 Employee blocked from formula page', () => {
  test('Employee has no Capacity formula in sidebar and direct URL → /403', async ({ page }) => {
    await loginAs(page, 'employee');

    await expectSidebarHasCapacityFormula(page, false);

    await page.goto('/settings/employee-capacity-formula');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
  });
});
