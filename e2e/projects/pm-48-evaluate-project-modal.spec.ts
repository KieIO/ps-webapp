import { test, expect, loginAs, logout } from '../fixtures/auth';

/**
 * PM-48 (UI slice) — Evaluate Project modal (Head / Admin)
 * API PATCH evaluation fields: TestProjectMgmt_PM48_* in ps-be.
 */
test.describe('PM-48 Evaluate project modal', () => {
  test('Head opens Evaluate modal, sets score + note, saves', async ({ page }) => {
    await loginAs(page, 'head');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();

    const evaluateBtn = page.getByRole('button', { name: /^Evaluate / }).first();
    await expect(evaluateBtn).toBeVisible({ timeout: 30_000 });
    const aria = await evaluateBtn.getAttribute('aria-label');
    expect(aria).toBeTruthy();
    const projectName = aria!.replace(/^Evaluate /, '');

    await evaluateBtn.click();
    const modal = page.getByRole('dialog');
    await expect(modal.getByText('Evaluate project')).toBeVisible();
    await expect(modal.getByText(projectName)).toBeVisible();

    await modal
      .locator('.ant-form-item')
      .filter({ hasText: /Đánh giá/ })
      .getByRole('combobox')
      .click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^5$/ })
      .click();

    const note = `E2E Head eval note ${Date.now()}`;
    await modal
      .locator('.ant-form-item')
      .filter({ hasText: /Ghi chú/ })
      .locator('textarea')
      .fill(note);

    await modal.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Project evaluation saved')).toBeVisible({ timeout: 15_000 });

    await page.locator('#project-search').fill(projectName);
    const row = page.locator('.ant-table-row').filter({ hasText: projectName }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row.getByText('5', { exact: true }).first()).toBeVisible();
    await expect(row.getByText(note)).toBeVisible();
  });

  test('Admin can open Evaluate modal', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();

    const evaluateBtn = page.getByRole('button', { name: /^Evaluate / }).first();
    await expect(evaluateBtn).toBeVisible({ timeout: 30_000 });
    await evaluateBtn.click();
    await expect(page.getByRole('dialog').getByText('Evaluate project')).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await logout(page);
  });
});
