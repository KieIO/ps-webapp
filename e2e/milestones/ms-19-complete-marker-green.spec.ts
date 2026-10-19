import { test } from '../fixtures/auth';
import {
  createEmptyVolumeMilestone,
  editMilestoneComplete,
  expectMarkerColor,
  loginAndOpenTracker,
} from './helpers';

/**
 * MS-19 (UI) + MS-14 — Edit + tick Hoàn thành → marker red → green.
 * API: TestMilestone_MS14_* / TestMilestone_MS19_* in ps-be.
 */
test.describe('MS-19 Complete checkbox → green marker', () => {
  test('incomplete red; Hoàn thành saves green', async ({ page }) => {
    const name = `E2E Complete ${Date.now()}`;

    await loginAndOpenTracker(page, 'head');
    await createEmptyVolumeMilestone(page, { name, note: 'tick complete' });
    await expectMarkerColor(page, name, 'red');

    await editMilestoneComplete(page, name);
    await expectMarkerColor(page, name, 'green');
  });
});
