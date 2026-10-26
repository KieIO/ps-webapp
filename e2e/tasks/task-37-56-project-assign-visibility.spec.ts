import { test, expect, loginAs } from '../fixtures/auth';
import {
  apiFetch,
  apiJson,
  apiLogin,
  getTask,
  setupSplitFamily,
  SEED_ACCOUNTS,
  type TaskDto,
} from './helpers/splitFamilyApi';

/**
 * TASK-37 — Project-dept assign Staff (API + detail chrome).
 * TASK-56 — Split children hidden on Admin Project Tasks list.
 */

test.describe('TASK-37/56 project assign + split list visibility', () => {
  test('TASK-37 Admin/PM assign Staff on project task', async ({ page }) => {
    const admin = await apiLogin(SEED_ACCOUNTS.admin.email, SEED_ACCOUNTS.admin.password);
    const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);
    const taskName = `E2E Proj Assign ${Date.now()}`;

    const { data: created } = await apiJson<TaskDto>('POST', '/tasks/my', admin.token, {
      projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
      projectManager: { code: 'PM.DEV', name: 'Dev PM' },
      taskName,
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
      description: 'project assign',
      designThinking: 2,
      technical: 2,
      contentProcessing: 2,
      additionalFactors: '',
      staff: [{ userId: employee.user.id, code: 'EMPLOYEE', name: 'Dev Employee' }],
      taskCategory: 'project',
      department: 'project',
      staffConfirmation: 'not_updated',
      staffNote: '',
      urgency: 'auto',
    });

    const head = await apiLogin(SEED_ACCOUNTS.head.email, SEED_ACCOUNTS.head.password);
    const reassigned = await apiFetch('PATCH', `/tasks/my/${created.id}/assign`, admin.token, {
      staff: [{ userId: head.user.id, code: 'HEAD', name: 'Dev Department Head' }],
      staffNote: 'e2e reassign',
    });
    expect(reassigned.status).toBe(200);
    const after = await getTask(admin.token, created.id);
    expect(after.staff?.[0]?.userId).toBe(head.user.id);

    await loginAs(page, 'admin');
    await page.goto(`/tasks/detail/${created.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Dev Department Head|HEAD/i).first()).toBeVisible();
  });

  test('TASK-56 Admin list shows split parent with Đã chia nhỏ; child name not listed', async ({
    page,
  }) => {
    const taskName = `E2E Split Vis ${Date.now()}`;
    const { parent, children } = await setupSplitFamily({ taskName, qtyA: 4, qtyB: 4 });
    const childName = children[0]?.taskName ?? 'E2E Split A';

    await loginAs(page, 'admin');
    await page.goto('/tasks/project');
    await page.locator('#my-task-search').fill(taskName);
    const parentRow = page.locator('.ant-table-row').filter({ hasText: taskName });
    await expect(parentRow.first()).toBeVisible({ timeout: 30_000 });
    await expect(parentRow.first().getByText(/Đã chia nhỏ/)).toBeVisible();

    await page.locator('#my-task-search').fill(childName);
    await expect(page.locator('.ant-table-row').filter({ hasText: childName })).toHaveCount(0, {
      timeout: 15_000,
    });
    void parent;
  });
});
