import { test, expect, loginAs } from '../fixtures/auth';

/**
 * TASK-68 / TASK-69 (UI slice) — CH Evaluate task modal (same EvaluateTaskModal as PM)
 * API: TestTaskMgmt_TASK68_* (creative parent) / TASK69_* (project parent) in ps-be.
 * Modal chrome is shared; this asserts CH can open it on a project parent task.
 */
test.describe('TASK-68/69 CH Evaluate task modal', () => {
  test('Creative Head opens Evaluate modal on project parent', async ({ page }) => {
    await loginAs(page, 'creative_head');
    await page.goto('/tasks/project');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible();

    await page.locator('#my-task-search').fill('Redo slide');
    const evaluateBtn = page.getByRole('button', { name: /^Evaluate Redo slide$/ });
    await expect(evaluateBtn).toBeVisible({ timeout: 30_000 });
    await evaluateBtn.click();

    const modal = page.getByRole('dialog');
    await expect(modal.getByText('Evaluate task')).toBeVisible();
    await expect(modal.getByText('Redo slide')).toBeVisible();
    await expect(modal.locator('.ant-form-item').filter({ hasText: /Đánh Giá/ })).toBeVisible();
    await expect(
      modal.locator('.ant-form-item').filter({ hasText: /Số lượng hoàn thành/ }),
    ).toBeVisible();
    await modal.getByRole('button', { name: 'Cancel' }).click();
  });
});
