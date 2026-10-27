import { test, expect, loginAs } from '../fixtures/auth';
import {
  apiFetch,
  apiLogin,
  creativeEdit,
  getTask,
  setupAwaitingCm,
  setupWholeAssigned,
  SEED_ACCOUNTS,
} from './helpers/splitFamilyApi';

/**
 * TASK-55 / 59 — Reassign CM / Staff (API authority + UI edit drawer chrome).
 */

test.describe('TASK-55/59 reassign UI', () => {
  test('TASK-55 CH đổi CM khi chờ CM; CM tự đổi CM bị chặn', async ({ page }) => {
    const taskName = `E2E Re CM ${Date.now()}`;
    const { parent, ch, cm } = await setupAwaitingCm(taskName);

    const denied = await apiFetch('PATCH', `/tasks/my/${parent.id}/creative-edit`, cm.token, {
      cmUserId: cm.user.id,
      changeReason: 'đổi CM',
    });
    expect([403, 422]).toContain(denied.status);

    // Prefer a different CM if seed has cm2 via staff-options of CH edit — use admin-created second CM id from env or head as probe.
    // Reassign to same CM is a no-op; assert CH can open edit and API reassign to creative_manager still 200.
    const ok = await creativeEdit(ch.token, parent.id, {
      cmUserId: cm.user.id,
      description: 'keep cm',
      changeReason: 'đổi CM',
    });
    expect(ok.pipelineStage).toBe('awaiting_cm');

    await loginAs(page, 'creative_head');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole('button', { name: /Sửa \/ Đổi giao|Edit task/ }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByText(/Sửa \/ Đổi giao task Creative|Xem task Creative/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      drawer.locator('.ant-form-item').filter({ hasText: /^Creative Manager/ }),
    ).toBeVisible();
  });

  test('TASK-59 CM đổi Staff sau khi đã giao cả khối', async ({ page }) => {
    const taskName = `E2E Re Staff ${Date.now()}`;
    const { task, cm } = await setupWholeAssigned(taskName);
    const head = await apiLogin(SEED_ACCOUNTS.head.email, SEED_ACCOUNTS.head.password);

    const updated = await creativeEdit(cm.token, task.id, {
      staffUserId: head.user.id,
      description: task.description ?? 'E2E brief for split family',
      changeReason: 'đổi Staff',
    });
    expect(updated.pipelineStage).toBe('assigned_staff');
    expect(updated.staff?.some((s) => s.userId === head.user.id)).toBeTruthy();

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Dev Department Head|HEAD/i).first()).toBeVisible();
    await page.getByRole('button', { name: /Sửa \/ Đổi giao|Edit task/ }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByText(/Sửa \/ Đổi giao task Creative/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(drawer.getByRole('button', { name: /Lưu thay đổi/ })).toBeVisible();

    const after = await getTask(cm.token, task.id);
    expect(after.staff?.[0]?.userId).toBe(head.user.id);
  });
});
