import { test, expect, loginAs } from '../fixtures/auth';
import {
  adminToken,
  getProject,
  openEditProjectModal,
  patchProjectSalesName,
  resolveTrackerFixture,
} from '../tracker/helpers';

const SALES_VALUE = 'E2E Modal Sales';

/**
 * PM-49 — Sales field on Edit project modal (create/update form path).
 * Tracker inline UI is covered by TRK-06; API PATCH by PM-47 in ps-be.
 */
test.describe('PM-49 Sales on Edit project modal', () => {
  let projectId = '';
  let projectName = '';
  let previousSales = '';

  test.beforeEach(async () => {
    const fixture = await resolveTrackerFixture();
    projectId = fixture.projectId;
    projectName = fixture.projectName;

    const token = await adminToken();
    const current = await getProject(token, projectId);
    previousSales = current.salesName?.trim() ?? '';

    const cleared = await patchProjectSalesName(token, projectId, '');
    if (!cleared.ok) {
      throw new Error(`clear sales failed: ${cleared.status} ${await cleared.text()}`);
    }
  });

  test.afterEach(async () => {
    if (!projectId) return;
    const token = await adminToken();
    await patchProjectSalesName(token, projectId, previousSales);
  });

  test('Admin sets and clears Sales in Edit project modal', async ({ page }) => {
    await loginAs(page, 'admin');
    await openEditProjectModal(page, projectName);

    const modal = page.getByRole('dialog');
    const salesInput = modal
      .locator('.ant-form-item')
      .filter({ hasText: /^Sales/ })
      .getByRole('textbox');

    await expect(salesInput).toBeVisible();
    await salesInput.fill(SALES_VALUE);
    await modal.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Project updated successfully')).toBeVisible({ timeout: 15_000 });

    const token = await adminToken();
    const afterSet = await getProject(token, projectId);
    expect(afterSet.salesName?.trim()).toBe(SALES_VALUE);

    await openEditProjectModal(page, projectName);
    const reopen = page.getByRole('dialog');
    const reopenSales = reopen
      .locator('.ant-form-item')
      .filter({ hasText: /^Sales/ })
      .getByRole('textbox');
    await expect(reopenSales).toHaveValue(SALES_VALUE);

    await reopenSales.fill('');
    await reopen.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Project updated successfully')).toBeVisible({ timeout: 15_000 });

    const afterClear = await getProject(token, projectId);
    expect(afterClear.salesName?.trim() ?? '').toBe('');
  });
});
