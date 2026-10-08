import { test, expect, loginAs, logout } from '../fixtures/auth';

/**
 * TASK-44 — Create button visible only for PM / Admin
 * UI: "Tạo task" gated by CREATE_TASK (default: pm, admin — not head).
 */
test.describe('TASK-44 Create button by role', () => {
  test('Tạo task visible for Admin/PM; hidden for Head/Employee', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/tasks/project');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tạo task/ })).toBeVisible();
    await logout(page);

    await loginAs(page, 'pm');
    await page.goto('/tasks/project');
    await expect(page.getByRole('button', { name: /Tạo task/ })).toBeVisible();
    await logout(page);

    await loginAs(page, 'head');
    await page.goto('/tasks/project');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tạo task/ })).toHaveCount(0);
    await logout(page);

    await loginAs(page, 'employee');
    await page.goto('/tasks/project');
    await expect(page.getByRole('button', { name: /Tạo task/ })).toHaveCount(0);
  });
});
