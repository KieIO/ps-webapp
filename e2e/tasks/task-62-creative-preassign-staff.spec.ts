import { test, expect, loginAs, logout } from '../fixtures/auth';
import { apiJson, apiLogin, getTask, SEED_ACCOUNTS, type TaskDto } from './helpers/splitFamilyApi';
import { openProjectCreateDrawer } from './helpers/createTaskUi';

/**
 * TASK-62 — Tạo task Creative và giao sẵn Staff → assigned_staff (skip awaiting_ch).
 *
 * CreateTaskDrawer không cho chọn Staff trên Creative lúc tạo (luồng CH→CM→Staff).
 * Capability vẫn có trên API. E2E:
 * 1) UI: Creative Task drawer không có «Giao cho»
 * 2) API create creative+staff → assigned_staff
 * 3) Staff thấy Confirm/Từ chối; CH queue không «Chờ xử lý» task đó
 */
test.describe('TASK-62 creative create with pre-assigned Staff', () => {
  test('drawer has no Staff on Creative; API pre-assign skips CH inbox', async ({ page }) => {
    await loginAs(page, 'admin');
    const drawer = await openProjectCreateDrawer(page);
    await drawer.getByRole('button', { name: /Creative Task/ }).click();
    await expect(drawer.getByLabel('Deadline')).toBeVisible();
    await expect(drawer.getByText('Giao cho')).toHaveCount(0);
    await expect(drawer.getByText('Phòng Project')).toHaveCount(0);
    await page.keyboard.press('Escape');
    const confirm = page.locator('.ant-modal-confirm');
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.getByRole('button', { name: /Hủy tạo/ }).click();
    }
    await logout(page);

    const admin = await apiLogin(SEED_ACCOUNTS.admin.email, SEED_ACCOUNTS.admin.password);
    const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);
    const taskName = `E2E Creative PreStaff ${Date.now()}`;

    const { data: created } = await apiJson<TaskDto>('POST', '/tasks/my', admin.token, {
      projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
      projectManager: { code: 'PM.DEV', name: 'Dev PM' },
      taskName,
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
      description: 'TASK-62 creative with staff',
      designThinking: 2,
      technical: 2,
      contentProcessing: 2,
      additionalFactors: '',
      staff: [{ userId: employee.user.id, code: 'EMPLOYEE', name: 'Dev Employee' }],
      taskCategory: 'project',
      department: 'creative',
      staffConfirmation: 'not_updated',
      staffNote: '',
      urgency: 'auto',
    });

    expect(created.pipelineStage).toBe('assigned_staff');
    expect(created.department?.toLowerCase()).toMatch(/creative/);
    expect(created.staff?.some((member) => member.userId === employee.user.id)).toBeTruthy();

    const after = await getTask(admin.token, created.id);
    expect(after.pipelineStage).toBe('assigned_staff');

    await loginAs(page, 'employee');
    await page.goto(`/tasks/detail/${created.id}`);
    await expect(page.getByText(taskName).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: /Confirm|Xác nhận/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole('button', { name: /Từ chối/ }).filter({ hasNotText: 'nhận' }),
    ).toBeVisible();

    await logout(page);
    await loginAs(page, 'creative_head');
    await page.goto('/creative/review');
    await expect(page.locator('main').first()).toBeVisible({ timeout: 20_000 });
    const awaitingRow = page.locator('.ant-table-row').filter({ hasText: taskName });
    if ((await awaitingRow.count()) > 0) {
      await expect(awaitingRow.getByText('Chờ xử lý')).toHaveCount(0);
    } else {
      await expect(page.getByText(taskName)).toHaveCount(0);
    }
  });
});
