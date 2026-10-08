import { test, expect, loginAs } from '../fixtures/auth';

/**
 * PM-41 — Active ↔ Archived navigation
 */
test.describe('PM-41 Active ↔ Archived navigation', () => {
  test('Admin can open archived list and return', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();

    await page.getByRole('link', { name: /Đã lưu trữ/ }).click();
    await expect(page).toHaveURL(/\/projects\/archived/);
    await expect(page.getByRole('heading', { name: /Dự án đã lưu trữ/ })).toBeVisible();

    await page.getByRole('link', { name: /Quay lại dự án/ }).click();
    await expect(page).toHaveURL(/\/projects\/?$/);
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();
  });
});
