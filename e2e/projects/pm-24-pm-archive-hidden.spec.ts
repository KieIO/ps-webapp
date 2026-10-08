import { test, expect, loginAs, logout } from '../fixtures/auth';

/**
 * PM-24 (+ PM-29 UI slice) — Archive / Delete hidden for Project Manager
 * API 403 already covered in ps-be; this asserts role-gated UI chrome.
 */
test.describe('PM-24 PM Archive action hidden', () => {
  test('Archive and Delete actions absent for PM', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();
    // Sanity: Admin sees Archive (and typically Delete) on active list
    await expect(page.getByRole('button', { name: /^Archive / }).first()).toBeVisible({
      timeout: 30_000,
    });
    await logout(page);

    await loginAs(page, 'pm');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();
    // List may be empty (scoped) or show rows — Archive/Delete must never appear for PM
    await expect(page.getByRole('button', { name: /Tạo dự án/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Archive / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Delete / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Unarchive / })).toHaveCount(0);

    await page.goto('/projects/archived');
    await expect(page.getByRole('heading', { name: /Dự án đã lưu trữ/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Archive / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Unarchive / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Delete / })).toHaveCount(0);
  });
});
