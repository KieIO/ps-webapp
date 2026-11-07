import { test, expect, loginAs } from '../fixtures/auth';
import {
  capacityInputs,
  formatPointsVi,
  setCapacityField,
  specialistPointsCell,
  titleRow,
} from './helpers';

const SEED_CAPACITY = 378;
const SEED_RATIO = 100;

/**
 * CAP-33 / C1–C3 — Inline edit capacity/ratio; Điểm task CM recomputes; noop blur skips PATCH
 */
test.describe('CAP-33 Inline edit capacity formula', () => {
  test('Admin can edit capacity and ratio; formula updates; unchanged blur skips PATCH', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/employee-capacity-formula');

    await page.locator('#title-search').fill('JPE-1');
    const row = titleRow(page, 'JPE-1');
    await expect(row).toBeVisible({ timeout: 15_000 });

    const { capacity, ratio } = capacityInputs(row);

    // Normalize seed (prior runs may have left edits)
    await setCapacityField(page, capacity, SEED_CAPACITY);
    await setCapacityField(page, ratio, SEED_RATIO);
    await expect(capacity).toHaveValue(String(SEED_CAPACITY));
    await expect(ratio).toHaveValue(String(SEED_RATIO));
    await expect(specialistPointsCell(row)).toHaveText(formatPointsVi(SEED_CAPACITY));

    // C1 — edit Capacity/ngày → Điểm task CM = round(400 * 100 / 100) = 400
    await setCapacityField(page, capacity, 400);
    await expect(specialistPointsCell(row)).toHaveText(formatPointsVi(400), { timeout: 15_000 });

    // C2 — edit Tỷ lệ CM/QL → points = round(400 * 50 / 100) = 200; max clamped to 100
    await setCapacityField(page, ratio, 50);
    await expect(specialistPointsCell(row)).toHaveText(formatPointsVi(200), { timeout: 15_000 });
    await expect(ratio).toHaveAttribute('aria-valuemax', '100');
    await expect(ratio).toHaveAttribute('aria-valuemin', '0');

    // C3 — Enter with unchanged value → no PATCH
    let patchSeen = false;
    const onRequest = (req: { method: () => string; url: () => string }) => {
      if (
        req.method() === 'PATCH' &&
        req.url().includes('/job-titles/') &&
        req.url().includes('/capacity')
      ) {
        patchSeen = true;
      }
    };
    page.on('request', onRequest);
    await ratio.click();
    await ratio.press('Enter');
    await page.waitForTimeout(800);
    page.off('request', onRequest);
    expect(patchSeen).toBe(false);
    await expect(ratio).toHaveValue('50');

    // Restore seed defaults for other suites
    await setCapacityField(page, ratio, SEED_RATIO);
    await setCapacityField(page, capacity, SEED_CAPACITY);
    await expect(specialistPointsCell(row)).toHaveText(formatPointsVi(SEED_CAPACITY), {
      timeout: 15_000,
    });
  });
});
