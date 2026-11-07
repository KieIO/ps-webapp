import { test, expect, loginAs } from '../fixtures/auth';
import {
  expectToast,
  fillScore,
  openCreateTaskDialog,
  taskScoreRow,
  uniqueTaskScoreName,
} from './helpers';

/**
 * TSCORE-42 / C1–C3 + F1 — Create task score, validation, duplicate, department
 */
test.describe('TSCORE-42 Create task score validation', () => {
  test('Admin can create task; empty/required and duplicate fail; dept shows', async ({ page }) => {
    test.setTimeout(90_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/task-score');

    const name = uniqueTaskScoreName('E2E Slides');

    // C1 + F1 — create; Implementation group defaults department to Project
    const createDialog = await openCreateTaskDialog(page);
    await createDialog.getByLabel('Task name').fill(name);
    await fillScore(createDialog, 120);
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
    await expect(createDialog).toBeHidden();
    await page.locator('#task-score-search').fill(name);
    await expect(taskScoreRow(page, name).first()).toBeVisible({ timeout: 15_000 });
    await expect(taskScoreRow(page, name).first().getByText('Project')).toBeVisible();
    await page.getByRole('button', { name: 'Reset' }).click();

    // C2 — required task name
    const emptyDialog = await openCreateTaskDialog(page);
    await emptyDialog.getByLabel('Task name').fill('');
    await emptyDialog.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(emptyDialog.getByText('Task name is required')).toBeVisible();
    await emptyDialog.getByRole('button', { name: 'Cancel' }).click();

    // C3 — duplicate seeded name
    const dupDialog = await openCreateTaskDialog(page);
    await dupDialog.getByLabel('Task name').fill('Slides 1');
    await fillScore(dupDialog, 10);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/task-scores') &&
          res.request().method() === 'POST' &&
          res.status() === 409,
      ),
      dupDialog.getByRole('button', { name: 'Create', exact: true }).click(),
    ]);
    await expectToast(page, /already exists|đã có trong danh sách/i);
    await expect(dupDialog).toBeVisible();
  });
});
