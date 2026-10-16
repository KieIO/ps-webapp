import { test, expect, loginAs, SEED_ACCOUNTS } from '../fixtures/auth';
import {
  TARGET_EMAIL,
  TARGET_NAME,
  apiJson,
  apiLoginOk,
  cancelAllOpenLeaves,
  createLeave,
  findUserIdByEmail,
  formatApiDate,
  listOpenLeaves,
} from './helpers';

/**
 * Leave multi-period smoke.
 * API creates scheduled periods (RangePicker is flaky in CI); UI verifies list + cancel.
 * Overlap guard is asserted via API (same BE rule the wizard uses).
 */
test.describe('Leave-01 multi-period schedule', () => {
  test('Admin sees two scheduled periods, cancels one, overlap rejected', async ({ page }) => {
    test.setTimeout(90_000);

    const admin = SEED_ACCOUNTS.admin;
    const { token } = await apiLoginOk(admin.email, admin.password);
    const userId = await findUserIdByEmail(token, TARGET_EMAIL);
    await cancelAllOpenLeaves(token, userId);

    const base = 120 + (Date.now() % 40);
    const period1Start = base;
    const period1End = base + 4;
    const period2Start = base + 15;
    const period2End = base + 19;
    const overlapStart = base + 2;
    const overlapEnd = base + 6;

    const first = await createLeave(
      token,
      userId,
      formatApiDate(period1Start),
      formatApiDate(period1End),
      `E2E leave period 1 ${Date.now()}`,
    );
    expect(first.status).toBe('scheduled');

    const second = await createLeave(
      token,
      userId,
      formatApiDate(period2Start),
      formatApiDate(period2End),
      `E2E leave period 2 ${Date.now()}`,
    );
    expect(second.status).toBe('scheduled');

    const userAfterCreate = await apiJson<{ status?: string }>('GET', `/users/${userId}`, token);
    expect(userAfterCreate.data.status).toBe('active');

    let open = await listOpenLeaves(token, userId);
    expect(open).toHaveLength(2);

    await loginAs(page, 'admin');
    await page.goto(`/users/${userId}`);
    await expect(page.getByRole('heading', { name: TARGET_NAME })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Scheduled & current')).toBeVisible();
    const periodRows = page
      .locator('li')
      .filter({ has: page.getByText('Scheduled', { exact: true }) });
    await expect(periodRows).toHaveCount(2, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Schedule leave' })).toBeVisible();
    await expect(page.getByText('Add another non-overlapping period')).toBeVisible();

    // Cancel the later period from UI so period 1 remains for overlap checks.
    await periodRows.nth(1).getByRole('button', { name: 'Cancel' }).click();
    const confirm = page.locator('.ant-modal-confirm').filter({ hasText: 'Cancel leave?' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Cancel leave' }).click();
    await expect(page.getByText('Leave cancelled')).toBeVisible({ timeout: 15_000 });

    open = await listOpenLeaves(token, userId);
    expect(open).toHaveLength(1);
    expect(open[0]?.startDate).toBe(formatApiDate(period1Start));
    await expect(periodRows).toHaveCount(1);

    const overlap = await apiJson('POST', `/users/${userId}/leave`, token, {
      startDate: formatApiDate(overlapStart),
      endDate: formatApiDate(overlapEnd),
      reason: `E2E overlap ${Date.now()}`,
      reassignments: [],
    });
    expect(overlap.status).toBe(409);
    expect(overlap.message ?? '').toMatch(/overlap/i);

    open = await listOpenLeaves(token, userId);
    expect(open).toHaveLength(1);

    await cancelAllOpenLeaves(token, userId);
  });
});
