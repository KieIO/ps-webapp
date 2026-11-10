import { type Page } from '@playwright/test';
import { test, expect, loginAs, logout } from '../fixtures/auth';
import { getTask, patchStatus, setupWholeAssigned } from './helpers/splitFamilyApi';

/**
 * Ordered creative evaluation chain (UI smoke):
 * Staff finishes → CM scores Staff → CH scores CM → PM scores CH.
 * Asserts three independent score layers on the Evaluation tab.
 */

async function evaluateLayer(
  page: Page,
  opts: { title: string; score: string; note: string; completion: string; quantity?: string },
): Promise<void> {
  await page.getByRole('button', { name: /Evaluate/ }).click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByText(opts.title)).toBeVisible();

  if (opts.quantity) {
    const qty = modal.locator('#completedQuantity');
    const pct = modal.locator('#completionPercent');
    await expect(qty).toBeVisible();
    await qty.fill(opts.quantity);
    await pct.fill(opts.completion);
  } else {
    const pct = modal.locator('#completionPercent');
    await expect(pct).toBeVisible();
    await pct.fill(opts.completion);
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

test.describe('PM→CH ordered evaluation chain', () => {
  test('Staff finish → CM→Staff → CH→CM → PM→CH; CH sees PM score', async ({ page }) => {
    const taskName = `E2E Eval Chain ${Date.now()}`;
    const cmNote = `CM staff ${Date.now()}`;
    const chNote = `CH package ${Date.now()}`;
    const pmNote = `PM scores CH ${Date.now()}`;
    const { task, cm, ch, employee } = await setupWholeAssigned(taskName);

    await patchStatus(employee.token, task.id, 'finished');

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await evaluateLayer(page, {
      title: 'Đánh giá kết quả Staff',
      score: '5',
      note: cmNote,
      completion: '100',
      quantity: String(Math.round(task.quantity || 5)),
    });

    const afterCm = await getTask(cm.token, task.id);
    expect(afterCm.pmEvaluation).toBe('5');
    expect(afterCm.pmNote).toBe(cmNote);
    expect(afterCm.handoffEvaluation ?? '').toBe('');
    expect(afterCm.chEvaluation ?? '').toBe('');

    await logout(page);
    await loginAs(page, 'creative_head');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await evaluateLayer(page, {
      title: 'Đánh giá gói của CM',
      score: '4',
      note: chNote,
      completion: '90',
    });

    const afterCh = await getTask(ch.token, task.id);
    expect(afterCh.pmEvaluation).toBe('5');
    expect(afterCh.handoffEvaluation).toBe('4');
    expect(afterCh.handoffNote).toBe(chNote);
    expect(afterCh.chEvaluation ?? '').toBe('');

    await logout(page);
    await loginAs(page, 'pm');
    await page.goto(`/tasks/detail/${task.id}`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await evaluateLayer(page, {
      title: 'Đánh giá Creative Head',
      score: '3',
      note: pmNote,
      completion: '85',
    });

    const afterPm = await getTask(cm.token, task.id);
    expect(afterPm.pmEvaluation).toBe('5');
    expect(afterPm.pmNote).toBe(cmNote);
    expect(afterPm.handoffEvaluation).toBe('4');
    expect(afterPm.handoffNote).toBe(chNote);
    expect(afterPm.chEvaluation).toBe('3');
    expect(afterPm.chNote).toBe(pmNote);
    expect(afterPm.chCompletionPercent).toBe(85);

    await logout(page);
    await loginAs(page, 'creative_head');
    await page.goto(`/tasks/detail/${task.id}?tab=evaluation`);
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole('tab', { name: /Evaluation/i }).click();
    const panel = page.getByRole('tabpanel', { name: /Evaluation/i });
    await expect(panel.getByText('Đánh giá của PM (Creative Head)')).toBeVisible();
    await expect(panel.getByText(pmNote)).toBeVisible({ timeout: 15_000 });
    await expect(panel.getByText('Đánh giá của Creative Head')).toBeVisible();
    await expect(panel.getByText(chNote)).toBeVisible();
    await expect(panel.getByText('Đánh giá kết quả Staff')).toBeVisible();
    await expect(panel.getByText(cmNote)).toBeVisible();
  });
});
