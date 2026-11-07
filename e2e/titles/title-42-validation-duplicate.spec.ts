import { test, expect, loginAs } from '../fixtures/auth';
import { expectToast, fillCodeAndLabel, openCreateDialog, selectFormAntOption } from './helpers';

/**
 * TITLE-42 / B7+B8+C3+D3 — Create validation + duplicate codes (level/group/title)
 */
test.describe('TITLE-42 Validation and duplicate codes', () => {
  test('Required fields and duplicate level/group/title codes surface errors', async ({ page }) => {
    test.setTimeout(90_000);
    await loginAs(page, 'admin');
    await page.goto('/settings/titles');

    // C3 — duplicate job level
    await page.getByRole('tab', { name: 'Job levels' }).click();
    const levelDialog = await openCreateDialog(page, /Create job level/);
    await levelDialog.getByRole('button', { name: 'Create' }).click();
    await expect(levelDialog.getByText('Code is required')).toBeVisible();
    await expect(levelDialog.getByText('Label is required')).toBeVisible();

    await fillCodeAndLabel(levelDialog, 'JUNIOR', 'Duplicate Junior');
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/job-levels') &&
          res.request().method() === 'POST' &&
          res.status() === 409,
      ),
      levelDialog.getByRole('button', { name: 'Create' }).click(),
    ]);
    await expectToast(page, /already exists/i);
    await expect(levelDialog).toBeVisible();
    await levelDialog.getByRole('button', { name: 'Cancel' }).click();

    // D3 — duplicate job group
    await page.getByRole('tab', { name: 'Job groups' }).click();
    const groupDialog = await openCreateDialog(page, /Create job group/);
    await fillCodeAndLabel(groupDialog, 'STAFF', 'Duplicate Staff');
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/job-groups') &&
          res.request().method() === 'POST' &&
          res.status() === 409,
      ),
      groupDialog.getByRole('button', { name: 'Create' }).click(),
    ]);
    await expectToast(page, /already exists/i);
    await expect(groupDialog).toBeVisible();
    await groupDialog.getByRole('button', { name: 'Cancel' }).click();

    // B7 — required fields on job title
    await page.getByRole('tab', { name: 'Job titles' }).click();
    const titleDialog = await openCreateDialog(page, /Create job title/);
    await titleDialog.getByRole('button', { name: 'Create' }).click();
    await expect(titleDialog.getByText('Code is required')).toBeVisible();
    await expect(titleDialog.getByText('Title is required')).toBeVisible();
    await expect(titleDialog.getByText('Job level is required')).toBeVisible();
    await expect(titleDialog.getByText('Job group is required')).toBeVisible();

    // B8 — duplicate job title code
    await titleDialog.getByLabel('Code').fill('JPE-1');
    await titleDialog.getByLabel('Title').fill('Duplicate JPE');
    await selectFormAntOption(titleDialog, page, 'Job level', /JUNIOR/);
    await selectFormAntOption(titleDialog, page, 'Job group', /STAFF/);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/job-titles') &&
          res.request().method() === 'POST' &&
          res.status() === 409,
      ),
      titleDialog.getByRole('button', { name: 'Create' }).click(),
    ]);
    await expectToast(page, /already exists/i);
    await expect(titleDialog).toBeVisible();
  });
});
