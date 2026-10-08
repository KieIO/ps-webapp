import { test, expect, loginAs } from '../fixtures/auth';

/**
 * TASK-45 — Project ↔ Non-project navigation
 */
test.describe('TASK-45 Project ↔ Non-project navigation', () => {
  test('Admin can open both category pages', async ({ page }) => {
    await loginAs(page, 'admin');

    await page.goto('/tasks/project');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible();

    await page.goto('/tasks/non-project');
    await expect(page.getByRole('heading', { name: 'Non-project tasks' })).toBeVisible();

    await page.goto('/tasks/project');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible();
  });
});
