import { test, expect, loginAs, logout, SEED_ACCOUNTS } from '../fixtures/auth';
import {
  apiLogin,
  loginSeedProjectPm,
  openTrackerProject,
  patchProjectUrgency,
  resolveTrackerFixture,
  urgencyDotForProject,
} from './helpers';

/**
 * TRK-01 — PM đổi urgency trên Tracker (chấm ưu tiên); Employee API 403.
 * API: TestProjectMgmt_PM46b_* in ps-be.
 */
test.describe('TRK-01 PM urgency on Tracker', () => {
  test('Seed PM changes urgency via Tracker dot; Employee PATCH returns 403', async ({ page }) => {
    const fixture = await resolveTrackerFixture();

    await loginSeedProjectPm(page);
    await openTrackerProject(page);

    const dot = urgencyDotForProject(page, fixture.projectName);
    await expect(dot).toBeVisible({ timeout: 30_000 });
    await expect(dot).toHaveAttribute('aria-label', /Đổi mức ưu tiên/);

    const before = (await dot.getAttribute('aria-label')) ?? '';
    const nextLabel = /Medium priority/.test(before) ? 'High priority' : 'Medium priority';

    await dot.click();
    const menu = page.getByRole('menu').filter({ hasText: 'High priority' });
    await expect(menu).toBeVisible();
    await menu.getByRole('menuitemradio', { name: nextLabel }).click();
    await expect(page.getByText('Đã cập nhật mức ưu tiên')).toBeVisible({ timeout: 15_000 });
    await expect(dot).toHaveAttribute('aria-label', new RegExp(nextLabel));

    await logout(page);

    // Creative Head can view Tracker but must not get the edit affordance.
    await loginAs(page, 'creative_head');
    await openTrackerProject(page);
    await expect(page.getByRole('button', { name: /Đổi mức ưu tiên/ })).toHaveCount(0);

    // Employee: API 403 (Excel TRK-01).
    const employeeTok = await apiLogin(
      SEED_ACCOUNTS.employee.email,
      SEED_ACCOUNTS.employee.password,
    );
    const denied = await patchProjectUrgency(employeeTok, fixture.projectId, 'orange');
    expect(denied.status).toBe(403);

    // Restore Auto so later runs stay stable.
    const adminTok = await apiLogin(SEED_ACCOUNTS.admin.email, SEED_ACCOUNTS.admin.password);
    await patchProjectUrgency(adminTok, fixture.projectId, 'auto');
  });
});
