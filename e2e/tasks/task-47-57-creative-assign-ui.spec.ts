import { type Page } from '@playwright/test';
import { test, expect, loginAs, logout } from '../fixtures/auth';
import {
  getTask,
  setupAwaitingCh,
  setupAwaitingCm,
  splitAssign,
  apiLogin,
  SEED_ACCOUNTS,
  wholeAssign,
} from './helpers/splitFamilyApi';

/**
 * TASK-06 / 47 / 50 / 51 / 57 — Creative assign pipeline UI smoke.
 */

async function pickDropdownOptionContaining(page: Page, text: string | RegExp): Promise<void> {
  const option = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: text })
    .first();
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
}

test.describe('TASK-47/50/51/57 creative assign UI', () => {
  test('TASK-06+47+50+57 CH giao CM rồi CM giao nguyên Staff', async ({ page }) => {
    const taskName = `E2E Assign Pipe ${Date.now()}`;
    const { parent, cm } = await setupAwaitingCh(taskName, 6);
    const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);

    await loginAs(page, 'creative_head');
    await page.goto('/creative/review');
    const row = page.locator('.ant-table-row').filter({ hasText: taskName });
    await expect(row).toBeVisible({ timeout: 30_000 });
    await expect(row.getByText('Chờ xử lý')).toBeVisible();

    // Queue row CTA is short label "Giao CM" (drawer title is "Giao cho CM").
    await row.getByRole('button', { name: /^Giao CM$/ }).click();
    const cmDrawer = page.getByRole('dialog', { name: /Giao cho CM/ });
    await expect(cmDrawer).toBeVisible();
    await cmDrawer
      .locator('.ant-form-item')
      .filter({ hasText: 'Creative Manager' })
      .locator('.ant-select')
      .click();
    await pickDropdownOptionContaining(page, /Creative Manager|CM|Manager/i);
    await cmDrawer.getByRole('button', { name: /^Giao CM$/ }).click();
    await expect(cmDrawer).toHaveCount(0, { timeout: 20_000 });

    const afterCm = await getTask(cm.token, parent.id);
    expect(afterCm.pipelineStage).toBe('awaiting_cm');

    await logout(page);
    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole('button', { name: /Giao cho Staff/ }).click();
    const staffDrawer = page.getByRole('dialog', { name: /Giao task cho Staff/ });
    await expect(staffDrawer).toBeVisible();
    await expect(staffDrawer.getByText('Giao nguyên', { exact: true })).toBeVisible();

    // Prefer API whole-assign for staff pick stability; assert drawer chrome then complete via API.
    await expect(staffDrawer.getByRole('button', { name: /Giao nguyên task/ })).toBeVisible();
    await staffDrawer.getByRole('button', { name: /^Hủy$/ }).click();
    await wholeAssign(cm.token, parent.id, employee.user.id, parent.quantity);

    const afterStaff = await getTask(cm.token, parent.id);
    expect(afterStaff.pipelineStage).toBe('assigned_staff');
    expect(afterStaff.quantity).toBe(parent.quantity);

    // Confirm UI reflects assigned Staff (detail uses assignee chip, not pipeline label).
    await page.reload();
    await expect(page.getByRole('button', { name: /Dev Employee/ })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole('button', { name: /Sửa \/ Đổi giao/ })).toBeVisible();
  });

  test('TASK-51 CM mở Chia nhỏ trên drawer; split hoàn tất qua API + UI stage', async ({
    page,
  }) => {
    const taskName = `E2E Split UI ${Date.now()}`;
    const { parent, cm } = await setupAwaitingCm(taskName);
    const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);
    const head = await apiLogin(SEED_ACCOUNTS.head.email, SEED_ACCOUNTS.head.password);

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole('button', { name: /Giao cho Staff/ }).click();
    const drawer = page.getByRole('dialog', { name: /Giao task cho Staff/ });
    await drawer.getByText('Chia nhỏ', { exact: true }).click();
    await expect(drawer.getByText(/Task nhỏ 1/)).toBeVisible();
    await expect(drawer.getByText(/Task nhỏ 2/)).toBeVisible();
    await expect(drawer.getByRole('button', { name: /Giao tất cả task nhỏ/ })).toBeVisible();
    await drawer.getByRole('button', { name: /^Hủy$/ }).click();

    await splitAssign(cm.token, parent.id, employee.user.id, head.user.id, 3, 2);
    const after = await getTask(cm.token, parent.id);
    expect(after.pipelineStage).toBe('split');

    await page.reload();
    await expect(page.getByText('Đã chia nhỏ').first()).toBeVisible({ timeout: 20_000 });
  });
});
