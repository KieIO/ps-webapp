import { test, expect, loginAs } from '../fixtures/auth';
import {
  expectToast,
  fillCodeAndLabel,
  openCreateDialog,
  selectFormAntOption,
  uniqueCode,
} from './helpers';

/**
 * TITLE-40 — Create job level / group / title via Title management UI
 */
test.describe('TITLE-40 Create level, group, title', () => {
  test('Admin can create job level, group, and title', async ({ page }) => {
    test.setTimeout(90_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/titles');
    await expect(page.getByRole('heading', { name: 'Title management' })).toBeVisible();

    const levelCode = uniqueCode('LVL');
    const levelLabel = `E2E Level ${levelCode}`;
    await page.getByRole('tab', { name: 'Job levels' }).click();
    const levelDialog = await openCreateDialog(page, /Create job level/);
    await fillCodeAndLabel(levelDialog, levelCode, levelLabel);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/job-levels') &&
          res.request().method() === 'POST' &&
          res.status() < 400,
      ),
      levelDialog.getByRole('button', { name: 'Create' }).click(),
    ]);
    await expectToast(page, 'Job level created');
    await expect(levelDialog).toBeHidden();
    await expect(page.getByRole('cell', { name: levelCode, exact: true })).toBeVisible();

    const groupCode = uniqueCode('GRP');
    const groupLabel = `E2E Group ${groupCode}`;
    await page.getByRole('tab', { name: 'Job groups' }).click();
    const groupDialog = await openCreateDialog(page, /Create job group/);
    await fillCodeAndLabel(groupDialog, groupCode, groupLabel);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/job-groups') &&
          res.request().method() === 'POST' &&
          res.status() < 400,
      ),
      groupDialog.getByRole('button', { name: 'Create' }).click(),
    ]);
    await expectToast(page, 'Job group created');
    await expect(groupDialog).toBeHidden();
    await expect(page.getByRole('cell', { name: groupCode, exact: true })).toBeVisible();

    const titleCode = uniqueCode('TTL');
    const titleName = `E2E Title ${titleCode}`;
    await page.getByRole('tab', { name: 'Job titles' }).click();
    const titleDialog = await openCreateDialog(page, /Create job title/);
    await titleDialog.getByLabel('Code').fill(titleCode);
    await titleDialog.getByLabel('Title').fill(titleName);
    await selectFormAntOption(titleDialog, page, 'Job level', new RegExp(levelCode));
    await selectFormAntOption(titleDialog, page, 'Job group', new RegExp(groupCode));
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

    await page.locator('#title-search').fill(titleCode);
    await expect(page.getByRole('cell', { name: titleCode, exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('cell', { name: titleName, exact: true })).toBeVisible();
  });
});
