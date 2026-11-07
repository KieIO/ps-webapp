import { test, expect, loginAs, logout, expectSidebarHasTaskScores } from '../fixtures/auth';

/**
 * TSCORE-39 / A1–A3 — Sidebar Task types & scores by role
 * MANAGE_TASK_SCORES: Admin / Head / Creative Head; not PM / Employee / CM.
 */
test.describe('TSCORE-39 Sidebar Task types & scores by role', () => {
  test('visible for Admin/Head/CH; hidden for PM/Employee/CM', async ({ page }) => {
    test.setTimeout(90_000);
    await loginAs(page, 'admin');
    await expect(page.locator('aside').getByRole('menuitem', { name: /\bSettings\b/ })).toBeVisible(
      {
        timeout: 15_000,
      },
    );
    await expectSidebarHasTaskScores(page, true);
    await logout(page);

    await loginAs(page, 'head');
    await expectSidebarHasTaskScores(page, true);
    await logout(page);

    await loginAs(page, 'creative_head');
    await expectSidebarHasTaskScores(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasTaskScores(page, false);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasTaskScores(page, false);
    await logout(page);

    await loginAs(page, 'creative_manager');
    await expectSidebarHasTaskScores(page, false);
  });
});
