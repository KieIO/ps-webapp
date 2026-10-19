import { test, expect } from '@playwright/test';
import { loginAs, SEED_ACCOUNTS } from '../fixtures/auth';
import { apiLogin, apiJson, patchStatus, setupSplitFamily } from './helpers/splitFamilyApi';

/**
 * TASK-68 — Split parent access + finished Edit read-only (UI smoke).
 * 1) Creative staff on a child cannot open Task cha (403 screen + Quay về).
 * 2) PM can open Edit on finished split parent in read-only mode.
 *
 * Local seed has no yen.hoang / thao.nguyen — use employee@ + another staff-option.
 */

async function resolveStaffPairForEmployee(): Promise<{
  employee: { token: string; user: { id: string } };
  staffAUserId: string;
  staffBUserId: string;
}> {
  const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);
  const cm = await apiLogin(
    SEED_ACCOUNTS.creative_manager.email,
    SEED_ACCOUNTS.creative_manager.password,
  );
  type StaffOption = { userId?: string };
  const { data: staffOptions } = await apiJson<StaffOption[]>(
    'GET',
    '/tasks/my/staff-options',
    cm.token,
  );
  const ids = (staffOptions ?? [])
    .map((entry) => entry.userId)
    .filter((id): id is string => Boolean(id));
  const staffBUserId = ids.find((id) => id !== employee.user.id);
  if (!staffBUserId) {
    throw new Error('need another staff-option besides employee for split');
  }
  return {
    employee,
    staffAUserId: employee.user.id,
    staffBUserId,
  };
}

test.describe('TASK-68 split parent access + finished Edit read-only', () => {
  test('staff Task cha link shows no-permission screen and Quay về', async ({ page }) => {
    const { employee, staffAUserId, staffBUserId } = await resolveStaffPairForEmployee();

    const taskName = `E2E Split Access ${Date.now()}`;
    const { parent, children } = await setupSplitFamily({
      taskName,
      qtyA: 6,
      qtyB: 6,
      staffAUserId,
      staffBUserId,
    });

    const mine = children.find((child) =>
      (child.staff ?? []).some((member) => member.userId === employee.user.id),
    );
    const child = mine ?? children[0]!;

    await loginAs(page, 'employee');
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

    // Ant icon expands accessible name beyond exact "Edit task".
    await page.getByRole('button', { name: /Edit task/ }).click();
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
