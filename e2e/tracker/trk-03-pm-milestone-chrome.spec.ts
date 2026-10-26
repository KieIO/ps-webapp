import { test, expect } from '../fixtures/auth';
import { formatDeadlineUi, openCreateMilestoneModal } from '../milestones/helpers';
import {
  addMilestoneBar,
  adminToken,
  clearMilestonesForFixture,
  findProjectByName,
  loginSeedProjectPm,
  openTrackerProject,
  patchProjectDates,
  resolveTrackerFixture,
} from './helpers';

function isoTodayOffset(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * TRK-03 — PM thêm mốc trên Tracker (FE chrome khớp BE; không còn FE cho / BE 403).
 * Overlaps MS-03 seed-PM slice; kept here for Tracker sheet TRK coverage.
 */
test.describe('TRK-03 PM milestone chrome on Tracker', () => {
  let originalStart = '';
  let originalEnd = '';
  let projectId = '';
  let projectName = '';

  test.beforeEach(async () => {
    const fixture = await resolveTrackerFixture();
    projectId = fixture.projectId;
    projectName = fixture.projectName;

    const token = await adminToken();
    const current = await findProjectByName(token, projectName);
    originalStart = current.startDate.slice(0, 10);
    originalEnd = current.endDate.slice(0, 10);

    const patched = await patchProjectDates(token, projectId, {
      startDate: isoTodayOffset(-7),
      endDate: isoTodayOffset(21),
      name: projectName,
    });
    if (!patched.ok) {
      throw new Error(`expand project dates failed: ${patched.status} ${await patched.text()}`);
    }
    await clearMilestonesForFixture();
  });

  test.afterEach(async () => {
    if (!projectId || !originalStart || !originalEnd) return;
    const token = await adminToken();
    await patchProjectDates(token, projectId, {
      startDate: originalStart,
      endDate: originalEnd,
      name: projectName,
    });
  });

  test('Seed PM sees Add-milestone bar and can create a mốc', async ({ page }) => {
    await loginSeedProjectPm(page);
    await openTrackerProject(page);

    const bar = addMilestoneBar(page, projectName);
    await expect(bar).toBeVisible({ timeout: 30_000 });

    const name = `E2E TRK-03 ${Date.now()}`;
    await openCreateMilestoneModal(page, projectName);
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Tên mốc').fill(name);

    const deadline = formatDeadlineUi(0);
    const deadlineInput = dialog.getByLabel('Ngày deadline');
    await deadlineInput.click();
    await deadlineInput.fill(deadline);
    await deadlineInput.press('Enter');

    // Slides makes khối lượng required. Others is the default and does not require it.
    await dialog.getByLabel('Đơn vị').click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^Slides$/ })
      .click();
    await dialog.getByLabel('Khối lượng').fill('1');

    await dialog.getByRole('button', { name: 'Thêm mốc' }).click();
    await expect(page.getByText('Đã thêm mốc bàn giao')).toBeVisible({ timeout: 15_000 });
    await expect(dialog).toHaveCount(0);
  });
});
