import { test, expect, loginAs, logout } from '../fixtures/auth';

/**
 * PM-40 — Create button visible only for Head / Admin
 * UI: "Tạo dự án" gated by CREATE_PROJECT.
 */
test.describe('PM-40 Create button by role', () => {
  test('Tạo dự án visible for Admin/Head; hidden for PM/Employee', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tạo dự án/ })).toBeVisible();
    await logout(page);

    await loginAs(page, 'head');
    await page.goto('/projects');
    await expect(page.getByRole('button', { name: /Tạo dự án/ })).toBeVisible();
    await logout(page);

    await loginAs(page, 'pm');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tạo dự án/ })).toHaveCount(0);
    await logout(page);

    await loginAs(page, 'employee');
    await page.goto('/projects');
    await expect(page.getByRole('button', { name: /Tạo dự án/ })).toHaveCount(0);
  });
});
