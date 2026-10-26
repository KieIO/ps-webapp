import { test, expect, loginAs } from '../fixtures/auth';
import {
  fillProjectBriefStep,
  openProjectCreateDrawer,
  pickFormSelect,
  pickProjectName,
} from './helpers/createTaskUi';

/**
 * TASK-39–42 — Client validation on CreateTaskDrawer (empty / incomplete fields).
 * Server 422 still covered by Go TASK39–42.
 */
test.describe('TASK-39–42 create task validation UI', () => {
  test('TASK-39 empty project name blocks Tiếp tục', async ({ page }) => {
    await loginAs(page, 'admin');
    const drawer = await openProjectCreateDrawer(page);
    await drawer.getByRole('button', { name: /Project Task/ }).click();

    // Leave project empty; try next.
    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();
    await expect(drawer.getByText('Nhập tên dự án', { exact: true })).toBeVisible();
    await expect(drawer.getByText('Chọn tên task', { exact: true })).toBeVisible();
  });

  test('TASK-41 clearing PM shows Chọn PM', async ({ page }) => {
    await loginAs(page, 'admin');
    const drawer = await openProjectCreateDrawer(page);
    await drawer.getByRole('button', { name: /Project Task/ }).click();
    await pickProjectName(page, drawer);
    // Explicitly pick then clear so the field is empty regardless of auto-select.
    await pickFormSelect(page, drawer, 'PM', /Dev|PM|Admin/i);
    const pmItem = drawer
      .locator('.ant-form-item')
      .filter({ has: page.getByText('PM', { exact: true }) });
    await pmItem.locator('.ant-select').hover();
    await pmItem.locator('.ant-select-clear').click({ force: true });

    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();
    await expect(
      drawer.locator('.ant-form-item-explain-error').filter({ hasText: 'Chọn PM' }),
    ).toBeVisible();
  });

  test('TASK-40 criteria required before leaving brief step', async ({ page }) => {
    await loginAs(page, 'admin');
    const drawer = await openProjectCreateDrawer(page);
    await drawer.getByRole('button', { name: /Project Task/ }).click();
    await pickProjectName(page, drawer);
    // Task name + brief, skip criteria.
    await drawer
      .locator('.ant-form-item')
      .filter({ hasText: 'Tên task' })
      .locator('.ant-select')
      .click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^Slides$/ })
      .first()
      .click();
    await drawer
      .locator('.ant-form-item')
      .filter({ hasText: 'Brief' })
      .locator('textarea')
      .fill('missing criteria');

    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();
    await expect(drawer.getByText(/Chọn mức|Chọn đủ 3 tiêu chí/).first()).toBeVisible();
  });

  test('TASK-42 Project path only allows one staff (single select)', async ({ page }) => {
    await loginAs(page, 'admin');
    const drawer = await openProjectCreateDrawer(page);
    await drawer.getByRole('button', { name: /Project Task/ }).click();
    await fillProjectBriefStep(page, drawer);
    await drawer.getByRole('button', { name: 'Tiếp tục' }).click();
    await drawer.getByRole('button', { name: /Phòng Project/ }).click();

    const staffSelect = drawer
      .locator('.ant-form-item')
      .filter({ hasText: 'Giao cho' })
      .locator('.ant-select');
    await expect(staffSelect).toBeVisible();
    // Ant Design single Select — not multiple mode.
    await expect(staffSelect).not.toHaveClass(/ant-select-multiple/);
  });
});
