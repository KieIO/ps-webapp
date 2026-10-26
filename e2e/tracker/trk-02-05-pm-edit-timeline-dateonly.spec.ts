import { test, expect } from '../fixtures/auth';
import {
  adminToken,
  clearMilestonesForFixture,
  findProjectByName,
  formatUiDate,
  loginSeedProjectPm,
  openEditProjectModal,
  patchProjectDates,
  resolveTrackerFixture,
} from './helpers';

/**
 * TRK-02 — PM sửa ngày bắt đầu/kết thúc qua Edit Project.
 * TRK-05 — payload start/end là YYYY-MM-DD (không toISOString lệch ngày).
 * API: PM46b timeline · Unit: EditProjectModal format('YYYY-MM-DD').
 */
test.describe('TRK-02 / TRK-05 PM Edit Project timeline + date-only payload', () => {
  let projectId = '';
  let originalStart = '';
  let originalEnd = '';
  let originalName = '';

  test.beforeEach(async () => {
    const fixture = await resolveTrackerFixture();
    projectId = fixture.projectId;
    originalName = fixture.projectName;
    const token = await adminToken();
    const project = await findProjectByName(token, fixture.projectName);
    originalStart = project.startDate.slice(0, 10);
    originalEnd = project.endDate.slice(0, 10);
    // Soft-delete + re-insert of the same milestone ids can 500 on project PATCH.
    await clearMilestonesForFixture();
  });

  test.afterEach(async () => {
    if (!projectId || !originalStart || !originalEnd) return;
    const token = await adminToken();
    await patchProjectDates(token, projectId, {
      startDate: originalStart,
      endDate: originalEnd,
      name: originalName,
    });
  });

  test('Seed PM edits End date; PATCH body uses YYYY-MM-DD', async ({ page }) => {
    const [y, m, d] = originalEnd.split('-').map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    const nextEnd = next.toISOString().slice(0, 10);

    await loginSeedProjectPm(page);
    await openEditProjectModal(page, originalName);

    const dialog = page.getByRole('dialog');
    const endInput = dialog
      .locator('.ant-form-item')
      .filter({ hasText: /^End date/ })
      .getByRole('textbox');
    await endInput.click();
    await endInput.fill('');
    await endInput.fill(formatUiDate(nextEnd));
    await endInput.press('Enter');
    // Ensure Ant DatePicker commits the typed value.
    await expect(endInput).toHaveValue(formatUiDate(nextEnd));

    const waitPatch = page.waitForResponse(
      (resp) =>
        resp.request().method() === 'PATCH' &&
        /\/projects\/[^/]+$/.test(resp.url()) &&
        !resp.url().includes('/urgency'),
    );
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    const response = await waitPatch;
    const body = response.request().postDataJSON() as {
      startDate?: string;
      endDate?: string;
    };

    expect(body.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.endDate).toBe(nextEnd);
    expect(body.startDate).not.toContain('T');
    expect(body.endDate).not.toContain('T');

    if (!response.ok()) {
      throw new Error(`project PATCH failed: ${response.status()} ${await response.text()}`);
    }
    await expect(page.getByText('Project updated successfully')).toBeVisible({ timeout: 15_000 });
  });
});
