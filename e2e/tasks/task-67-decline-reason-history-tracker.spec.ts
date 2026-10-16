import { test, expect, loginAs, logout, SEED_ACCOUNTS } from '../fixtures/auth';
import {
  apiLogin,
  assignCm,
  createCreativeHandoff,
  declineTask,
  fetchTracker,
  trackerHasTaskLabel,
} from './helpers/creativeDeclineApi';

/**
 * TASK-67 — Decline UX gaps (15/10 update):
 * - Required decline reason (UI + API)
 * - Reason appears in task History for PM
 * - CM refuse with reason returns to CH queue
 * - Declined sticky tasks do not appear on Tracker
 */
test.describe('TASK-67 decline reason, history, tracker', () => {
  test('CH refuse blocks empty reason; reason shows in PM history; hidden on tracker', async ({
    page,
  }) => {
    const taskName = `E2E Decline Reason ${Date.now()}`;
    const reason = `Thiếu scope pack ${Date.now()}`;
    const pm = SEED_ACCOUNTS.pm;
    const ch = SEED_ACCOUNTS.creative_head;

    const { token: pmToken } = await apiLogin(pm.email, pm.password);
    const { token: chToken } = await apiLogin(ch.email, ch.password);
    const created = await createCreativeHandoff(pmToken, taskName);

    const emptyApi = await declineTask(chToken, created.id, '   ');
    expect(emptyApi.ok).toBeFalsy();

    await loginAs(page, 'creative_head');
    await page.goto('/creative/review');
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 30_000 });
    await page.getByText(taskName).click();

    const refuseBtn = page.getByRole('button', { name: /Từ chối nhận/ });
    await expect(refuseBtn).toBeVisible({ timeout: 15_000 });
    await refuseBtn.click();

    const confirm = page.locator('.ant-modal-confirm').last();
    await expect(confirm.locator('.ant-modal-confirm-title')).toHaveText('Từ chối nhận task này?');
    await confirm.getByRole('button', { name: 'Từ chối', exact: true }).click();
    await expect(page.getByText(/Vui lòng nhập lý do từ chối/)).toBeVisible({ timeout: 10_000 });

    await confirm.locator('textarea').fill(reason);
    await confirm.getByRole('button', { name: 'Từ chối', exact: true }).click();
    await expect(page.getByText('Đã từ chối task')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(taskName)).toHaveCount(0, { timeout: 20_000 });

    const tracker = await fetchTracker(chToken);
    expect(trackerHasTaskLabel(tracker, taskName)).toBeFalsy();

    await logout(page);
    await loginAs(page, 'pm');
    await page.goto(`/tasks/detail/${created.id}`);
    await expect(page.getByText(taskName).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Đã từ chối|Chờ PM xử lý/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
    await expect(page.getByText(reason)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Đưa lại CH' })).toBeVisible();
  });

  test('CM refuse requires reason and returns task to CH queue', async ({ page }) => {
    const taskName = `E2E CM Refuse ${Date.now()}`;
    const reason = `CM overload ${Date.now()}`;
    const pm = SEED_ACCOUNTS.pm;
    const ch = SEED_ACCOUNTS.creative_head;
    const cm = SEED_ACCOUNTS.creative_manager;

    const { token: pmToken } = await apiLogin(pm.email, pm.password);
    const { token: chToken } = await apiLogin(ch.email, ch.password);
    const { token: cmToken, user: cmUser } = await apiLogin(cm.email, cm.password);
    const created = await createCreativeHandoff(pmToken, taskName);
    await assignCm(chToken, created.id, cmUser.id);

    const emptyApi = await declineTask(cmToken, created.id, '');
    expect(emptyApi.ok).toBeFalsy();

    await loginAs(page, 'creative_manager');
    await page.goto('/creative/review');
    // CM default view is CM intake — task should be awaiting_cm
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

    await logout(page);
    await loginAs(page, 'creative_head');
    await page.goto('/creative/review');
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Chờ xử lý').first()).toBeVisible();
  });
});
