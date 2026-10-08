import {
  test,
  expect,
  loginAs,
  logout,
  expectSidebarHasTaskScores,
} from '../fixtures/auth';

/**
 * TSCORE-39 — Sidebar “Task types & scores” by role
 * Default MANAGE_TASK_SCORES: creative_head, head, admin.
 */
test.describe('TSCORE-39 Sidebar Task types & scores by role', () => {
  test('visible for Admin/Head; hidden for PM/Employee', async ({ page }) => {
    await loginAs(page, 'admin');
    await expectSidebarHasTaskScores(page, true);
    await logout(page);

    await loginAs(page, 'head');
    await expectSidebarHasTaskScores(page, true);
    await logout(page);

    await loginAs(page, 'pm');
    await expectSidebarHasTaskScores(page, false);
    await logout(page);

    await loginAs(page, 'employee');
    await expectSidebarHasTaskScores(page, false);
  });
});
