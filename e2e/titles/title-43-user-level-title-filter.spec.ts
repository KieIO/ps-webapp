import { test, expect, loginAs } from '../fixtures/auth';
import { seedEmployeeUserId, visibleSelectDropdown } from './helpers';

/**
 * TITLE-43 — User detail Level filters Position code / Job title options
 */
test.describe('TITLE-43 User Level filters job titles', () => {
  test('Selecting Level scopes Position code options', async ({ page }) => {
    test.setTimeout(60_000);
    const userId = await seedEmployeeUserId();

    await loginAs(page, 'admin');
    await page.goto(`/users/${userId}`);
    await expect(page.getByRole('heading', { name: /Dev Employee|Employee/i })).toBeVisible({
      timeout: 20_000,
    });

    const levelItem = page.locator('.ant-form-item').filter({ hasText: /^Level/ });
    await levelItem.locator('.ant-select').click();
    await expect(visibleSelectDropdown(page)).toBeVisible();
    await visibleSelectDropdown(page).getByText('Junior', { exact: true }).click();

    const positionItem = page.locator('.ant-form-item').filter({ hasText: 'Position code' });
    await positionItem.locator('.ant-select').click();
    const juniorTitles = visibleSelectDropdown(page);
    await expect(juniorTitles).toBeVisible();
    await positionItem.locator('.ant-select input').fill('JPE-1');
    await expect(juniorTitles.getByText('JPE-1', { exact: true })).toBeVisible();
    await expect(juniorTitles.getByText('PM-1', { exact: true })).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(page.locator('.ant-select-dropdown:visible')).toHaveCount(0);

    await levelItem.locator('.ant-select').click();
    await visibleSelectDropdown(page).getByText('Manager', { exact: true }).click();

    await positionItem.locator('.ant-select').click();
    const managerTitles = visibleSelectDropdown(page);
    await positionItem.locator('.ant-select input').fill('PM-1');
    await expect(managerTitles.getByText('PM-1', { exact: true })).toBeVisible();
    await expect(managerTitles.getByText('JPE-1', { exact: true })).toHaveCount(0);
  });
});
