import { test, expect, loginAs, expectSidebarHasClientManagement } from '../fixtures/auth';

/**
 * CLIENT-43 — PM blocked from /settings/clients
 * ProtectedRoute: Head / Creative Head / Admin only.
 */
test.describe('CLIENT-43 PM blocked from settings clients', () => {
  test('PM has no Client management nav and /settings/clients → 403', async ({ page }) => {
    await loginAs(page, 'pm');

    await expectSidebarHasClientManagement(page, false);

    await page.goto('/settings/clients');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
  });
});
