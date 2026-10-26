import { type Page } from '@playwright/test';
import { test, expect, loginAs, logout } from '../fixtures/auth';
import {
  getTask,
  patchEval,
  setupAwaitingCm,
  setupSplitFamily,
  setupWholeAssigned,
} from './helpers/splitFamilyApi';

/**
 * TASK-72–76 — Layered evaluate + cross-role visibility on Evaluation tab.
 */

async function openEvaluationTab(page: Page): Promise<void> {
  const tab = page.getByRole('tab', { name: /Evaluation/i });
  await tab.click();
}

async function evaluateViaUi(
  page: Page,
  opts: { score: string; note: string; completion?: string },
): Promise<void> {
  await page.getByRole('button', { name: /Evaluate/ }).click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByText('Evaluate task')).toBeVisible();

  if (opts.completion) {
    const completion = modal.getByRole('spinbutton').nth(1);
    await completion.click();
    await completion.fill(opts.completion);
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

test.describe('TASK-72–76 layered evaluation visibility', () => {
  test('TASK-72/74 CH evaluates package; CM sees score on Evaluation tab', async ({ page }) => {
    const taskName = `E2E CH Eval ${Date.now()}`;
    const note = `CH note ${Date.now()}`;
    const { parent, cm } = await setupAwaitingCm(taskName);

    await loginAs(page, 'creative_head');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await evaluateViaUi(page, { score: '4', note, completion: '70' });

    const after = await getTask(cm.token, parent.id);
    expect(after.pmEvaluation).toBe('4');
    expect(after.pmNote).toBe(note);

    await logout(page);
    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${parent.id}?tab=evaluation`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await openEvaluationTab(page);
    await expect(page.getByText(note)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('4', { exact: true }).first()).toBeVisible();
  });

  test('TASK-73 CM evaluates Staff whole-assign; Evaluate hidden on split parent', async ({
    page,
  }) => {
    const wholeName = `E2E CM Whole Eval ${Date.now()}`;
    const { task, cm } = await setupWholeAssigned(wholeName);
    const note = `CM staff note ${Date.now()}`;

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByText(wholeName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await evaluateViaUi(page, { score: '5', note, completion: '90' });
    const scored = await getTask(cm.token, task.id);
    expect(scored.pmEvaluation).toBe('5');

    const splitName = `E2E CM Split Deny ${Date.now()}`;
    const { parent } = await setupSplitFamily({ taskName: splitName, qtyA: 4, qtyB: 4 });
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(splitName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('button', { name: /Evaluate/ })).toHaveCount(0);
  });

  test('TASK-75 Staff sees CM evaluation on assigned task', async ({ page }) => {
    const taskName = `E2E Staff See CM ${Date.now()}`;
    const note = `CM→Staff ${Date.now()}`;
    const { task, cm, employee } = await setupWholeAssigned(taskName);
    await patchEval(cm.token, task.id, {
      completionPercent: 80,
      pmEvaluation: '4',
      pmNote: note,
    });

    const seen = await getTask(employee.token, task.id);
    expect(seen.pmEvaluation).toBe('4');
    expect(seen.pmNote).toBe(note);

    await loginAs(page, 'employee');
    await page.goto(`/tasks/detail/${task.id}?tab=evaluation`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await openEvaluationTab(page);
    await expect(page.getByText(note)).toBeVisible({ timeout: 15_000 });
  });

  test('TASK-76 PM Evaluate trên task Creative; CM và CH xem trên tab Evaluation (không màn riêng)', async ({
    page,
  }) => {
    const taskName = `E2E PM Eval Creative ${Date.now()}`;
    const note = `PM on creative ${Date.now()}`;
    const { parent, cm, ch } = await setupAwaitingCm(taskName);

    // 1) PM đánh giá trên chính task (Evaluate modal) — không có màn đánh giá PM riêng
    await loginAs(page, 'pm');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('button', { name: /Evaluate/ })).toBeVisible();
    await evaluateViaUi(page, { score: '3', note, completion: '55' });

    const afterPm = await getTask(cm.token, parent.id);
    expect(afterPm.pmEvaluation).toBe('3');
    expect(afterPm.pmNote).toBe(note);
    expect(afterPm.completionPercent).toBe(55);

    // 2) CM mở cùng task → tab Evaluation thấy điểm / note PM
    await logout(page);
    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await openEvaluationTab(page);
    const cmEval = page.getByRole('tabpanel', { name: /Evaluation/i });
    await expect(cmEval.getByText('Completion')).toBeVisible();
    await expect(cmEval.getByText(/55%/)).toBeVisible();
    await expect(cmEval.getByText(note)).toBeVisible({ timeout: 15_000 });
    await expect(cmEval.getByText('3', { exact: true })).toBeVisible();

    // 3) CH cũng xem được trên tab Evaluation của cùng task
    await logout(page);
    await loginAs(page, 'creative_head');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await openEvaluationTab(page);
    const chEval = page.getByRole('tabpanel', { name: /Evaluation/i });
    await expect(chEval.getByText(note)).toBeVisible({ timeout: 15_000 });
    const seenCh = await getTask(ch.token, parent.id);
    expect(seenCh.pmEvaluation).toBe('3');
    expect(seenCh.pmNote).toBe(note);
  });
});
