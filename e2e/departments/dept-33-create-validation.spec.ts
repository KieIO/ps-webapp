import { test, expect, loginAs } from '../fixtures/auth';
import {
  expectedCodeForName,
  expectToast,
  openCreateDepartmentDialog,
  uniqueDeptName,
} from './helpers';

/**
 * DEPT-33 / C1–C3 — Create department + required/duplicate validation
 */
test.describe('DEPT-33 Create department validation', () => {
  test('Admin can create department; empty name and duplicate name fail', async ({ page }) => {
    test.setTimeout(90_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/departments');

    const name = uniqueDeptName();
    const code = expectedCodeForName(name);
    const description = `Desc for ${name}`;

    // C1 — create OK
    const createDialog = await openCreateDepartmentDialog(page);
    await createDialog.getByLabel('Name').fill(name);
    await createDialog.getByLabel('Description').fill(description);
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
    await expect(createDialog).toBeHidden();
    await expect(page.getByRole('cell', { name: code, exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: name, exact: true })).toBeVisible();

    // C2 — required name
    const emptyDialog = await openCreateDepartmentDialog(page);
    await emptyDialog.getByRole('button', { name: 'Create' }).click();
    await expect(emptyDialog.getByText('Name is required')).toBeVisible();
    await emptyDialog.getByRole('button', { name: 'Cancel' }).click();

    // C3 — duplicate seeded name
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
  });
});
