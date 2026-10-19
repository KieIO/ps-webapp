import { test, expect } from '../fixtures/auth';
import {
  MILESTONE_PROJECT_NAME,
  addMilestoneBar,
  loginAndOpenTracker,
  openProjectBar,
} from './helpers';

/**
 * MS-09 (UI) — Employee cannot open milestone manage UI / no add control.
 * API: TestMilestone_MS09_EmployeeDenied in ps-be.
 */
test.describe('MS-09 Employee manage chrome hidden', () => {
  test('Employee sees tracker but no Add milestone bar control', async ({ page }) => {
    await loginAndOpenTracker(page, 'employee');

    await expect(addMilestoneBar(page)).toHaveCount(0);
    // Non-managers keep the project bar as a link to project detail.
    await expect(openProjectBar(page)).toBeVisible({ timeout: 30_000 });

    // Clicking the open-project bar must not open MilestoneQuickModal.
    await openProjectBar(page).click();
    await expect(page).toHaveURL(new RegExp(`/projects/`));
    await expect(page.getByRole('dialog').getByText(/Thêm mốc|Sửa mốc/)).toHaveCount(0);

    // Back on tracker: no manage modal strings from accidental affordances.
    await page.goto('/');
    await expect(page.getByRole('link', { name: MILESTONE_PROJECT_NAME }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
