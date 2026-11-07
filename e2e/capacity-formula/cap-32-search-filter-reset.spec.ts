import { test, expect, loginAs } from '../fixtures/auth';
import { selectFilterById } from './helpers';

/**
 * CAP-32 / B3 — Search, level/group filters, Reset on formula page
 */
test.describe('CAP-32 Formula search filter reset', () => {
  test('Admin can search, filter by level/group, and reset', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/employee-capacity-formula');
    await expect(page.getByRole('heading', { name: /Employee capacity formula/i })).toBeVisible();

    await page.locator('#title-search').fill('JPE-1');
    await expect(page.getByRole('cell', { name: 'JPE-1', exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('cell', { name: 'PM-1', exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.locator('#title-search')).toHaveValue('');

    await selectFilterById(page, 'title-level-filter', /JUNIOR/);
    await expect(page.getByRole('cell', { name: 'JPE-1', exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('cell', { name: 'PM-1', exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Reset' }).click();
    await selectFilterById(page, 'title-group-filter', /MANAGER — Manager/);
    await expect(page.getByRole('cell', { name: 'PM-1', exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('cell', { name: 'JPE-1', exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByRole('cell', { name: 'JPE-1', exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });
});
