import { test, expect, loginAs } from '../fixtures/auth';

/**
 * PM-41 — Active ↔ Archived navigation + Archive vs Unarchive chrome
 */
test.describe('PM-41 Active ↔ Archived navigation', () => {
  test('Admin can open archived list and return; actions swap by view', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();

    // Active view: Archive available, Unarchive not (exact — Unarchive would match /^Archive /)
    await expect(page.getByRole('button', { name: /^Archive / }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('button', { name: /^Unarchive / })).toHaveCount(0);

    await page.getByRole('link', { name: /Đã lưu trữ/ }).click();
    await expect(page).toHaveURL(/\/projects\/archived/);
    await expect(page.getByRole('heading', { name: /Dự án đã lưu trữ/ })).toBeVisible();

    // Archived view: no Archive-* buttons (Unarchive uses separate aria-label prefix)
    await expect(page.getByRole('button', { name: /^Archive / })).toHaveCount(0);

    await page.getByRole('link', { name: /Quay lại dự án/ }).click();
    await expect(page).toHaveURL(/\/projects\/?$/);
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();
  });
});
