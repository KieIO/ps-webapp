import { test, expect, loginAs } from '../fixtures/auth';

/**
 * PM-39 (UI slice) — Urgency via Edit project modal
 * API PATCH …/urgency is covered in ps-be; this asserts the Edit-modal control + list badge.
 */
test.describe('PM-39 Urgency edit modal', () => {
  test('Admin sets urgency in Edit modal and list badge updates', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();

    const editBtn = page.getByRole('button', { name: /^Edit / }).first();
    await expect(editBtn).toBeVisible({ timeout: 30_000 });
    const aria = await editBtn.getAttribute('aria-label');
    expect(aria).toBeTruthy();
    const projectName = aria!.replace(/^Edit /, '');

    await editBtn.click();
    const modal = page.getByRole('dialog');
    await expect(modal.getByText(/Edit project/)).toBeVisible();

    await modal
      .locator('.ant-form-item')
      .filter({ hasText: /^Urgency/ })
      .getByRole('combobox')
      .click();
    // Ant Design Select options render in a portal; prefer item class over role name.
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: 'High priority' })
      .click();

    await modal.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Project updated successfully')).toBeVisible({ timeout: 15_000 });

    await page.locator('#project-search').fill(projectName);
    const row = page.locator('.ant-table-row').filter({ hasText: projectName }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row.getByText('High priority')).toBeVisible();
  });
});
