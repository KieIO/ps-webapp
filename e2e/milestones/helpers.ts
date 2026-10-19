import { expect, type Page } from '@playwright/test';
import { loginAs, type SeedRole } from '../fixtures/auth';

/** Active seed project with a current-month bar (see seed_projects.go). */
export const MILESTONE_PROJECT_NAME = process.env.E2E_MILESTONE_PROJECT_NAME ?? 'Sanofi Meninga';

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

export function milestoneMarker(page: Page, name: string) {
  return page.getByRole('button', { name: new RegExp(`^Mốc ${escapeRegExp(name)} ngày `) });
}

export async function openCreateMilestoneModal(
  page: Page,
  projectName = MILESTONE_PROJECT_NAME,
): Promise<void> {
  const bar = addMilestoneBar(page, projectName);
  await expect(bar).toBeVisible({ timeout: 30_000 });
  await bar.click();
  await expect(page.getByRole('dialog').getByText(`Thêm mốc — ${projectName}`)).toBeVisible();
}

export async function fillAndSubmitCreateMilestone(
  page: Page,
  opts: { name: string; note?: string },
): Promise<void> {
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Tên mốc').fill(opts.name);
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
  opts: { name: string; note?: string },
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
