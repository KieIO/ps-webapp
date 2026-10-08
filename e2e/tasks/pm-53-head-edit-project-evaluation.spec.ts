import { test, expect, loginAs } from '../fixtures/auth';

/**
 * PM-53 — Head My Tasks → EditHeadTaskModal writes project evaluation/note
 * Distinct from TASK-35 (task pm-evaluation). Spec lives under e2e/tasks because
 * the entry point is `/tasks/project`; case ID stays project-mgmt (PM-53).
 */
test.describe('PM-53 Head My Tasks project evaluation', () => {
  test('Head edits linked project evaluation from My Tasks', async ({ page }) => {
    await loginAs(page, 'head');
    await page.goto('/tasks/project');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible();

    // Prefer a known active-project task (finish/cancel projects reject meta PATCH).
    await page.locator('#my-task-search').fill('Redo slide');
    const editBtn = page.getByRole('button', { name: /^Edit Redo slide$/ });
    await expect(editBtn).toBeVisible({ timeout: 30_000 });

    await editBtn.click();
    const modal = page.getByRole('dialog');
    await expect(modal.getByText(/Edit task/)).toBeVisible();

    const contextProject =
      (
        await modal
          .locator('span')
          .filter({ hasText: /Sanofi Meninga|Altevia Renault Transform in PPT/i })
          .first()
          .textContent()
      )?.trim() ?? '';
    expect(contextProject.length).toBeGreaterThan(0);

    await expect(modal.locator('.ant-form-item').filter({ hasText: /Đánh Giá/ })).toBeVisible({
      timeout: 15_000,
    });

    await modal
      .locator('.ant-form-item')
      .filter({ hasText: /Đánh Giá/ })
      .getByRole('combobox')
      .click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^4$/ })
      .click();

    const note = `E2E Head task→project note ${Date.now()}`;
    await modal.getByPlaceholder('Add a note').fill(note);

    await modal.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Project updated successfully')).toBeVisible({ timeout: 20_000 });
    await expect(modal).toHaveCount(0);

    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible();
    await page.locator('#project-search').fill(contextProject);
    const row = page.locator('.ant-table-row').filter({ hasText: contextProject }).first();
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row.getByText('4', { exact: true }).first()).toBeVisible();
    await expect(row.getByText(note)).toBeVisible();
  });
});
