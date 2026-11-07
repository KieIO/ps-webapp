import { test, expect, loginAs } from '../fixtures/auth';
import { capacityInputs, titleRow } from './helpers';

/**
 * CAP-30 / A1+B1+B2 — Formula page chrome (Admin)
 * Heading, columns, seeded row, editable inputs, no Create job title.
 */
test.describe('CAP-30 Formula page chrome', () => {
  test('Admin sees Employee capacity formula columns without Create', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/employee-capacity-formula');

    await expect(page.getByRole('heading', { name: /Employee capacity formula/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Code/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Title/i })).toBeVisible();
    await expect(page.getByText('Capacity/ngày').first()).toBeVisible();
    await expect(page.getByText('Tỷ lệ CM/QL').first()).toBeVisible();
    await expect(page.getByText('Điểm task CM').first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Job level/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Job group/i })).toBeVisible();

    await expect(page.getByRole('button', { name: /Create job title/i })).toHaveCount(0);
    await expect(page.getByText(/\d+ total/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('cell', { name: 'JPE-1', exact: true })).toBeVisible();

    const row = titleRow(page, 'JPE-1');
    const { capacity, ratio } = capacityInputs(row);
    await expect(capacity).toBeVisible();
    await expect(ratio).toBeVisible();
  });
});
