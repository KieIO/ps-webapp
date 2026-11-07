import { test, expect, loginAs } from '../fixtures/auth';
import {
  expectedCodeForName,
  expectToast,
  openCreateDepartmentDialog,
  uniqueDeptName,
} from './helpers';

/**
 * DEPT-35 / E1 — New department is loaded by Create Project (GET /departments)
 */
test.describe('DEPT-35 New department in catalog consumers', () => {
  test('Created department is returned when Create Project loads department options', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await loginAs(page, 'admin');

    const name = uniqueDeptName('E2E Picker');
    const code = expectedCodeForName(name);

    await page.goto('/settings/departments');
    const createDialog = await openCreateDepartmentDialog(page);
    await createDialog.getByLabel('Name').fill(name);
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
    expect(items.some((item) => item.code === code && item.name === name)).toBe(true);
  });
});
