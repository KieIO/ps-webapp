import { test, expect, loginAs, logout } from '../fixtures/auth';
import { apiJson, type TaskDto } from './helpers/creativeDeclineApi';
import { setupWholeAssigned } from './helpers/splitFamilyApi';

/**
 * TASK-78 — Staff từ chối task đã giao → task về Creative Manager để giao lại.
 * API: TestTaskMgmt_TASK78_StaffRefuseReturnsToCM in ps-be.
 */
test.describe('TASK-78 Staff refuse returns to CM queue', () => {
  test('Staff declines assigned_staff; CM sees task back in Creative review', async ({ page }) => {
    const taskName = `E2E Staff Refuse CM ${Date.now()}`;
    const reason = `Staff conflict ${Date.now()}`;

    const { task, cm } = await setupWholeAssigned(taskName);
    expect(task.pipelineStage).toBe('assigned_staff');

    await loginAs(page, 'employee');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByText(taskName).first()).toBeVisible({ timeout: 30_000 });

    // Icon aria prefixes the label ("close Từ chối").
    const refuseBtn = page.getByRole('button', { name: /Từ chối/ }).filter({ hasNotText: 'nhận' });
    await expect(refuseBtn).toBeVisible({ timeout: 15_000 });
    await refuseBtn.click();

    const confirm = page.locator('.ant-modal-confirm').last();
    await expect(confirm.locator('.ant-modal-confirm-title')).toHaveText('Từ chối task này?');
    await confirm.locator('textarea').fill(reason);
    await confirm.getByRole('button', { name: 'Từ chối', exact: true }).click();
    await expect(page.getByText('Đã từ chối task')).toBeVisible({ timeout: 20_000 });

    const after = await apiJson<TaskDto>('GET', `/tasks/my/${task.id}`, cm.token);
    expect(after.ok).toBeTruthy();
    expect(after.data.pipelineStage).toBe('awaiting_cm');
    expect(after.data.staffConfirmation).toBe('not_updated');

    await logout(page);
    await loginAs(page, 'creative_manager');
    await page.goto('/creative/review');
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 30_000 });
  });
});
