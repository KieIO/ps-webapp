import { type Page } from '@playwright/test';
import { test, expect, loginAs } from '../fixtures/auth';
import {
  expectedCodeForName,
  expectToast,
  openCreateDepartmentDialog,
  uniqueDeptName,
} from './helpers';

/** Clear session without relying on avatar menu (works from /403 too). */
async function switchToLogin(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login/);
}

/**
 * DEPT-36 — Priority ~10min smoke journey
 * A1 → B1 → C1 → C2 → C3 → D1 → D2 → D3 → A3; then A2 + E1.
 */
test.describe('DEPT-36 Priority department smoke journey', () => {
  test('A1–D3 + A3 smoke, then A2 Head/CH page access + E1 catalog load', async ({ page }) => {
    test.setTimeout(180_000);

    // --- A1 + B1 ---
    await loginAs(page, 'admin');
    await page.goto('/settings/departments');
    await expect(page.getByRole('heading', { name: 'Department management' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create department/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Code' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Description' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'project', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'creative', exact: true })).toBeVisible();

    // --- C1 create ---
    const name = uniqueDeptName('E2E Smoke');
    const code = expectedCodeForName(name);
    const createDialog = await openCreateDepartmentDialog(page);
    await createDialog.getByLabel('Name').fill(name);
    await createDialog.getByLabel('Description').fill('smoke journey');
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/departments') &&
          res.request().method() === 'POST' &&
          res.status() < 400,
      ),
      createDialog.getByRole('button', { name: 'Create' }).click(),
    ]);
    await expectToast(page, 'Department created');
    await expect(page.getByRole('cell', { name: code, exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: name, exact: true })).toBeVisible();

    // --- C2 required name ---
    const emptyDialog = await openCreateDepartmentDialog(page);
    await emptyDialog.getByRole('button', { name: 'Create' }).click();
    await expect(emptyDialog.getByText('Name is required')).toBeVisible();
    await emptyDialog.getByRole('button', { name: 'Cancel' }).click();

    // --- C3 duplicate name ---
    const dupDialog = await openCreateDepartmentDialog(page);
    await dupDialog.getByLabel('Name').fill('Project');
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/departments') &&
          res.request().method() === 'POST' &&
          res.status() === 409,
      ),
      dupDialog.getByRole('button', { name: 'Create' }).click(),
    ]);
    await expectToast(page, /already exists/i);
    await expect(dupDialog).toBeVisible();
    await dupDialog.getByRole('button', { name: 'Cancel' }).click();

    // --- D1 edit (code unchanged) ---
    const updatedName = `${name} Updated`;
    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const editDialog = page.getByRole('dialog');
    await expect(editDialog.getByText('Edit department')).toBeVisible();
    await editDialog.getByLabel('Name').fill(updatedName);
    await editDialog.getByLabel('Description').fill('after smoke edit');
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/departments/') &&
          res.request().method() === 'PATCH' &&
          res.status() < 400,
      ),
      editDialog.getByRole('button', { name: 'Save' }).click(),
    ]);
    await expectToast(page, 'Department updated');
    await expect(page.getByRole('cell', { name: code, exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: updatedName, exact: true })).toBeVisible();

    // --- D2 delete unused ---
    await page.getByRole('button', { name: `Delete ${updatedName}` }).click();
    const popconfirm = page.locator('.ant-popconfirm').last();
    await expect(popconfirm).toBeVisible();
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/departments/') &&
          res.request().method() === 'DELETE' &&
          res.status() < 400,
      ),
      popconfirm.getByRole('button', { name: 'Delete' }).click(),
    ]);
    await expectToast(page, 'Department deleted');
    await expect(page.getByRole('cell', { name: updatedName, exact: true })).toHaveCount(0);

    // --- D3 delete in-use blocked ---
    await page.getByRole('button', { name: 'Delete Project' }).click();
    const inUseConfirm = page.locator('.ant-popconfirm').last();
    await expect(inUseConfirm).toBeVisible();
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/departments/') &&
          res.request().method() === 'DELETE' &&
          res.status() === 409,
      ),
      inUseConfirm.getByRole('button', { name: 'Delete' }).click(),
    ]);
    await expectToast(page, /used by/i);
    await expect(page.getByRole('cell', { name: 'project', exact: true })).toBeVisible();

    // --- A3 blocked role ---
    await switchToLogin(page);
    await loginAs(page, 'pm');
    await page.goto('/settings/departments');
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('Access denied')).toBeVisible();

    // --- A2 Head + Creative Head can open page ---
    await switchToLogin(page);
    await loginAs(page, 'head');
    await page.goto('/settings/departments');
    await expect(page.getByRole('heading', { name: 'Department management' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create department/ })).toBeVisible();

    await switchToLogin(page);
    await loginAs(page, 'creative_head');
    await page.goto('/settings/departments');
    await expect(page.getByRole('heading', { name: 'Department management' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create department/ })).toBeVisible();

    // --- E1 catalog consumed by Create Project ---
    const pickerName = uniqueDeptName('E2E SmokeE1');
    const pickerCode = expectedCodeForName(pickerName);
    await switchToLogin(page);
    await loginAs(page, 'admin');
    await page.goto('/settings/departments');
    const e1Dialog = await openCreateDepartmentDialog(page);
    await e1Dialog.getByLabel('Name').fill(pickerName);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/departments') &&
          res.request().method() === 'POST' &&
          res.status() < 400,
      ),
      e1Dialog.getByRole('button', { name: 'Create' }).click(),
    ]);
    await expectToast(page, 'Department created');

    await page.goto('/projects');
    await expect(page.getByRole('button', { name: /Tạo dự án|Create project/i })).toBeVisible({
      timeout: 20_000,
    });
    const listResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/departments') && res.request().method() === 'GET' && res.ok(),
    );
    await page.getByRole('button', { name: /Tạo dự án|Create project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
    const listResponse = await listResponsePromise;
    const body = (await listResponse.json()) as {
      data?: { items?: Array<{ code: string; name: string }> };
      items?: Array<{ code: string; name: string }>;
    };
    const items = body.data?.items ?? body.items ?? [];
    expect(items.some((item) => item.code === pickerCode && item.name === pickerName)).toBe(true);
  });
});
