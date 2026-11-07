import { test, expect, loginAs } from '../fixtures/auth';
import { expectToast, uniqueGroupLabel } from './helpers';

/**
 * TSCORE-44 / D1–D3 — Manage groups: add, delete unused, block in-use
 */
test.describe('TSCORE-44 Manage task score groups', () => {
  test('Admin can add and delete unused group; in-use delete blocked', async ({ page }) => {
    test.setTimeout(90_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/task-score');

    const label = uniqueGroupLabel();

    await page.getByRole('button', { name: /Manage groups/i }).click();
    const groupsDialog = page.getByRole('dialog');
    await expect(groupsDialog.getByText('Task groups')).toBeVisible();

    // D1 — add group
    await groupsDialog.getByLabel('Group name').fill(label);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/task-score-groups') &&
          res.request().method() === 'POST' &&
          res.status() < 400,
      ),
      groupsDialog.getByRole('button', { name: 'Add group' }).click(),
    ]);
    await expectToast(page, 'Group created');
    await expect(groupsDialog.getByText(label, { exact: true })).toBeVisible();

    // D2 — delete unused
    await groupsDialog.getByRole('button', { name: `Delete ${label}` }).click();
    const popconfirm = page.locator('.ant-popconfirm').last();
    await expect(popconfirm).toBeVisible();
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/task-score-groups/') &&
          res.request().method() === 'DELETE' &&
          res.status() < 400,
      ),
      popconfirm.getByRole('button', { name: 'Delete' }).click(),
    ]);
    await expectToast(page, 'Group deleted');
    await expect(groupsDialog.getByText(label, { exact: true })).toHaveCount(0);

    // D3 — delete in-use Implementation
    await groupsDialog.getByRole('button', { name: 'Delete Implementation' }).click();
    const inUse = page.locator('.ant-popconfirm').last();
    await expect(inUse).toBeVisible();
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/task-score-groups/') &&
          res.request().method() === 'DELETE' &&
          res.status() === 409,
      ),
      inUse.getByRole('button', { name: 'Delete' }).click(),
    ]);
    await expectToast(page, /tasks use this group|already exists|Cannot delete/i);
    await expect(groupsDialog.getByText('Implementation', { exact: true })).toBeVisible();
  });
});
