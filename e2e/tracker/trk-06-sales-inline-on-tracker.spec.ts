import { test, expect, loginAs } from '../fixtures/auth';
import {
  adminToken,
  fetchTrackerProjects,
  getProject,
  openTrackerProject,
  patchProjectDates,
  patchProjectSalesName,
  resolveTrackerFixture,
  trackerNameStack,
} from './helpers';

const SALES_VALUE = 'E2E Sales Lan';

function isoTodayOffset(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * TRK-06 — Sales subtitle on Tracker: PM add / edit / clear; non-editors read-only.
 * API: TestProjectMgmt_PM47_UpdateSalesName in ps-be.
 */
test.describe('TRK-06 Sales inline on Tracker', () => {
  let projectId = '';
  let projectName = '';
  let previousSales = '';
  let originalStart = '';
  let originalEnd = '';

  test.beforeEach(async () => {
    const fixture = await resolveTrackerFixture();
    projectId = fixture.projectId;
    projectName = fixture.projectName;

    const token = await adminToken();
    const current = await getProject(token, projectId);
    previousSales = current.salesName?.trim() ?? '';
    originalStart = (current.startDate ?? '').slice(0, 10);
    originalEnd = (current.endDate ?? '').slice(0, 10);

    const cleared = await patchProjectSalesName(token, projectId, '');
    if (!cleared.ok) {
      throw new Error(`clear sales failed: ${cleared.status} ${await cleared.text()}`);
    }

    // Keep the fixture visible in the default Tracker month (today).
    const patched = await patchProjectDates(token, projectId, {
      startDate: isoTodayOffset(-7),
      endDate: isoTodayOffset(21),
      name: projectName,
    });
    if (!patched.ok) {
      throw new Error(`expand project dates failed: ${patched.status} ${await patched.text()}`);
    }
  });

  test.afterEach(async () => {
    if (!projectId) return;
    const token = await adminToken();
    await patchProjectSalesName(token, projectId, previousSales);
    if (originalStart && originalEnd) {
      await patchProjectDates(token, projectId, {
        startDate: originalStart,
        endDate: originalEnd,
        name: projectName,
      });
    }
  });

  test('Admin adds, edits, and clears Sales under the project name', async ({ page }) => {
    // Admin has EDIT_TRACKER_PROJECT and sees all Tracker rows (seed PM may be scoped).
    await loginAs(page, 'admin');
    await openTrackerProject(page);

    const stack = trackerNameStack(page, projectName);
    await stack.hover();
    await stack.getByRole('button', { name: 'Thêm Sales' }).click();

    const input = page.getByRole('textbox', { name: 'Sales' });
    await expect(input).toBeVisible();
    await input.fill(SALES_VALUE);
    await input.press('Enter');

    await expect(page.getByText('Đã cập nhật Sales').first()).toBeVisible({ timeout: 15_000 });
    await expect(stack.getByRole('button', { name: `Sales: ${SALES_VALUE}` })).toBeVisible();

    await stack.getByRole('button', { name: `Sales: ${SALES_VALUE}` }).click();
    const editInput = page.getByRole('textbox', { name: 'Sales' });
    await expect(editInput).toBeVisible();
    await editInput.fill(`${SALES_VALUE} 2`);
    await editInput.press('Enter');
    await expect(stack.getByRole('button', { name: `Sales: ${SALES_VALUE} 2` })).toBeVisible({
      timeout: 15_000,
    });

    await stack.hover();
    await stack.getByRole('button', { name: 'Xóa Sales' }).click();
    await expect(stack.getByRole('button', { name: /Sales:/ })).toHaveCount(0, { timeout: 15_000 });

    await stack.hover();
    await expect(stack.getByRole('button', { name: 'Thêm Sales' })).toBeVisible();
  });

  test('Creative Head sees Sales text without edit controls', async ({ page }) => {
    const token = await adminToken();
    const seeded = await patchProjectSalesName(token, projectId, SALES_VALUE);
    if (!seeded.ok) {
      throw new Error(`seed sales failed: ${seeded.status} ${await seeded.text()}`);
    }

    await loginAs(page, 'creative_head');
    await openTrackerProject(page);

    const stack = trackerNameStack(page, projectName);
    await expect(stack.getByText(`Sales: ${SALES_VALUE}`)).toBeVisible({ timeout: 30_000 });
    await expect(stack.getByRole('button', { name: 'Thêm Sales' })).toHaveCount(0);
    await expect(stack.getByRole('button', { name: /Sales:/ })).toHaveCount(0);
    await expect(stack.getByRole('button', { name: 'Xóa Sales' })).toHaveCount(0);
  });

  test('GET /tracker exposes trimmed salesName for the fixture project', async () => {
    const token = await adminToken();
    const seeded = await patchProjectSalesName(token, projectId, `  ${SALES_VALUE}  `);
    if (!seeded.ok) {
      throw new Error(`seed sales failed: ${seeded.status} ${await seeded.text()}`);
    }

    const projects = await fetchTrackerProjects(token);
    const row = projects.find((entry) => entry.id === projectId);
    expect(row, `fixture ${projectId} missing from /tracker`).toBeTruthy();
    expect(row?.salesName?.trim()).toBe(SALES_VALUE);
  });

  test('Esc cancels an in-progress Sales edit without saving', async ({ page }) => {
    await loginAs(page, 'admin');
    await openTrackerProject(page);

    const stack = trackerNameStack(page, projectName);
    await stack.hover();
    await stack.getByRole('button', { name: 'Thêm Sales' }).click();

    const input = page.getByRole('textbox', { name: 'Sales' });
    await expect(input).toBeVisible();
    await input.fill(SALES_VALUE);
    await input.press('Escape');

    await expect(page.getByRole('textbox', { name: 'Sales' })).toHaveCount(0);
    await expect(stack.getByRole('button', { name: /Sales:/ })).toHaveCount(0);

    await stack.hover();
    await expect(stack.getByRole('button', { name: 'Thêm Sales' })).toBeVisible();
  });
});
