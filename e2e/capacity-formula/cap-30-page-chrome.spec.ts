import { test, expect, loginAs } from '../fixtures/auth';

/**
 * CAP-30 — Formula page chrome (Admin)
 * Heading, VN capacity columns, no Create job title button.
 */
test.describe('CAP-30 Formula page chrome', () => {
  test('Admin sees Employee capacity formula columns without Create', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/employee-capacity-formula');

    await expect(page.getByRole('heading', { name: /Employee capacity formula/i })).toBeVisible();
    await expect(page.getByText('Capacity/ngày').first()).toBeVisible();
    await expect(page.getByText('Tỷ lệ CM/QL').first()).toBeVisible();
    await expect(page.getByText('Điểm task CM').first()).toBeVisible();

    await expect(page.getByRole('button', { name: /Create job title/i })).toHaveCount(0);
  });
});
