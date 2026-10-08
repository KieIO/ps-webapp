import { test, expect, loginAs, expectSidebarHasTitleManagement } from '../fixtures/auth';

/**
 * TITLE-37 — PM / Employee blocked from /settings/titles
 * FE router gates Settings title pages to Head / Creative Head / Admin.
 */
test.describe('TITLE-37 PM/Employee blocked from title settings', () => {
  test('PM has no Title management nav and /settings/titles → 403', async ({ page }) => {
    await loginAs(page, 'pm');
    await expectSidebarHasTitleManagement(page, false);

    await page.goto('/settings/titles');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
  });

  test('Employee /settings/titles → 403', async ({ page }) => {
    await loginAs(page, 'employee');
    await page.goto('/settings/titles');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
  });
});
