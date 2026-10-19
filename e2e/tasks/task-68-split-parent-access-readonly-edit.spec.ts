import { test, expect, type Page } from '@playwright/test';
import { loginAs, SEED_ACCOUNTS } from '../fixtures/auth';
import { apiLogin, patchStatus, setupSplitFamily } from './helpers/splitFamilyApi';

/**
 * TASK-68 — Split parent access + finished Edit read-only (UI smoke).
 * 1) Creative staff on a child cannot open Task cha (403 screen + Quay về).
 * 2) PM can open Edit on finished split parent in read-only mode.
 */

/** Seed creative staff (same password as other seed-dev accounts). */
const CREATIVE_STAFF_EMAIL = process.env.E2E_CREATIVE_STAFF_EMAIL ?? 'yen.hoang@pokeslide.com';
const CREATIVE_STAFF_PASSWORD =
  process.env.E2E_CREATIVE_STAFF_PASSWORD ?? SEED_ACCOUNTS.employee.password;

async function loginWithCredentials(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });
}

test.describe('TASK-68 split parent access + finished Edit read-only', () => {
  test('staff Task cha link shows no-permission screen and Quay về', async ({ page }) => {
    const staff = await apiLogin(CREATIVE_STAFF_EMAIL, CREATIVE_STAFF_PASSWORD);
    const otherStaff = await apiLogin(
      process.env.E2E_CREATIVE_STAFF_B_EMAIL ?? 'thao.nguyen@pokeslide.com',
      process.env.E2E_CREATIVE_STAFF_B_PASSWORD ?? CREATIVE_STAFF_PASSWORD,
    );

    const taskName = `E2E Split Access ${Date.now()}`;
    const { parent, children } = await setupSplitFamily({
      taskName,
      qtyA: 6,
      qtyB: 6,
      staffAUserId: staff.user.id,
      staffBUserId: otherStaff.user.id,
    });

    const mine = children.find((child) =>
      (child.staff ?? []).some((member) => member.userId === staff.user.id),
    );
    const child = mine ?? children[0]!;

    await loginWithCredentials(page, CREATIVE_STAFF_EMAIL, CREATIVE_STAFF_PASSWORD);
    await page.goto(`/tasks/detail/${child.id}`);
    await expect(page.getByText(child.taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });

    const parentLabel = parent.taskCode ?? 'task gốc';
    const parentLink = page.getByRole('link', { name: parentLabel });
    await expect(parentLink.first()).toBeVisible();
    await parentLink.first().click();

    await expect(page).toHaveURL(new RegExp(`/tasks/detail/${parent.id}`));
    await expect(page).toHaveURL(/[?&]from=/);
    await expect(page.getByText('Không có quyền xem task')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/không có quyền truy cập|Task cha đã chia nhỏ/i)).toBeVisible();

    await page.getByRole('button', { name: /Quay về task chi tiết/ }).click();
    await expect(page).toHaveURL(new RegExp(`/tasks/detail/${child.id}`));
    await expect(page.getByText(child.taskName, { exact: false }).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('PM Edit on finished split parent opens read-only Creative drawer', async ({ page }) => {
    const taskName = `E2E Split Finished Edit ${Date.now()}`;
    const { parent, children, admin } = await setupSplitFamily({
      taskName,
      qtyA: 5,
      qtyB: 5,
    });

    for (const child of children) {
      await patchStatus(admin.token, child.id, 'finished');
    }
    await patchStatus(admin.token, parent.id, 'finished');

    await loginAs(page, 'pm');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(parent.taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('Đã chia nhỏ')).toBeVisible();

    await page.getByRole('button', { name: /^Edit task$/ }).click();
    const drawer = page.getByRole('dialog', { name: /Xem task Creative|Sửa \/ Đổi giao/ });
    await expect(drawer.getByText(/Xem task Creative|Sửa \/ Đổi giao task Creative/)).toBeVisible();
    await expect(drawer.getByText(/Task đã Hoàn thành — không thể chỉnh sửa/)).toBeVisible();
    await expect(drawer.getByRole('button', { name: /Lưu thay đổi/ })).toHaveCount(0);
    await expect(drawer.getByRole('button', { name: /^Đóng$/ })).toBeVisible();

    // Split children still visible for navigation.
    await expect(drawer.getByText(children[0]!.taskCode ?? '', { exact: false })).toBeVisible({
      timeout: 20_000,
    });
  });
});
