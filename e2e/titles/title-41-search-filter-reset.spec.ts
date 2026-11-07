import { test, expect, loginAs } from '../fixtures/auth';
import { selectFilterById } from './helpers';

/**
 * TITLE-41 — Job titles search, level/group filters, and Reset
 */
test.describe('TITLE-41 Search, filter, reset', () => {
  test('Admin can search, filter by level/group, and reset', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/titles');
    await expect(page.getByRole('heading', { name: 'Title management' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Job titles' })).toBeVisible();

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
    await expect(
      page.getByRole('cell', { name: 'Junior Project Executive Level 1', exact: true }),
    ).toBeVisible();
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
