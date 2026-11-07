import { expect, type Locator, type Page } from '@playwright/test';
import { SEED_ACCOUNTS } from '../fixtures/auth';

const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export const uniqueCode = (prefix: string) =>
  `${prefix}${Date.now().toString(36).slice(-6).toUpperCase()}`;

export async function openCreateDialog(page: Page, buttonName: RegExp): Promise<Locator> {
  await page.getByRole('button', { name: buttonName }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function fillCodeAndLabel(
  dialog: Locator,
  code: string,
  label: string,
): Promise<void> {
  await dialog.getByLabel('Code').fill(code);
  await dialog.getByLabel('Label').fill(label);
}

export async function selectFormAntOption(
  scope: Locator,
  page: Page,
  label: string,
  option: string | RegExp,
): Promise<void> {
  const item = scope.locator('.ant-form-item').filter({ hasText: label });
  await item.locator('.ant-select').click();
  const dropdown = visibleSelectDropdown(page);
  await expect(dropdown).toBeVisible();
  await dropdown.getByText(option).first().click();
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

export async function expectToast(page: Page, text: string | RegExp): Promise<void> {
  await expect(page.locator('.ant-message-notice').filter({ hasText: text }).first()).toBeVisible({
    timeout: 15_000,
  });
}

/** Visible Ant Select dropdown (ignore leave-animation leftovers). */
export function visibleSelectDropdown(page: Page): Locator {
  return page
    .locator('.ant-select-dropdown:visible')
    .filter({ hasNot: page.locator('.ant-slide-up-leave') })
    .last();
}

export async function apiLoginOk(
  email: string,
  password: string,
): Promise<{ token: string; user: { id: string } }> {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const parsed = (await response.json()) as {
    data?: { token?: string; accessToken?: string; user?: { id: string } };
    token?: string;
    user?: { id: string };
    message?: string;
  };
  const token = parsed.data?.token ?? parsed.data?.accessToken ?? parsed.token;
  const user = parsed.data?.user ?? parsed.user;
  if (!response.ok || !token || !user?.id) {
    throw new Error(`login failed ${response.status}: ${parsed.message ?? JSON.stringify(parsed)}`);
  }
  return { token, user };
}

export async function seedEmployeeUserId(): Promise<string> {
  const account = SEED_ACCOUNTS.employee;
  const { user } = await apiLoginOk(account.email, account.password);
  return user.id;
}
