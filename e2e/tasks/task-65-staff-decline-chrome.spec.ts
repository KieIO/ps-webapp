import { test, expect, loginAs } from '../fixtures/auth';
import { apiCreateAssignedStaffCreative } from '../fixtures/taskApi';

/**
 * TASK-65 (UI slice) — Staff "Từ chối" chrome on creative assigned_staff
 * API staff decline → awaiting_cm: TestTaskMgmt_TASK65_* in ps-be (API sibling).
 */
test.describe('TASK-65 Staff Từ chối chrome', () => {
  test('Employee sees Confirm + Từ chối on assigned creative task', async ({ page }) => {
    const taskName = `E2E Staff Decline ${Date.now()}`;
    const task = await apiCreateAssignedStaffCreative(taskName);
    expect(task.pipelineStage).toBe('assigned_staff');

    await loginAs(page, 'employee');
    await page.goto(`/tasks/detail/${task.id}`);

    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('button', { name: 'Từ chối' })).toBeVisible();

    await page.getByRole('button', { name: 'Từ chối' }).click();
    const confirm = page.getByRole('dialog');
    await expect(confirm.getByText('Từ chối task này?')).toBeVisible();
    await expect(confirm.getByRole('button', { name: 'Từ chối' })).toBeVisible();
    await confirm.getByRole('button', { name: 'Quay lại' }).click();
  });
});
