import { test, expect, loginAs } from '../fixtures/auth';
import { apiCreateProjectAfterAssign } from '../fixtures/taskApi';

/**
 * TASK-73 (UI slice) — EditTaskModal chrome after assign
 * API assign → full meta PATCH: TestTaskMgmt_TASK73_* in ps-be.
 * Skips finished/cancelled / role-denial locks (TASK-77/78 — API only).
 */
test.describe('TASK-73 Edit modal after assign', () => {
  test('Admin opens Edit modal on post-assign project task and saves name', async ({ page }) => {
    const taskName = `E2E TASK73 Edit ${Date.now()}`;
    const task = await apiCreateProjectAfterAssign(taskName);
    expect(task.pipelineStage).toBe('assigned_staff');

    await loginAs(page, 'admin');
    await page.goto(`/tasks/detail/${task.id}`);

    // Ant icon aria ("edit") prefixes the accessible name → match substring.
    const editBtn = page.getByRole('button', { name: /Edit task/ });
    await expect(editBtn).toBeVisible({ timeout: 30_000 });
    await editBtn.click();

    const modal = page.getByRole('dialog');
    await expect(modal.getByText(/Edit task/)).toBeVisible();

    const renamed = `${taskName} After`;
    const nameInput = modal.getByLabel('Task Name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(renamed);

    await modal.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Task updated successfully')).toBeVisible({ timeout: 20_000 });
    await expect(modal).toHaveCount(0);

    await expect(page.getByText(renamed).first()).toBeVisible({ timeout: 15_000 });
  });
});
