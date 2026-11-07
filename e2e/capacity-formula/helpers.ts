import { expect, type Locator, type Page } from '@playwright/test';

export function visibleSelectDropdown(page: Page): Locator {
  return page
    .locator('.ant-select-dropdown:visible')
    .filter({ hasNot: page.locator('.ant-slide-up-leave') })
    .last();
}

export async function selectFilterById(
  page: Page,
  selectId: string,
  option: string | RegExp,
): Promise<void> {
  await page.locator(`#${selectId}`).click();
  const dropdown = visibleSelectDropdown(page);
  await expect(dropdown).toBeVisible();
  await dropdown.getByText(option).first().click();
}

export function titleRow(page: Page, code: string): Locator {
  return page.getByRole('row').filter({ has: page.getByRole('cell', { name: code, exact: true }) });
}

/** Capacity/ngày then Tỷ lệ CM/QL spinbuttons in an editable formula row. */
export function capacityInputs(row: Locator): { capacity: Locator; ratio: Locator } {
  const inputs = row.locator('.ant-input-number-input');
  return { capacity: inputs.nth(0), ratio: inputs.nth(1) };
}

/** Điểm task CM column (after Code, Title, Capacity, Ratio). */
export function specialistPointsCell(row: Locator): Locator {
  return row.locator('td').nth(4);
}

export async function setCapacityField(page: Page, input: Locator, value: number): Promise<void> {
  const current = await input.inputValue();
  if (current === String(value)) return;

  // Ant InputNumber often ignores locator.fill() for React onChange — type instead.
  await input.click();
  await input.press(process.platform === 'darwin' ? 'Meta+a' : 'Control+a');
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes('/job-titles/') &&
        res.url().includes('/capacity') &&
        res.request().method() === 'PATCH' &&
        res.status() < 400,
      { timeout: 15_000 },
    ),
    (async () => {
      await input.pressSequentially(String(value), { delay: 20 });
      await input.press('Enter');
    })(),
  ]);
  await expect(input).toHaveValue(String(value));
}

export const formatPointsVi = (value: number) => value.toLocaleString('vi-VN');
