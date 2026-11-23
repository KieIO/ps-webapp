import { test, expect } from '../fixtures/auth';
import {
  loginSeedProjectPm,
  openEditProjectModal,
  resolveTrackerFixture,
} from '../tracker/helpers';

/**
 * PM-54 — PM Edit Project: độ khó (Volume/Nature/Time) khóa; end date vẫn sửa được.
 * API: TestProjectMgmt_PM54 / PM55 · Docs: /projects/pm-edit
 */
test.describe('PM-54 PM Edit Project field allowlist', () => {
  test('PM: Volume/Nature/Time disabled; End date enabled; difficulty hint shown', async ({
    page,
  }) => {
    const fixture = await resolveTrackerFixture();
    await loginSeedProjectPm(page);
    await openEditProjectModal(page, fixture.projectName);

    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByText(/Độ khó \(Volume \/ Nature \/ Time → Level\) chỉ Head \/ Admin/),
    ).toBeVisible();

    for (const label of ['Volume', 'Nature', 'Time']) {
      const control = dialog
        .locator('.ant-form-item')
        .filter({ hasText: new RegExp(`^${label}`) })
        .getByRole('combobox');
      await expect(control).toBeDisabled();
    }

    const endInput = dialog
      .locator('.ant-form-item')
      .filter({ hasText: /^End date/ })
      .getByRole('textbox');
    await expect(endInput).toBeEnabled();

    const startInput = dialog
      .locator('.ant-form-item')
      .filter({ hasText: /^Start date/ })
      .getByRole('textbox');
    await expect(startInput).toBeDisabled();
  });
});
