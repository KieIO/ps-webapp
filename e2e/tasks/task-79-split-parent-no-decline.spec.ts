import { test, expect, loginAs } from '../fixtures/auth';
import { apiFetch, getTask, setupSplitFamily } from './helpers/splitFamilyApi';

/**
 * TASK-79 — Không cho từ chối trên task cha đã chia nhỏ.
 * UI: CM mở task cha → không có CTA Từ chối / Từ chối nhận (chỉ Sửa / Task nhỏ).
 * API: PATCH decline trên parent → 422; stage vẫn split.
 * API Go: TestTaskMgmt_TASK79_DeclineBlockedOnSplitParent.
 */
test.describe('TASK-79 decline blocked on split parent', () => {
  test('CM sees no refuse CTA; decline API returns 422; stage stays split', async ({ page }) => {
    const taskName = `E2E Split No Decline ${Date.now()}`;
    const { parent, cm } = await setupSplitFamily({
      taskName,
      qtyA: 4,
      qtyB: 4,
    });
    expect(parent.pipelineStage).toBe('split');

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Đã chia nhỏ/).first()).toBeVisible({ timeout: 15_000 });

    await expect(page.getByRole('button', { name: /Từ chối nhận/ })).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Từ chối/ }).filter({ hasNotText: 'nhận' }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Sửa / Task nhỏ' })).toBeVisible({
      timeout: 15_000,
    });

    const declined = await apiFetch('PATCH', `/tasks/my/${parent.id}/status`, cm.token, {
      staffConfirmation: 'decline',
      staffNote: 'should not rollback split parent',
    });
    expect(declined.status).toBeGreaterThanOrEqual(400);
    expect(`${declined.message ?? ''} ${JSON.stringify(declined.data)}`.toLowerCase()).toMatch(
      /chia nhỏ|split/,
    );

    const after = await getTask(cm.token, parent.id);
    expect(after.pipelineStage).toBe('split');
    expect(after.staffConfirmation === 'decline').toBeFalsy();
  });
});
