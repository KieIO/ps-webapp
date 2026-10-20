import { test, expect, loginAs } from '../fixtures/auth';
import {
  fillCreateProjectFromAdd,
  openProjectCreateDrawer,
  typeUnknownProjectName,
} from './helpers/createTaskUi';

/**
 * Create-task project catalog: "+ Add" opens Create project (CREATE_PROJECT),
 * then wires name + PM back into the drawer. Free-text without create stays allowed.
 */
test.describe('TASK-80/81 create-task Add project', () => {
  test('TASK-80 Admin: unknown name → Add → Create project → name + PM filled', async ({
    page,
  }) => {
    await loginAs(page, 'admin');
    const drawer = await openProjectCreateDrawer(page);
    await drawer.getByRole('button', { name: /Project Task/ }).click();

    // Name must not substring-match catalog rows (e.g. "p" still matches "goware project").
    const projectName = `zzphan-${Date.now()}`;
    await typeUnknownProjectName(page, drawer, projectName);

    // Empty filtered list must still show Add (notFoundContent), not only when partial matches exist.
    const addBtn = page.getByRole('button', { name: new RegExp(`Add ["“]?${projectName}["”]?`) });
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();

    const createProjectModal = page.locator('.ant-modal').filter({ hasText: 'Create project' });
    await expect(createProjectModal).toBeVisible({ timeout: 15_000 });
    await expect(createProjectModal.locator('input').first()).toHaveValue(projectName);

    const createPromise = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/projects\/?$/.test(new URL(res.url()).pathname) &&
        res.status() < 500,
      { timeout: 30_000 },
    );
    await fillCreateProjectFromAdd(page, createProjectModal);
    const createdRes = await createPromise;
    expect(createdRes.status()).toBeLessThan(400);
    const body = (await createdRes.json()) as {
      data?: { name?: string; pm?: { code?: string; name?: string; userId?: string } };
    };
    expect(body.data?.name).toBe(projectName);

    await expect(createProjectModal).toHaveCount(0, { timeout: 15_000 });

    const projectItem = drawer.locator('.ant-form-item').filter({ hasText: 'Tên dự án' }).first();
    await expect(projectItem.locator('input').first()).toHaveValue(projectName);

    const pmItem = drawer.locator('.ant-form-item').filter({ hasText: /^PM$/ }).first();
    const pmText = await pmItem.locator('.ant-select-selection-item').textContent();
    expect((pmText ?? '').trim().length).toBeGreaterThan(0);
  });

  test('TASK-81 PM: unknown name → no Add (no CREATE_PROJECT); free-text kept', async ({
    page,
  }) => {
    await loginAs(page, 'pm');
    const drawer = await openProjectCreateDrawer(page);
    await drawer.getByRole('button', { name: /Project Task/ }).click();

    const projectName = `E2E FreeText ${Date.now()}`;
    await typeUnknownProjectName(page, drawer, projectName);

    await expect(
      page.getByRole('button', { name: new RegExp(`Add ["“]?${projectName}["”]?`) }),
    ).toHaveCount(0);

    const projectItem = drawer.locator('.ant-form-item').filter({ hasText: 'Tên dự án' }).first();
    await expect(projectItem.locator('input').first()).toHaveValue(projectName);
  });
});
