import { test, expect, loginAs } from '../fixtures/auth';
import {
  expectedCodeForName,
  expectToast,
  openCreateDepartmentDialog,
  uniqueDeptName,
} from './helpers';

/**
 * DEPT-34 / D1–D3 (+ duplicate-on-edit) — Edit; delete unused; block in-use delete
 */
test.describe('DEPT-34 Edit and delete departments', () => {
  test('Admin can edit; delete unused; in-use delete is blocked', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/departments');

    const name = uniqueDeptName('E2E Edit');
    const code = expectedCodeForName(name);

    const createDialog = await openCreateDepartmentDialog(page);
    await createDialog.getByLabel('Name').fill(name);
    await createDialog.getByLabel('Description').fill('before edit');
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

    // D1 — edit name/description; code stays
    const updatedName = `${name} Updated`;
    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const editDialog = page.getByRole('dialog');
    await expect(editDialog.getByText('Edit department')).toBeVisible();
    await editDialog.getByLabel('Name').fill(updatedName);
    await editDialog.getByLabel('Description').fill('after edit');
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
    await expect(editDialog).toBeHidden();
    await expect(page.getByRole('cell', { name: code, exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: updatedName, exact: true })).toBeVisible();

    // D2 — edit to duplicate name
    await page.getByRole('button', { name: `Edit ${updatedName}` }).click();
    const dupEdit = page.getByRole('dialog');
    await dupEdit.getByLabel('Name').fill('Creative');
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/departments/') &&
          res.request().method() === 'PATCH' &&
          res.status() === 409,
      ),
      dupEdit.getByRole('button', { name: 'Save' }).click(),
    ]);
    await expectToast(page, /already exists/i);
    await expect(dupEdit).toBeVisible();
    await dupEdit.getByRole('button', { name: 'Cancel' }).click();

    // D3 — delete unused
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

    // D4 — delete in-use seeded department
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
  });
});
