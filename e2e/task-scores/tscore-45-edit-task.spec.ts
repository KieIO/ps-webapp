import { test, expect, loginAs } from '../fixtures/auth';
import {
  expectToast,
  fillScore,
  openCreateTaskDialog,
  selectFormAntOption,
  taskScoreRow,
  uniqueTaskScoreName,
} from './helpers';

/**
 * TSCORE-45 / E1 — Edit task score score/group/department
 */
test.describe('TSCORE-45 Edit task score', () => {
  test('Admin can edit score, group, and department', async ({ page }) => {
    test.setTimeout(90_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/task-score');

    const name = uniqueTaskScoreName('E2E Edit');
    const createDialog = await openCreateTaskDialog(page);
    await createDialog.getByLabel('Task name').fill(name);
    await fillScore(createDialog, 50);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/task-scores') &&
          res.request().method() === 'POST' &&
          res.status() < 400,
      ),
      createDialog.getByRole('button', { name: 'Create', exact: true }).click(),
    ]);
    await expectToast(page, 'Task created');
    await page.locator('#task-score-search').fill(name);
    const row = taskScoreRow(page, name).first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    await row.getByRole('button', { name: 'Edit' }).click();
    const editDialog = page.getByRole('dialog');
    await expect(editDialog.getByText('Edit task')).toBeVisible();
    await fillScore(editDialog, 99);
    await selectFormAntOption(editDialog, page, 'Group', 'Edit & others');
    await selectFormAntOption(editDialog, page, 'Department', 'Creative');
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/task-scores/') &&
          res.request().method() === 'PATCH' &&
          res.status() < 400,
      ),
      editDialog.getByRole('button', { name: 'Save' }).click(),
    ]);
    await expectToast(page, 'Task updated');
    await expect(editDialog).toBeHidden();

    const updatedRow = taskScoreRow(page, name).first();
    await expect(updatedRow.getByText('99')).toBeVisible();
    await expect(updatedRow.getByText('Edit & others')).toBeVisible();
    await expect(updatedRow.getByText('Creative')).toBeVisible();
  });
});
