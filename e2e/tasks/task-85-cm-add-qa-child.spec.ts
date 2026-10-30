import { test, expect, loginAs } from '../fixtures/auth';
import {
  SEED_ACCOUNTS,
  apiJson,
  apiLogin,
  assignCm,
  createCreativeHandoff,
  listSplitChildren,
  splitAssign,
  type TaskDto,
} from './helpers/splitFamilyApi';

/**
 * TASK-85 — After split, CM adds a QA child (checkbox + QA level).
 * QA quantity sits outside parent SL; parent quantity stays unchanged.
 */

test.describe('TASK-85 CM adds a QA child outside parent quantity', () => {
  test('CM ticks Task QA, picks QA 3, saves; SL tổng unchanged', async ({ page }) => {
    const taskName = `E2E CM Add QA ${Date.now()}`;
    const brief = `QA lại slides ${Date.now()}`;
    const pm = await apiLogin(SEED_ACCOUNTS.pm.email, SEED_ACCOUNTS.pm.password);
    const ch = await apiLogin(
      SEED_ACCOUNTS.creative_head.email,
      SEED_ACCOUNTS.creative_head.password,
    );
    const cm = await apiLogin(
      SEED_ACCOUNTS.creative_manager.email,
      SEED_ACCOUNTS.creative_manager.password,
    );

    type StaffOption = { userId?: string };
    const { data: staffOptions } = await apiJson<StaffOption[]>(
      'GET',
      '/tasks/my/staff-options',
      cm.token,
    );
    const staffIds = (staffOptions ?? [])
      .map((entry) => entry.userId)
      .filter((id): id is string => Boolean(id));
    if (staffIds.length < 2) {
      throw new Error(`need ≥2 staff-options, got ${staffIds.length}`);
    }

    const created = await createCreativeHandoff(pm.token, taskName, 20);
    const awaiting = await assignCm(ch.token, created.id, cm.user.id);
    const parent = await splitAssign(pm.token, awaiting.id, staffIds[0]!, staffIds[1]!, 10, 10);
    expect(parent.pipelineStage).toBe('split');
    expect(parent.quantity).toBe(20);

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole('button', { name: /Sửa \/ Task nhỏ/ }).click();
    const drawer = page.getByRole('dialog', { name: /Sửa \/ Đổi giao task Creative/ });
    await expect(drawer.getByText('E2E Split A')).toBeVisible({ timeout: 20_000 });

    await drawer.getByRole('button', { name: /Thêm task con/ }).click();
    await drawer.getByRole('checkbox', { name: /Task QA/ }).check();
    await expect(drawer.getByText('· QA')).toBeVisible();

    await drawer.getByLabel('Loại QA').click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^QA 3$/ })
      .click();

    await drawer.getByLabel('Brief', { exact: true }).fill(brief);
    const quantity = drawer.getByRole('spinbutton').last();
    await quantity.fill('15');

    await drawer.getByLabel('Lý do thay đổi').fill('thêm QA kiểm lại');
    await drawer.getByRole('button', { name: 'Lưu thay đổi' }).click();
    await expect(drawer).toHaveCount(0, { timeout: 20_000 });

    const children = await listSplitChildren(cm.token, parent.id);
    expect(children).toHaveLength(3);
    const qa = children.find((child: TaskDto) => child.taskName === 'QA');
    expect(qa).toMatchObject({
      quantity: 15,
      level: 3,
      description: brief,
    });
    expect(qa?.staff ?? []).toHaveLength(0);

    const reloaded = await apiJson<TaskDto>('GET', `/tasks/my/${parent.id}`, cm.token);
    expect(reloaded.data.quantity).toBe(20);

    const nonQaSum = children
      .filter((child: TaskDto) => child.taskName !== 'QA')
      .reduce((sum, child) => sum + child.quantity, 0);
    expect(nonQaSum).toBe(20);
  });
});
