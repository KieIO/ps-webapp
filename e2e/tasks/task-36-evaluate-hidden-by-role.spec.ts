import { test, expect, loginAs, logout } from '../fixtures/auth';

/**
 * TASK-36 (UI slice) — Evaluate control hidden for Employee
 * API 403: TestTaskMgmt_TASK36_* in ps-be.
 */
test.describe('TASK-36 Evaluate button by role', () => {
  test('Evaluate visible for PM/CH; hidden for Employee', async ({ page }) => {
    await loginAs(page, 'pm');
    await page.goto('/tasks/project');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Evaluate / }).first()).toBeVisible({
      timeout: 30_000,
    });
    await logout(page);

    await loginAs(page, 'creative_head');
    await page.goto('/tasks/project');
    await expect(page.getByRole('button', { name: /^Evaluate / }).first()).toBeVisible({
      timeout: 30_000,
    });
    await logout(page);

    await loginAs(page, 'employee');
    await page.goto('/tasks/project');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Evaluate / })).toHaveCount(0);
  });
});
