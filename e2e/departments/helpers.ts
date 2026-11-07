import { expect, type Locator, type Page } from '@playwright/test';
import { slugifyDepartmentCode } from '../../src/features/departments/utils/slugifyDepartmentCode';

export const uniqueDeptName = (prefix = 'E2E Dept') =>
  `${prefix} ${Date.now().toString(36).slice(-6).toUpperCase()}`;

export const expectedCodeForName = (name: string) => slugifyDepartmentCode(name);

export async function openCreateDepartmentDialog(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: /Create department/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Create department')).toBeVisible();
  return dialog;
}

export async function expectToast(page: Page, text: string | RegExp): Promise<void> {
  await expect(page.locator('.ant-message-notice').filter({ hasText: text }).first()).toBeVisible({
    timeout: 15_000,
  });
}
