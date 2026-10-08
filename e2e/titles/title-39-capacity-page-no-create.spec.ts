import { test, expect, loginAs } from '../fixtures/auth';

/**
 * TITLE-39 — Capacity formula page shows editable capacity (no create)
 */
test.describe('TITLE-39 Capacity formula page chrome', () => {
  test('Admin sees capacity list without Create job title', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/employee-capacity-formula');

    await expect(page.getByRole('heading', { name: 'Employee capacity formula' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create job title/ })).toHaveCount(0);
    // Capacity table should render with seeded titles
    await expect(page.getByText(/total/i).first()).toBeVisible({ timeout: 30_000 });
  });
});
