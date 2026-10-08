import { test, expect, loginAs } from '../fixtures/auth';
import { apiCreateAwaitingCm } from '../fixtures/taskApi';

/**
 * TASK-64 (UI slice) — CM "Từ chối nhận" chrome on awaiting_cm
 * API decline rollback: TestTaskMgmt_TASK64_* in ps-be (API sibling).
 * CH cannot decline awaiting_ch — refuse chrome is CM/staff only.
 */
test.describe('TASK-64 CM Từ chối nhận chrome', () => {
  test('CM sees Từ chối nhận on awaiting_cm detail', async ({ page }) => {
    const taskName = `E2E CM Refuse ${Date.now()}`;
    const task = await apiCreateAwaitingCm(taskName);
    expect(task.pipelineStage).toBe('awaiting_cm');

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${task.id}`);

    await expect(page.getByRole('button', { name: 'Từ chối nhận' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('button', { name: /Giao cho Staff/ })).toBeVisible();

    await page.getByRole('button', { name: 'Từ chối nhận' }).click();
    // Ant Modal.confirm duplicates title in .ant-modal-title + .ant-modal-confirm-title
    const confirm = page.locator('.ant-modal-confirm');
    await expect(confirm.locator('.ant-modal-confirm-title')).toHaveText('Từ chối nhận task này?');
    await expect(confirm.getByRole('button', { name: 'Từ chối' })).toBeVisible();
    await confirm.getByRole('button', { name: 'Quay lại' }).click();
  });
});
