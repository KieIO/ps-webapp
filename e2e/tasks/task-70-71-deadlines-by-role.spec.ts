import { test, expect, loginAs } from '../fixtures/auth';
import {
  creativeEdit,
  getTask,
  setupAwaitingCm,
  setupWholeAssigned,
} from './helpers/splitFamilyApi';

/**
 * TASK-70 / TASK-71 — Deadline PM + Deadline Creative by role (API + UI chrome).
 */

test.describe('TASK-70/71 deadlines by role', () => {
  test('TASK-70 PM can change Deadline PM; employee cannot', async ({ page }) => {
    const taskName = `E2E DL PM ${Date.now()}`;
    const { task, pm, employee } = await setupWholeAssigned(taskName);

    const nextDeadline = '2026-12-15T17:00:00.000Z';
    const updated = await creativeEdit(pm.token, task.id, {
      deadline: nextDeadline,
      description: task.description ?? 'E2E brief for split family',
    });
    expect(updated.deadline?.startsWith('2026-12-15')).toBeTruthy();

    await expect(
      creativeEdit(employee.token, task.id, { deadline: '2027-01-01T17:00:00.000Z' }),
    ).rejects.toThrow(/failed (403|422)/);

    await loginAs(page, 'pm');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole('button', { name: /Edit task|Sửa \/ Đổi giao/ }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByTitle('Deadline PM')).toBeVisible({ timeout: 15_000 });
    // PM schedule fields are editable in Creative drawer.
    await expect(drawer.locator('.ant-picker').first()).toBeVisible();
  });

  test('TASK-71 CM/PM may set creative deadline after Staff assign; CH blocked before', async ({
    page,
  }) => {
    const awaitingName = `E2E CDL CH ${Date.now()}`;
    const { parent, ch, cm } = await setupAwaitingCm(awaitingName);

    await expect(
      creativeEdit(ch.token, parent.id, { creativeDeadline: '2027-02-01T17:00:00.000Z' }),
    ).rejects.toThrow(/failed (403|422)/);

    const wholeName = `E2E CDL CM ${Date.now()}`;
    const { task, pm, cm: owningCm } = await setupWholeAssigned(wholeName);

    const within = task.deadline ?? task.date;
    const byCm = await creativeEdit(owningCm.token, task.id, {
      creativeDeadline: within,
      description: task.description ?? 'E2E brief for split family',
    });
    expect(byCm.creativeDeadline?.startsWith(within.slice(0, 10))).toBeTruthy();

    await expect(
      creativeEdit(owningCm.token, task.id, {
        creativeDeadline: '2099-01-01T17:00:00.000Z',
        description: task.description ?? 'E2E brief for split family',
      }),
    ).rejects.toThrow();

    const byPm = await creativeEdit(pm.token, task.id, {
      creativeDeadline: within,
      description: task.description ?? 'E2E brief for split family',
    });
    expect(byPm.creativeDeadline?.startsWith(within.slice(0, 10))).toBeTruthy();

    const fresh = await getTask(pm.token, task.id);
    expect(fresh.creativeDeadline?.startsWith(within.slice(0, 10))).toBeTruthy();

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByText(wholeName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole('button', { name: /Edit task|Sửa \/ Đổi giao/ }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByText(/Deadline Creative|Creative/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
