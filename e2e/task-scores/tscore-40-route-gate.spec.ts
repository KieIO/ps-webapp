import { test, expect, loginAs, expectSidebarHasTaskScores } from '../fixtures/auth';

/**
 * TSCORE-40 / A2–A3 — Direct route gate for /settings/task-score
 */
test.describe('TSCORE-40 Route gate for /settings/task-score', () => {
  for (const role of ['pm', 'employee', 'creative_manager'] as const) {
    test(`${role} blocked from /settings/task-score → 403`, async ({ page }) => {
      await loginAs(page, role);
      await expectSidebarHasTaskScores(page, false);
      await page.goto('/settings/task-score');
      await expect(page).toHaveURL(/\/403/);
      await expect(page.getByText('Access denied')).toBeVisible();
    });
  }

  test('Admin and Head can open Task score page', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/task-score');
    await expect(page).toHaveURL(/\/settings\/task-score/);
    await expect(page.getByRole('heading', { name: 'Task score', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create task/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Manage groups/i })).toBeVisible();
  });
});
