import { test, expect, loginAs } from '../fixtures/auth';
import { apiCreateAssignedStaffCreative } from '../fixtures/taskApi';

/**
 * TASK-71 (UI slice) — CM Evaluate on creative assigned_staff (staff execution layer)
 * API CM eval whole: TestTaskMgmt_TASK71_* in ps-be (TASK-72 = split child/parent deny).
 * Distinct layer from CH/PM parent eval; same EvaluateTaskModal chrome.
 * Uses detail page (avoids list work-date filter flakiness for newly staged tasks).
 */
test.describe('TASK-71 CM Evaluate task modal', () => {
  test('Creative Manager opens Evaluate on assigned_staff creative task', async ({ page }) => {
    const taskName = `E2E CM Eval ${Date.now()}`;
    const task = await apiCreateAssignedStaffCreative(taskName);
    expect(task.pipelineStage).toBe('assigned_staff');

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByRole('heading', { name: taskName })).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: 'Evaluate' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal.getByText('Evaluate task')).toBeVisible();
    await expect(modal.getByText(taskName)).toBeVisible();
    await expect(modal.locator('.ant-form-item').filter({ hasText: /Đánh Giá/ })).toBeVisible();
    await modal.getByRole('button', { name: 'Cancel' }).click();
  });
});
