import { test, expect } from '../fixtures/auth';
import { createEmptyVolumeMilestone, loginAndOpenTracker, milestoneMarker } from './helpers';

/**
 * MS-11 (UI) — Non-DA/Slides quick view shows `Tên mốc - Ghi chú`.
 * API: TestMilestone_MS11_EmptyVolumeOK in ps-be.
 */
test.describe('MS-11 Empty-volume quick view', () => {
  test('hover popover shows name - note without khối lượng line', async ({ page }) => {
    const stamp = Date.now();
    const name = `E2E Kickoff ${stamp}`;
    const note = `Họp nội bộ ${stamp}`;

    await loginAndOpenTracker(page, 'admin');
    await createEmptyVolumeMilestone(page, { name, note });

    const marker = milestoneMarker(page, name);
    await marker.hover();

    const popover = page.locator('.ant-popover:not(.ant-popover-hidden)').last();
    const expectedLine = `${name} - ${note}`;
    await expect(popover.getByText(expectedLine, { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(popover.getByText(/Hạn nộp:/)).toBeVisible();
    // Empty volume must not show the khối lượng row.
    await expect(popover.getByText(/^Khối lượng:/)).toHaveCount(0);
  });
});
