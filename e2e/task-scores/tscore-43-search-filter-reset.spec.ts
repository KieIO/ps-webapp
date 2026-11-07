import { test, expect, loginAs } from '../fixtures/auth';
import { visibleSelectDropdown } from './helpers';

/**
 * TSCORE-43 / B2–B3 — Search, group filter, Reset
 */
test.describe('TSCORE-43 Search filter reset', () => {
  test('Admin can search, filter by group, and reset', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/task-score');

    await page.locator('#task-score-search').fill('Slides 1');
    await expect(page.getByRole('cell', { name: 'Slides 1', exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('cell', { name: 'Convert 1', exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.locator('#task-score-search')).toHaveValue('');

    await page.locator('#task-score-group-filter').click();
    const dropdown = visibleSelectDropdown(page);
    await expect(dropdown).toBeVisible();
    await dropdown
      .locator('.ant-select-item-option')
      .filter({ hasText: /^Quality control$/ })
      .click();
    await expect(page.getByRole('cell', { name: 'QA 1', exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('5 total')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Slides 1', exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByRole('cell', { name: 'Slides 1', exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });
});
