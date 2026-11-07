import { type Locator, type Page } from '@playwright/test';
import { SEED_ACCOUNTS, test, expect, loginAs } from '../fixtures/auth';
import {
  apiLoginOk,
  expectToast,
  openCreateDialog,
  seedEmployeeUserId,
  selectFormAntOption,
  uniqueCode,
  visibleSelectDropdown,
} from './helpers';

const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

function formItemByLabel(page: Page, label: string): Locator {
  return page.locator('.ant-form-item').filter({
    has: page.locator('label').filter({ hasText: new RegExp(`^${label}$`) }),
  });
}

async function chooseSelectOption(
  page: Page,
  label: string,
  option: string,
  searchable = false,
): Promise<void> {
  const item = formItemByLabel(page, label);
  await item.locator('.ant-select').click();
  const dropdown = visibleSelectDropdown(page);
  await expect(dropdown).toBeVisible();
  if (searchable) {
    await item.locator('.ant-select input').fill(option);
  }
  await dropdown
    .locator('.ant-select-item-option-content')
    .filter({ hasText: option })
    .first()
    .click();
  await expect(item.locator('.ant-select')).toContainText(option);
}

async function apiJson<T>(method: string, path: string, token: string, body?: unknown): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const parsed = (await response.json()) as { data?: T; message?: string };
  if (!response.ok) {
    throw new Error(`${method} ${path} → ${response.status}: ${parsed.message ?? ''}`);
  }
  return (parsed.data ?? parsed) as T;
}

/**
 * TITLE-44 / E2+E3 — Level change clears mismatched title; assign new title persists
 */
test.describe('TITLE-44 User level clear + assign new title', () => {
  test('Changing level clears mismatched title; new title can be saved on user', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const userId = await seedEmployeeUserId();
    const titleCode = uniqueCode('UE');
    const titleName = `E2E User Title ${titleCode}`;

    const admin = SEED_ACCOUNTS.admin;
    const { token } = await apiLoginOk(admin.email, admin.password);

    // Seed user with Junior + JPE-1 so E2 starts from a known mismatched state when Level→Manager.
    const titles = await apiJson<{ items: Array<{ id: string; code: string }> }>(
      'GET',
      '/job-titles?search=JPE-1',
      token,
    );
    const jpe1 = titles.items.find((t) => t.code === 'JPE-1');
    if (!jpe1) throw new Error('seed title JPE-1 not found');

    const user = await apiJson<{
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      department: string;
      jobTitleId?: string | null;
    }>('GET', `/users/${userId}`, token);

    await apiJson('PATCH', `/users/${userId}`, token, {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      jobTitleId: jpe1.id,
    });

    await loginAs(page, 'admin');

    // Create a fresh Junior title for E3
    await page.goto('/settings/titles');
    const titleDialog = await openCreateDialog(page, /Create job title/);
    await titleDialog.getByLabel('Code').fill(titleCode);
    await titleDialog.getByLabel('Title').fill(titleName);
    await selectFormAntOption(titleDialog, page, 'Job level', /JUNIOR/);
    await selectFormAntOption(titleDialog, page, 'Job group', /STAFF/);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/job-titles') &&
          res.request().method() === 'POST' &&
          res.status() < 400,
      ),
      titleDialog.getByRole('button', { name: 'Create' }).click(),
    ]);
    await expectToast(page, 'Job title created');
    await expect(titleDialog).toBeHidden();

    await page.goto(`/users/${userId}`);
    await expect(page.getByRole('heading', { name: /Dev Employee|Employee/i })).toBeVisible({
      timeout: 20_000,
    });

    const levelItem = formItemByLabel(page, 'Level');
    const positionItem = formItemByLabel(page, 'Position code');
    await expect(positionItem.locator('.ant-select')).toContainText('JPE-1');
    await expect(levelItem.locator('.ant-select')).toContainText('Junior');

    // E2 — switch to Manager → clear mismatched title
    await chooseSelectOption(page, 'Level', 'Manager');
    await expect(
      positionItem.getByText('Select a position code and job title for this level'),
    ).toBeVisible();
    await expect(positionItem.locator('.ant-select')).not.toContainText('JPE-1');

    // E3 — pick newly created Junior title and save
    await chooseSelectOption(page, 'Level', 'Junior');
    await chooseSelectOption(page, 'Position code', titleCode, true);

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/users/${userId}`) &&
          res.request().method() === 'PATCH' &&
          res.status() < 400,
      ),
      page.getByRole('button', { name: 'Save changes' }).click(),
    ]);

    await page.reload();
    await expect(page.getByRole('heading', { name: /Dev Employee|Employee/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(positionItem.locator('.ant-select')).toContainText(titleCode);
    await expect(levelItem.locator('.ant-select')).toContainText('Junior');
  });
});
