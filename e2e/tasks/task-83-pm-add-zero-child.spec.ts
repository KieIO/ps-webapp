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
 * TASK-83 — After a creative task is split, the PM who created it opens
 * Sửa on the parent and adds another child with quantity 0 and no Staff.
 */

test.describe('TASK-83 PM adds an unassigned zero-quantity child after split', () => {
  test('PM saves a new child from the edit drawer without staff or quantity', async ({ page }) => {
    const taskName = `E2E PM Add Child ${Date.now()}`;
    const brief = `Để sau ${Date.now()}`;
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
    const parent = await splitAssign(pm.token, awaiting.id, staffIds[0]!, staffIds[1]!, 8, 8);
    expect(parent.pipelineStage).toBe('split');
    expect(parent.quantity).toBe(20);

    await loginAs(page, 'pm');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole('button', { name: /Sửa \/ Task nhỏ/ }).click();
    const drawer = page.getByRole('dialog', { name: /Sửa \/ Đổi giao task Creative/ });
    await expect(drawer.getByText('E2E Split A')).toBeVisible({ timeout: 20_000 });
    await expect(drawer.getByRole('button', { name: /Thêm task con/ })).toBeVisible();

    await drawer.getByRole('button', { name: /Thêm task con/ }).click();
    await drawer.getByLabel('Brief', { exact: true }).fill(brief);
    const quantity = drawer.getByRole('spinbutton').last();
    await expect(quantity).toHaveValue('0');
    await expect(drawer.getByText('Chưa gán Staff')).toBeVisible();

    await drawer.getByLabel('Lý do thay đổi').fill('bổ sung phần để sau');
    await drawer.getByRole('button', { name: 'Lưu thay đổi' }).click();
    await expect(drawer).toHaveCount(0, { timeout: 20_000 });

    const children = await listSplitChildren(pm.token, parent.id);
    expect(children).toHaveLength(3);
    const extra = children.find(
      (child: TaskDto) => child.quantity === 0 && (child.staff?.length ?? 0) === 0,
    );
    expect(extra?.description).toBe(brief);

    const reloaded = await apiJson<TaskDto>('GET', `/tasks/my/${parent.id}`, pm.token);
    expect(reloaded.data.quantity).toBe(20);
  });
});
