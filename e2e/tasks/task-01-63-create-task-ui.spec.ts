import { test, expect, loginAs } from '../fixtures/auth';
import {
  createDrawer,
  fillCreativeBriefStep,
  fillProjectBriefStep,
  openNonProjectCreateModal,
  openProjectCreateDrawer,
  pickFormSelect,
  pickProjectName,
  setCriterion,
  waitCreateTaskResponse,
} from './helpers/createTaskUi';

/**
 * Create-task sheet UI coverage (TASK-01…06 / 61 / 63).
 * TASK-27/28 → task-44 · TASK-39–42 → task-39-42 · TASK-62 API-only (creative+staff at create).
 */
test.describe('TASK-01/02/03/04/05/06/61/63 create task UI', () => {
  test('TASK-01+61 Admin Project Task → Phòng Project → Giao task', async ({ page }) => {
    await loginAs(page, 'admin');
    const drawer = await openProjectCreateDrawer(page);

    await drawer.getByRole('button', { name: /Project Task/ }).click();
    await expect(drawer.getByLabel('Brief')).toBeVisible();
    await fillProjectBriefStep(page, drawer, { criteria: [2, 2, 2] });
    await expect(drawer.getByText(/Phân loại độ khó · Level 2/)).toBeVisible();
    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();

    await drawer.getByRole('button', { name: /Phòng Project/ }).click();
    await pickFormSelect(page, drawer, 'Giao cho', /Dev Employee|Employee/i);
    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();
    await expect(drawer.getByText('Xác nhận trước khi tạo')).toBeVisible();

    const createPromise = waitCreateTaskResponse(page);
    await drawer.getByRole('button', { name: 'Giao task' }).click();
    const created = await createPromise;
    await expect(page.getByText(/Đã giao task/)).toBeVisible({ timeout: 20_000 });
    expect(created.department?.toLowerCase()).toMatch(/project/);
    expect(created.pipelineStage).toBe('assigned_staff');
    expect(created.staff?.length).toBeGreaterThan(0);
  });

  test('TASK-02 PM opens create drawer and completes Creative Task → awaiting_ch (TASK-06)', async ({
    page,
  }) => {
    await loginAs(page, 'pm');
    const drawer = await openProjectCreateDrawer(page);
    await expect(drawer.getByRole('button', { name: /Project Task/ })).toBeVisible();
    await expect(drawer.getByRole('button', { name: /Creative Task/ })).toBeVisible();

    await drawer.getByRole('button', { name: /Creative Task/ }).click();
    await fillCreativeBriefStep(page, drawer);
    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();
    // Creative step 1 = info banner, step 2 = confirm → Gửi Creative
    await expect(drawer.getByText(/Creative Task chưa cần brief/i)).toBeVisible();
    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();
    await expect(drawer.getByText('Xác nhận trước khi tạo')).toBeVisible();

    const createPromise = waitCreateTaskResponse(page);
    await drawer.getByRole('button', { name: 'Gửi Creative' }).click();
    const created = await createPromise;
    await expect(page.getByText(/Đã chuyển task sang Creative/)).toBeVisible({ timeout: 20_000 });
    expect(created.department?.toLowerCase()).toMatch(/creative/);
    expect(created.pipelineStage).toBe('awaiting_ch');
    expect(created.staff ?? []).toHaveLength(0);
  });

  test('TASK-03 Non-project Create task modal', async ({ page }) => {
    await loginAs(page, 'pm');
    const modal = await openNonProjectCreateModal(page);

    await pickProjectName(page, modal, `E2E Internal ${Date.now()}`);
    // PM often auto-filled for seed PM; ensure task name + qty + deadline exist.
    await pickFormSelect(page, modal, 'Task name', /Slides|QA|Others/i);
    const qty = modal
      .locator('.ant-form-item')
      .filter({ hasText: /Quantity/i })
      .locator('input');
    if (await qty.count()) {
      await qty.fill('1');
    }

    const createPromise = waitCreateTaskResponse(page);
    await modal.getByRole('button', { name: /^Create task$/ }).click();
    const created = await createPromise;
    await expect(modal).toHaveCount(0, { timeout: 20_000 });
    expect(created.taskCategory).toBe('non_project');
  });

  test('TASK-04 Level badge updates when criteria change', async ({ page }) => {
    await loginAs(page, 'admin');
    const drawer = await openProjectCreateDrawer(page);
    await drawer.getByRole('button', { name: /Project Task/ }).click();
    await fillProjectBriefStep(page, drawer, { criteria: [1, 1, 1] });
    await expect(drawer.getByText(/Phân loại độ khó · Level 1/)).toBeVisible();

    await setCriterion(drawer, 'Tư Duy Thiết Kế', 5);
    await setCriterion(drawer, 'Kỹ Thuật', 5);
    await setCriterion(drawer, 'Xử Lý Nội Dung', 5);
    await expect(drawer.getByText(/Phân loại độ khó · Level 5/)).toBeVisible();

    // round((2+3+4)/3)=3
    await setCriterion(drawer, 'Tư Duy Thiết Kế', 2);
    await setCriterion(drawer, 'Kỹ Thuật', 3);
    await setCriterion(drawer, 'Xử Lý Nội Dung', 4);
    await expect(drawer.getByText(/Phân loại độ khó · Level 3/)).toBeVisible();
  });

  test('TASK-05 Project staff required — Tiếp tục blocked without Giao cho', async ({ page }) => {
    await loginAs(page, 'admin');
    const drawer = await openProjectCreateDrawer(page);
    await drawer.getByRole('button', { name: /Project Task/ }).click();
    await fillProjectBriefStep(page, drawer);
    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();

    await drawer.getByRole('button', { name: /Phòng Project/ }).click();
    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();
    await expect(drawer.getByText('Chọn nhân viên')).toBeVisible();
    // Still on assign step — confirm CTA not available yet.
    await expect(drawer.getByRole('button', { name: 'Giao task' })).toHaveCount(0);
  });

  test('TASK-63 Project vs Creative cards show different brief fields', async ({ page }) => {
    await loginAs(page, 'admin');
    await openProjectCreateDrawer(page);

    let drawer = createDrawer(page);
    await drawer.getByRole('button', { name: /Project Task/ }).click();
    await expect(drawer.getByLabel('Brief')).toBeVisible();
    await expect(drawer.getByText(/Phân loại độ khó/)).toBeVisible();
    await expect(drawer.getByLabel('Số lượng')).toBeVisible();

    // Back to kind cards, then Creative.
    await drawer.getByRole('button', { name: 'Quay lại' }).click();
    await expect(drawer.getByRole('button', { name: /Creative Task/ })).toBeVisible();
    await drawer.getByRole('button', { name: /Creative Task/ }).click();
    await expect(drawer.getByLabel('Deadline')).toBeVisible();
    await expect(drawer.getByLabel('Brief')).toHaveCount(0);
    await expect(drawer.getByLabel('Số lượng')).toHaveCount(0);
    await expect(drawer.getByText(/Phân loại độ khó/)).toHaveCount(0);
  });
});
