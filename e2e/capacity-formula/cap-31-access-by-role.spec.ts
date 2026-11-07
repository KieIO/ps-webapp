import { test, expect, loginAs, expectSidebarHasCapacityFormula } from '../fixtures/auth';

/**
 * CAP-31 / A2–A3 — Head/CH can open formula page; CM blocked
 */
test.describe('CAP-31 Capacity formula access by role', () => {
  test('Head and Creative Head can open formula page', async ({ page }) => {
    test.setTimeout(60_000);

    for (const role of ['head', 'creative_head'] as const) {
      await loginAs(page, role);
      await expectSidebarHasCapacityFormula(page, true);
      await page.goto('/settings/employee-capacity-formula');
      await expect(page).toHaveURL(/\/settings\/employee-capacity-formula/);
      await expect(page.getByRole('heading', { name: /Employee capacity formula/i })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'JPE-1', exact: true })).toBeVisible({
        timeout: 15_000,
      });
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());
    }
  });

  test('Creative Manager blocked from formula page → 403', async ({ page }) => {
    await loginAs(page, 'creative_manager');
    await expectSidebarHasCapacityFormula(page, false);
    await page.goto('/settings/employee-capacity-formula');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
  });
});
