import { test, expect, loginAs } from '../fixtures/auth';

/**
 * TASK-35 (UI slice) — PM Evaluate task modal (Project task)
 * API PATCH …/pm-evaluation: TestTaskMgmt_TASK35_* in ps-be.
 */
test.describe('TASK-35 Evaluate task modal (PM)', () => {
  test('PM opens Evaluate modal, sets score + note, saves', async ({ page }) => {
    await loginAs(page, 'pm');
    await page.goto('/tasks/project');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible();

    await page.locator('#my-task-search').fill('Redo slide');
    const evaluateBtn = page.getByRole('button', { name: /^Evaluate Redo slide$/ });
    await expect(evaluateBtn).toBeVisible({ timeout: 30_000 });
    await evaluateBtn.click();

    const modal = page.getByRole('dialog');
    await expect(modal.getByText('Evaluate task')).toBeVisible();
    await expect(modal.getByText('Redo slide')).toBeVisible();

    await modal
      .locator('.ant-form-item')
      .filter({ hasText: /Số lượng hoàn thành/ })
      .locator('input')
      .fill('6');

    await modal
      .locator('.ant-form-item')
      .filter({ hasText: /Đánh Giá/ })
      .getByRole('combobox')
      .click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^4$/ })
      .click();

    const note = `E2E PM task eval note ${Date.now()}`;
    await modal
      .locator('.ant-form-item')
      .filter({ hasText: /Ghi chú/ })
      .locator('textarea')
      .fill(note);

    await modal.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Task evaluation saved')).toBeVisible({ timeout: 15_000 });
  });
});
