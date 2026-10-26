import { type Page } from '@playwright/test';
import { test, expect, loginAs, logout } from '../fixtures/auth';
import { getTask, setupWholeAssigned } from './helpers/splitFamilyApi';

/**
 * TASK-80 / TASK-82 — Whole-assign has two scores.
 * CH sees the CM task in the project list and scores the CM package.
 * CM sees that task on both Project Tasks tabs, reads the CH score, and scores the staff result.
 * Staff sees the assigned task in their list and reads the CM score.
 */

function projectListUrl(taskName: string, cmScope?: 'staff'): string {
  const params = new URLSearchParams({ workDate: 'all', search: taskName });
  if (cmScope) params.set('cmScope', cmScope);
  return `/tasks/project?${params.toString()}`;
}

async function openTaskFromList(page: Page, url: string, taskName: string): Promise<void> {
  await page.goto(url);
  const link = page.getByRole('link', { name: taskName });
  await expect(link).toBeVisible({ timeout: 30_000 });
  await link.click();
  await expect(page).toHaveURL(/\/tasks\/detail\//);
  await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
    timeout: 30_000,
  });
}

async function evaluateLayer(
  page: Page,
  opts: { title: string; score: string; note: string; completion: string; quantity?: string },
): Promise<void> {
  await page.getByRole('button', { name: /^Evaluate$/ }).click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByText(opts.title)).toBeVisible();

  const spins = modal.getByRole('spinbutton');
  if (opts.quantity) {
    await spins.nth(0).click();
    await spins.nth(0).fill(opts.quantity);
    await spins.nth(1).click();
    await spins.nth(1).fill(opts.completion);
  } else {
    await spins.first().click();
    await spins.first().fill(opts.completion);
  }

  await modal.locator('.ant-select').first().click();
  await page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: new RegExp(`^${opts.score}$`) })
    .click();

  await modal.locator('textarea').fill(opts.note);
  await modal.getByRole('button', { name: /^Save$/ }).click();
  await expect(modal).toHaveCount(0, { timeout: 20_000 });
}

test.describe('TASK-82 whole-assign evaluation visibility', () => {
  test('CH, CM, and Staff see the task in their lists and the matching score', async ({ page }) => {
    const taskName = `E2E Dual Eval ${Date.now()}`;
    const chNote = `CH package ${Date.now()}`;
    const cmNote = `CM staff result ${Date.now()}`;
    const { task, cm, employee } = await setupWholeAssigned(taskName);

    await loginAs(page, 'creative_head');
    await openTaskFromList(page, projectListUrl(taskName), taskName);
    await evaluateLayer(page, {
      title: 'Đánh giá gói của CM',
      score: '4',
      note: chNote,
      completion: '70',
    });

    const afterCh = await getTask(cm.token, task.id);
    expect(afterCh.handoffEvaluation).toBe('4');
    expect(afterCh.handoffNote).toBe(chNote);
    expect(afterCh.pmEvaluation ?? '').toBe('');

    await logout(page);
    await loginAs(page, 'creative_manager');
    await page.goto(projectListUrl(taskName));
    await expect(page.getByRole('radio', { name: /Task nhận/ })).toBeChecked({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: taskName })).toBeVisible();

    await page.goto(projectListUrl(taskName, 'staff'));
    await expect(page.getByRole('radio', { name: /Task giao Staff/ })).toBeChecked({
      timeout: 30_000,
    });
    await openTaskFromList(page, projectListUrl(taskName, 'staff'), taskName);
    await page.getByRole('tab', { name: /Evaluation/i }).click();
    const cmPanel = page.getByRole('tabpanel', { name: /Evaluation/i });
    await expect(cmPanel.getByText('Đánh giá của Creative Head')).toBeVisible();
    await expect(cmPanel.getByText(chNote)).toBeVisible({ timeout: 15_000 });

    await evaluateLayer(page, {
      title: 'Đánh giá kết quả Staff',
      score: '5',
      note: cmNote,
      completion: '80',
      quantity: '4',
    });

    const afterCm = await getTask(employee.token, task.id);
    expect(afterCm.pmEvaluation).toBe('5');
    expect(afterCm.pmNote).toBe(cmNote);
    expect(afterCm.handoffEvaluation).toBe('4');
    expect(afterCm.handoffNote).toBe(chNote);

    await logout(page);
    await loginAs(page, 'employee');
    await openTaskFromList(page, projectListUrl(taskName), taskName);
    await page.getByRole('tab', { name: /Evaluation/i }).click();
    const staffPanel = page.getByRole('tabpanel', { name: /Evaluation/i });
    await expect(staffPanel.getByText('Đánh giá kết quả Staff')).toBeVisible();
    await expect(staffPanel.getByText(cmNote)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /^Evaluate$/ })).toHaveCount(0);
  });
});
