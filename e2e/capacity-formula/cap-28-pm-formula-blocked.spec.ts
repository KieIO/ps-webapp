import { test, expect, loginAs, expectSidebarHasCapacityFormula } from '../fixtures/auth';

/**
 * CAP-28 — PM blocked from capacity formula page
 */
test.describe('CAP-28 PM blocked from formula page', () => {
  test('PM has no Capacity formula in sidebar and direct URL → /403', async ({ page }) => {
    await loginAs(page, 'pm');

    await expectSidebarHasCapacityFormula(page, false);

    await page.goto('/settings/employee-capacity-formula');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
  });
});
