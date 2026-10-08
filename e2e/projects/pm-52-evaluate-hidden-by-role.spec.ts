import { test, expect, loginAs, logout } from '../fixtures/auth';

/**
 * PM-52 — Evaluate control hidden for roles without EDIT_PROJECT (Employee)
 * UI-only: Employee must not see star Evaluate actions on `/projects`.
 * Note: PM may still see Evaluate (EDIT_PROJECT); meta-gate 403 is API PM-51.
 */
test.describe('PM-52 Evaluate button by role', () => {
  test('Evaluate visible for Admin/Head; hidden for Employee', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Evaluate / }).first()).toBeVisible({
      timeout: 30_000,
    });
    await logout(page);

    await loginAs(page, 'head');
    await page.goto('/projects');
    await expect(page.getByRole('button', { name: /^Evaluate / }).first()).toBeVisible({
      timeout: 30_000,
    });
    await logout(page);

    await loginAs(page, 'employee');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Evaluate / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Edit / })).toHaveCount(0);
  });
});
