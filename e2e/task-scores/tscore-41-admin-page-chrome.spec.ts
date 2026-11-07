import { test, expect, loginAs } from '../fixtures/auth';

/**
 * TSCORE-41 / A1+B1 — Admin page chrome: columns + filters + actions
 */
test.describe('TSCORE-41 Admin Task score page chrome', () => {
  test('Admin sees heading, columns, filters, and action buttons', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/settings/task-score');

    await expect(page.getByRole('heading', { name: 'Task score', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create task/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Manage groups/i })).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'Task type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Task name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Score' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Group' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Department' })).toBeVisible();

    await expect(page.locator('#task-score-search')).toBeVisible();
    await expect(page.locator('#task-score-group-filter')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.getByText(/\d+ total/)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Slides 1', exact: true })).toBeVisible();
  });
});
