import { test, expect, loginAs, logout, SEED_ACCOUNTS } from '../fixtures/auth';
import {
  apiLogin,
  assignCm,
  createCreativeHandoff,
  apiJson,
  type TaskDto,
} from './helpers/creativeDeclineApi';

/**
 * TASK-77 — Creative Manager từ chối nhận → task về hàng chờ Creative Head.
 * API: TestTaskMgmt_TASK77_CMRefuseReturnsToCH in ps-be.
 */
test.describe('TASK-77 CM refuse returns to CH queue', () => {
  test('CM refuses awaiting_cm task; CH sees it back in Creative review', async ({ page }) => {
    const taskName = `E2E CM Refuse CH ${Date.now()}`;
    const reason = `CM overload ${Date.now()}`;
    const pm = SEED_ACCOUNTS.pm;
    const ch = SEED_ACCOUNTS.creative_head;
    const cm = SEED_ACCOUNTS.creative_manager;

    const { token: pmToken } = await apiLogin(pm.email, pm.password);
    const { token: chToken } = await apiLogin(ch.email, ch.password);
    const { user: cmUser } = await apiLogin(cm.email, cm.password);
    const created = await createCreativeHandoff(pmToken, taskName);
    await assignCm(chToken, created.id, cmUser.id);

    await loginAs(page, 'creative_manager');
    await page.goto('/creative/review');
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 30_000 });
    await page.getByText(taskName).click();

    const refuseBtn = page.getByRole('button', { name: /Từ chối nhận/ });
    await expect(refuseBtn).toBeVisible({ timeout: 15_000 });
    await refuseBtn.click();

    const confirm = page.locator('.ant-modal-confirm').last();
    await expect(confirm.locator('.ant-modal-confirm-title')).toHaveText('Từ chối nhận task này?');
    await confirm.locator('textarea').fill(reason);
    await confirm.getByRole('button', { name: 'Từ chối', exact: true }).click();
    await expect(page.getByText('Đã từ chối task')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(taskName)).toHaveCount(0, { timeout: 20_000 });

    const after = await apiJson<TaskDto>('GET', `/tasks/my/${created.id}`, chToken);
    expect(after.ok).toBeTruthy();
    expect(after.data.pipelineStage).toBe('awaiting_ch');
    expect(after.data.staffConfirmation).toBe('not_updated');

    await logout(page);
    await loginAs(page, 'creative_head');
    await page.goto('/creative/review');
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Chờ xử lý').first()).toBeVisible();
  });
});
