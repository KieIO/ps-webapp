import { expect, type Locator, type Page } from '@playwright/test';

export const uniqueTaskScoreName = (prefix = 'E2E Score') =>
  `${prefix} ${Date.now().toString(36).slice(-6).toUpperCase()}`;

export const uniqueGroupLabel = (prefix = 'E2E Group') =>
  `${prefix} ${Date.now().toString(36).slice(-6).toUpperCase()}`;

export async function expectToast(page: Page, text: string | RegExp): Promise<void> {
  await expect(page.locator('.ant-message-notice').filter({ hasText: text }).first()).toBeVisible({
    timeout: 15_000,
  });
}

export function visibleSelectDropdown(page: Page): Locator {
  return page
    .locator('.ant-select-dropdown:visible')
    .filter({ hasNot: page.locator('.ant-slide-up-leave') })
    .last();
}

export async function openCreateTaskDialog(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: /Create task/i }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Create task')).toBeVisible();
  return dialog;
}

export async function selectFormAntOption(
  scope: Locator,
  page: Page,
  label: string,
  option: string | RegExp,
): Promise<void> {
  await scope.getByRole('combobox', { name: label }).click();
  const dropdown = visibleSelectDropdown(page);
  await expect(dropdown).toBeVisible();
  const optionLocator =
    typeof option === 'string'
      ? dropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${option}$`) })
      : dropdown.locator('.ant-select-item-option').filter({ hasText: option });
  await optionLocator.first().click();
  await expect(dropdown).toBeHidden({ timeout: 10_000 });
}

export async function fillScore(dialog: Locator, score: number): Promise<void> {
  const input = dialog.getByRole('spinbutton', { name: 'Score' });
  await input.click();
  await input.fill(String(score));
}

/** Task type auto-fills from name, so both cells can match — prefer the row. */
export function taskScoreRow(page: Page, name: string): Locator {
  return page.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) });
}
