import { expect, type Page } from '@playwright/test';
import { loginAs, SEED_ACCOUNTS, type SeedRole } from '../fixtures/auth';

/** Active seed project with a current-month bar (see seed_projects.go). */
export const MILESTONE_PROJECT_NAME = process.env.E2E_MILESTONE_PROJECT_NAME ?? 'Sanofi Meninga';

const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

/**
 * Seed PM on Sanofi / Altevia is `cuong.le@…`, not `pm@pokeslide.dev`
 * (pm@ has empty tracker visibility under ProjectVisibilityPM).
 */
export const SEED_PROJECT_PM = {
  email: process.env.E2E_SEED_PROJECT_PM_EMAIL ?? 'cuong.le@pokeslide.com',
  password: process.env.E2E_PASSWORD ?? 'ps123',
};

export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });
}

export async function openTracker(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('link', { name: MILESTONE_PROJECT_NAME }).first()).toBeVisible({
    timeout: 30_000,
  });
}

export async function loginAndOpenTracker(page: Page, role: SeedRole): Promise<void> {
  await loginAs(page, role);
  await openTracker(page);
}

export function addMilestoneBar(page: Page, projectName = MILESTONE_PROJECT_NAME) {
  return page.getByRole('button', { name: `Add milestone on ${projectName}` });
}

export function openProjectBar(page: Page, projectName = MILESTONE_PROJECT_NAME) {
  return page.getByRole('link', { name: `Open project ${projectName}` });
}

/** Single-day marker aria: `Mốc {name} ngày YYYY-MM-DD`. */
export function milestoneMarker(page: Page, name: string) {
  return page.getByRole('button', { name: new RegExp(`^Mốc ${escapeRegExp(name)} ngày `) });
}

async function apiLogin(email: string, password: string): Promise<string> {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = (await response.json()) as { data?: { token?: string } };
  const token = json.data?.token;
  if (!response.ok || !token) {
    throw new Error(`API login failed: ${response.status}`);
  }
  return token;
}

async function findProjectIdByName(token: string, name: string): Promise<string> {
  const response = await fetch(
    `${apiBase}/projects?search=${encodeURIComponent(name)}&archived=false`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const json = (await response.json()) as {
    data?: { items?: Array<{ id: string; name: string }> };
  };
  const items = json.data?.items ?? [];
  const match = items.find((item) => item.name === name) ?? items[0];
  if (!match?.id) {
    throw new Error(`Project not found: ${name}`);
  }
  return match.id;
}

/** Clear milestones so markers stay single-day (stacked aria hides per-name labels). */
export async function clearMilestoneProjectViaApi(
  projectName = MILESTONE_PROJECT_NAME,
): Promise<void> {
  const admin = SEED_ACCOUNTS.admin;
  const token = await apiLogin(admin.email, admin.password);
  const projectId = await findProjectIdByName(token, projectName);
  const response = await fetch(`${apiBase}/projects/${projectId}/milestones`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ milestones: [] }),
  });
  if (!response.ok) {
    throw new Error(`clear milestones failed: ${response.status} ${await response.text()}`);
  }
}

export async function openCreateMilestoneModal(
  page: Page,
  projectName = MILESTONE_PROJECT_NAME,
): Promise<void> {
  const bar = addMilestoneBar(page, projectName);
  await expect(bar).toBeVisible({ timeout: 30_000 });
  // Prefer keyboard: pointer click maps offset → day via bar.start; when the span
  // starts before the visible month, resolveClickedDayOnBar returns null and the
  // modal never opens. Enter uses bar.start directly (still in project range).
  await bar.focus();
  await bar.press('Enter');
  await expect(page.getByRole('dialog').getByText(`Thêm mốc — ${projectName}`)).toBeVisible({
    timeout: 15_000,
  });
}

/**
 * DD/MM/YYYY for Ant DatePicker.
 * `dayOffset` keeps markers on distinct days (avoids stacked aria-label).
 * Clamped near today so seed project ±21d window still accepts the date.
 */
export function formatDeadlineUi(dayOffset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

export async function fillAndSubmitCreateMilestone(
  page: Page,
  opts: { name: string; note?: string; dayOffset?: number },
): Promise<void> {
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Tên mốc').fill(opts.name);

  // Keyboard open uses bar.start (often before visible month). Set deadline to a
  // day in the current tracker month so the marker is rendered (month filter).
  const deadline = formatDeadlineUi(opts.dayOffset ?? 0);
  const deadlineInput = dialog.getByLabel('Ngày deadline');
  await deadlineInput.click();
  await deadlineInput.fill(deadline);
  await deadlineInput.press('Enter');

  if (opts.note != null) {
    await dialog.getByLabel('Ghi chú').fill(opts.note);
  }
  // Leave Đơn vị empty → non-volume milestone (MS-11).
  await dialog.getByRole('button', { name: 'Thêm mốc' }).click();
  await expect(page.getByText('Đã thêm mốc bàn giao')).toBeVisible({ timeout: 15_000 });
  await expect(dialog).toHaveCount(0);
}

export async function createEmptyVolumeMilestone(
  page: Page,
  opts: { name: string; note?: string; dayOffset?: number },
  projectName = MILESTONE_PROJECT_NAME,
): Promise<void> {
  await openCreateMilestoneModal(page, projectName);
  await fillAndSubmitCreateMilestone(page, opts);
  await expect(milestoneMarker(page, opts.name)).toBeVisible({ timeout: 15_000 });
}

export async function expectMarkerColor(
  page: Page,
  name: string,
  color: 'red' | 'green',
): Promise<void> {
  const marker = milestoneMarker(page, name);
  await expect(marker).toBeVisible({ timeout: 15_000 });
  const expected = color === 'green' ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)';
  await expect(marker).toHaveCSS('background-color', expected);
}

export async function editMilestoneComplete(page: Page, name: string): Promise<void> {
  const marker = milestoneMarker(page, name);
  await marker.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(new RegExp(`^Sửa mốc —`))).toBeVisible();
  await dialog.getByRole('checkbox', { name: 'Hoàn thành' }).check();
  await dialog.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText('Đã cập nhật mốc bàn giao')).toBeVisible({ timeout: 15_000 });
  await expect(dialog).toHaveCount(0);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
