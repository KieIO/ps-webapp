import { test, expect, loginAs, logout, expectSidebarHasTaskScores } from '../fixtures/auth';

/**
 * TSCORE-40 — Direct route blocked for PM / Employee
 * ProtectedRoute: Head / Creative Head / Admin only → /403.
 */
test.describe('TSCORE-40 Route gate for /settings/task-score', () => {
  test('PM and Employee redirect to /403; Admin can open page', async ({ page }) => {
    await loginAs(page, 'pm');
    await expectSidebarHasTaskScores(page, false);
    await page.goto('/settings/task-score');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
    await logout(page);

    await loginAs(page, 'employee');
    await page.goto('/settings/task-score');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();
    await logout(page);

    await loginAs(page, 'admin');
    await page.goto('/settings/task-score');
    await expect(page).toHaveURL(/\/settings\/task-score/);
    await expect(page.getByRole('heading', { name: 'Task score', exact: true })).toBeVisible();
  });
});
