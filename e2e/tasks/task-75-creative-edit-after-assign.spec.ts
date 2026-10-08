import { test, expect, loginAs } from '../fixtures/auth';
import { apiCreateAssignedStaffCreative } from '../fixtures/taskApi';

/**
 * TASK-75 (UI slice) — CreativeEditDrawer chrome after whole assigned_staff
 * API creative-edit matrix: TestTaskMgmt_TASK75_* in ps-be.
 * Also asserts taskName is not an editable field (TASK-76 product: rename via generic PATCH only).
 * Skips finished/cancelled / role-denial locks (TASK-77/78 — API only).
 */
test.describe('TASK-75 CreativeEditDrawer after assign', () => {
  test('Admin opens creative edit drawer post-assign and saves description', async ({ page }) => {
    const taskName = `E2E TASK75 Creative ${Date.now()}`;
    const task = await apiCreateAssignedStaffCreative(taskName);
    expect(task.pipelineStage).toBe('assigned_staff');

    await loginAs(page, 'admin');
    await page.goto(`/tasks/detail/${task.id}`);

    const editCta = page.getByRole('button', { name: /Sửa \/ Đổi giao/ });
    await expect(editCta).toBeVisible({ timeout: 30_000 });
    await editCta.click();

    const drawer = page.locator('.ant-drawer').filter({
      hasText: 'Sửa / Đổi giao task Creative',
    });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(taskName)).toBeVisible();

    // Creative drawer: name is context-only (no Task Name form field).
    await expect(drawer.getByLabel('Task Name')).toHaveCount(0);
    await expect(drawer.getByLabel('Brief / mô tả')).toBeVisible();
    await expect(drawer.getByLabel('Số lượng')).toBeVisible();

    const nextDesc = `E2E creative post-assign desc ${Date.now()}`;
    await drawer.getByLabel('Brief / mô tả').fill(nextDesc);

    await drawer.getByRole('button', { name: 'Lưu thay đổi' }).click();
    await expect(page.getByText('Đã cập nhật task Creative.')).toBeVisible({ timeout: 20_000 });
    await expect(drawer).toHaveCount(0);

    // Re-open to confirm persistence in chrome.
    await page.getByRole('button', { name: /Sửa \/ Đổi giao/ }).click();
    const drawerAgain = page.locator('.ant-drawer').filter({
      hasText: 'Sửa / Đổi giao task Creative',
    });
    await expect(drawerAgain).toBeVisible();
    await expect(drawerAgain.getByLabel('Brief / mô tả')).toHaveValue(nextDesc);
  });
});
