import type { Page } from '@playwright/test';
import { test, expect, loginAs, logout } from '../fixtures/auth';
import { resolveTrackerFixture } from '../tracker/helpers';

/**
 * CLIENT-44 — Client Knowledge Add note by role (EDIT_CLIENT_NOTE).
 * View: any project viewer. Add: PM / CM / CH / Head / Admin. Employee: view only.
 * API: CLIENT-32 / 32b / 32c / 32d / 39 · Docs: /clients/knowledge
 */
test.describe('CLIENT-44 Knowledge Add note by role', () => {
  let projectPath = '';

  test.beforeAll(async () => {
    const fixture = await resolveTrackerFixture();
    if (!fixture.clientId) {
      throw new Error('Fixture project has no clientId — cannot open Client Knowledge');
    }
    projectPath = `/projects/${fixture.projectId}`;
  });

  async function openKnowledgeTab(page: Page): Promise<void> {
    await page.goto(projectPath);
    await expect(page.getByRole('tab', { name: 'Client Knowledge' })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole('tab', { name: 'Client Knowledge' }).click();
    await expect(page.getByText('Knowledge')).toBeVisible({ timeout: 15_000 });
  }

  test('PM / CM see Add note; Employee does not', async ({ page }) => {
    await loginAs(page, 'pm');
    await openKnowledgeTab(page);
    await expect(page.getByRole('button', { name: /Add note/ })).toBeVisible();
    await logout(page);

    await loginAs(page, 'creative_manager');
    await openKnowledgeTab(page);
    await expect(page.getByRole('button', { name: /Add note/ })).toBeVisible();
    await logout(page);

    await loginAs(page, 'employee');
    await openKnowledgeTab(page);
    await expect(page.getByRole('button', { name: /Add note/ })).toHaveCount(0);
  });
});
