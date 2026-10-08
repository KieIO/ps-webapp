import { test, expect, loginAs, logout } from '../fixtures/auth';

/**
 * PM-11 / PM-13 — Archive + Unarchive click flow (UI)
 * API CRUD/authz already covered in ps-be ProjectMgmt tests.
 * UI: Popconfirm "Lưu trữ" / "Khôi phục" gated by ARCHIVE_PROJECT.
 *
 * Note: use exact aria-label match — "Unarchive X" would substring-match "Archive X".
 */
test.describe('PM-11/13 Archive + Unarchive click', () => {
  test('Admin archives from active list then unarchives from archived list', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();

    const archiveBtn = page.getByRole('button', { name: /^Archive / }).first();
    await expect(archiveBtn).toBeVisible({ timeout: 30_000 });
    const aria = await archiveBtn.getAttribute('aria-label');
    expect(aria).toBeTruthy();
    const projectName = aria!.replace(/^Archive /, '');

    await archiveBtn.click();
    await page.locator('.ant-popconfirm-buttons').getByRole('button', { name: 'Lưu trữ' }).click();
    await expect(page.getByText('Đã lưu trữ dự án')).toBeVisible();

    await page.locator('#project-search').fill(projectName);
    await expect(
      page.getByRole('button', { name: `Archive ${projectName}`, exact: true }),
    ).toHaveCount(0, { timeout: 15_000 });

    await page.goto('/projects/archived');
    await expect(page.getByRole('heading', { name: /Dự án đã lưu trữ/ })).toBeVisible();
    await page.locator('#project-search').fill(projectName);

    const unarchiveBtn = page.getByRole('button', {
      name: `Unarchive ${projectName}`,
      exact: true,
    });
    await expect(unarchiveBtn).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('button', { name: `Archive ${projectName}`, exact: true }),
    ).toHaveCount(0);

    await unarchiveBtn.click();
    await page
      .locator('.ant-popconfirm-buttons')
      .getByRole('button', { name: 'Khôi phục' })
      .click();
    await expect(page.getByText('Đã khôi phục dự án')).toBeVisible();

    await page.goto('/projects');
    await page.locator('#project-search').fill(projectName);
    await expect(
      page.getByRole('button', { name: `Archive ${projectName}`, exact: true }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('Head can open Archive confirm on active list', async ({ page }) => {
    await loginAs(page, 'head');
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();

    const archiveBtn = page.getByRole('button', { name: /^Archive / }).first();
    await expect(archiveBtn).toBeVisible({ timeout: 30_000 });
    await archiveBtn.click();
    const confirm = page
      .locator('.ant-popconfirm-buttons')
      .getByRole('button', { name: 'Lưu trữ' });
    await expect(confirm).toBeVisible({ timeout: 10_000 });
    await page.locator('.ant-popconfirm-buttons').getByRole('button', { name: 'Hủy' }).click();
    await expect(confirm).toHaveCount(0);
    await logout(page);
  });
});
