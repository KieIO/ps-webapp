import { test, expect, loginAs } from '../fixtures/auth';
import { apiCreateAwaitingCh } from '../fixtures/taskApi';

/**
 * TASK-47 (UI slice) — CH assign-cm drawer chrome
 * API assign-cm happy path: TestTaskMgmt_TASK47_* in ps-be.
 */
test.describe('TASK-47 CH Giao CM drawer', () => {
  test('CH opens Giao cho CM drawer on awaiting_ch task', async ({ page }) => {
    const taskName = `E2E CH Assign ${Date.now()}`;
    const task = await apiCreateAwaitingCh(taskName);
    expect(task.pipelineStage).toBe('awaiting_ch');

    await loginAs(page, 'creative_head');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByRole('button', { name: /Giao cho CM|Bổ sung brief/ })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole('button', { name: /Giao cho CM|Bổ sung brief/ }).click();

    const drawer = page.locator('.ant-drawer').filter({
      hasText: /Giao cho CM|Bổ sung brief/,
    });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(taskName)).toBeVisible();
    await expect(drawer.getByRole('button', { name: /Giao CM|Lưu & giao CM/ })).toBeVisible();
  });
});
