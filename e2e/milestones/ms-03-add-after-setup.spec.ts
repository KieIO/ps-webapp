import { test, logout } from '../fixtures/auth';
import {
  SEED_PROJECT_PM,
  addMilestoneBar,
  clearMilestoneProjectViaApi,
  createEmptyVolumeMilestone,
  loginAndOpenTracker,
  loginWithCredentials,
  openTracker,
} from './helpers';

/**
 * MS-03 (UI) — Add milestone after setup via MilestoneQuickModal.
 * Also covers manage chrome for Head/Admin (MS-07/08) and seed project PM (MS-05 UI).
 * API: TestMilestone_MS03_* / MS05 / MS07 / MS08 in ps-be.
 */
test.describe('MS-03 Add milestone after setup (tracker QuickModal)', () => {
  test.beforeEach(async () => {
    await clearMilestoneProjectViaApi();
  });

  test('Admin and Head open QuickModal and add milestone', async ({ page }) => {
    const stamp = Date.now();

    await loginAndOpenTracker(page, 'admin');
    await addMilestoneBar(page).waitFor({ state: 'visible', timeout: 30_000 });
    await createEmptyVolumeMilestone(page, { name: `E2E Admin mốc ${stamp}`, dayOffset: 0 });
    await logout(page);

    await loginAndOpenTracker(page, 'head');
    await addMilestoneBar(page).waitFor({ state: 'visible', timeout: 30_000 });
    await createEmptyVolumeMilestone(page, { name: `E2E Head mốc ${stamp}`, dayOffset: 1 });
  });

  test('Seed project PM can open QuickModal and add milestone', async ({ page }) => {
    // pm@pokeslide.dev has empty tracker scope; cuong.le is PM on Sanofi Meninga.
    await loginWithCredentials(page, SEED_PROJECT_PM.email, SEED_PROJECT_PM.password);
    await openTracker(page);
    await addMilestoneBar(page).waitFor({ state: 'visible', timeout: 30_000 });
    await createEmptyVolumeMilestone(page, { name: `E2E PM mốc ${Date.now()}`, dayOffset: 2 });
  });
});
