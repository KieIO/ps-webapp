/**
 * Playwright helpers for CreateTaskDrawer / CreateTaskModal (TASK-01…63 create sheet).
 */
import { expect, type Locator, type Page } from '@playwright/test';

export const E2E_PROJECT = process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP';

export function createDrawer(page: Page): Locator {
  return page.locator('.ant-drawer').filter({ hasText: 'Tạo task mới' });
}

export function createModal(page: Page): Locator {
  return page.locator('.ant-modal').filter({ hasText: 'Create task' });
}

export async function openProjectCreateDrawer(page: Page): Promise<Locator> {
  await page.goto('/tasks/project');
  await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole('button', { name: /Tạo task/ }).click();
  const drawer = createDrawer(page);
  await expect(drawer).toBeVisible({ timeout: 15_000 });
  return drawer;
}

export async function openNonProjectCreateModal(page: Page): Promise<Locator> {
  await page.goto('/tasks/non-project');
  await page.getByRole('button', { name: /Create task/ }).click();
  const modal = createModal(page);
  await expect(modal).toBeVisible({ timeout: 15_000 });
  return modal;
}

export async function pickDropdownOption(page: Page, text: string | RegExp): Promise<void> {
  const option = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: text })
    .first();
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
}

export async function fillFormItemInput(
  root: Locator,
  label: string,
  value: string,
): Promise<void> {
  const item = root.locator('.ant-form-item').filter({ hasText: label }).first();
  const input = item.locator('input').first();
  await input.click();
  await input.fill(value);
}

export async function pickFormSelect(
  page: Page,
  root: Locator,
  label: string,
  option: string | RegExp,
): Promise<void> {
  const item = root.locator('.ant-form-item').filter({ hasText: label }).first();
  await item.locator('.ant-select').click();
  await pickDropdownOption(page, option);
}

/** ClassificationScale radios (1–5) under a criterion label. */
export async function setCriterion(root: Locator, label: string, level: number): Promise<void> {
  const item = root.locator('.ant-form-item').filter({ hasText: label }).first();
  await item.getByRole('radio', { name: String(level) }).click();
}

export async function pickProjectName(
  page: Page,
  root: Locator,
  projectName = E2E_PROJECT,
): Promise<void> {
  const item = root
    .locator('.ant-form-item')
    .filter({ hasText: /Tên dự án|Project name/i })
    .first();
  const input = item.locator('input').first();
  await input.click();
  await input.fill(projectName);
  const option = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: projectName })
    .first();
  // Autocomplete may allow free text if project not listed.
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    await input.press('Enter');
  }
}

/** Type a project name that is not in catalog (keeps dropdown open for "+ Add"). */
export async function typeUnknownProjectName(
  page: Page,
  root: Locator,
  projectName: string,
): Promise<void> {
  const item = root
    .locator('.ant-form-item')
    .filter({ hasText: /Tên dự án|Project name/i })
    .first();
  const input = item.locator('input').first();
  await input.click();
  await input.fill(projectName);
  await expect(
    page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first(),
  ).toBeVisible({ timeout: 10_000 });
}

/**
 * Fill nested Create project modal opened from create-task "+ Add".
 * Prefers seeded client SANOFI + Dev Department Head / Dev PM when listed.
 */
export async function fillCreateProjectFromAdd(page: Page, modal: Locator): Promise<void> {
  const clientItem = modal
    .locator('.ant-form-item')
    .filter({ hasText: /^Client$/ })
    .first();
  await clientItem.locator('.ant-select').click();
  const sanofi = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: /SANOFI/i })
    .first();
  if (await sanofi.isVisible().catch(() => false)) {
    await sanofi.click();
  } else {
    const clientSearch = `E2E Client ${Date.now()}`;
    await page.keyboard.type(clientSearch);
    await page.getByRole('button', { name: new RegExp(`Add ["“]?${clientSearch}["”]?`) }).click();
    await expect(clientItem.locator('.ant-select-selection-item')).toBeVisible({ timeout: 15_000 });
  }

  const headItem = modal
    .locator('.ant-form-item')
    .filter({ hasText: /Dept\.?\s*head/i })
    .first();
  await headItem.locator('.ant-select').click();
  await pickDropdownOption(page, /Dev Department Head|Tran Thi Binh|Head/i);

  const pmItem = modal.locator('.ant-form-item').filter({ hasText: /^PM$/ }).first();
  await pmItem.locator('.ant-select').click();
  await pickDropdownOption(page, /Dev PM|Le Minh Cuong|^Dev PM$/i);

  await modal.getByRole('button', { name: /^Create project$/ }).click();
}

/** Project Task brief step: project, task type, qty, brief, criteria. PM usually auto-filled. */
export async function fillProjectBriefStep(
  page: Page,
  drawer: Locator,
  opts: {
    taskType?: string;
    quantity?: number;
    brief?: string;
    criteria?: [number, number, number];
  } = {},
): Promise<void> {
  const taskType = opts.taskType ?? 'Slides';
  const [dt, tech, content] = opts.criteria ?? [2, 2, 2];

  await pickProjectName(page, drawer);
  await pickFormSelect(page, drawer, 'Tên task', new RegExp(`^${taskType}$`));
  if (opts.quantity != null) {
    const qty = drawer.locator('.ant-form-item').filter({ hasText: 'Số lượng' }).locator('input');
    await qty.fill(String(opts.quantity));
  }
  await drawer
    .locator('.ant-form-item')
    .filter({ hasText: 'Brief' })
    .locator('textarea')
    .fill(opts.brief ?? 'E2E create-task brief');
  await setCriterion(drawer, 'Tư Duy Thiết Kế', dt);
  await setCriterion(drawer, 'Kỹ Thuật', tech);
  await setCriterion(drawer, 'Xử Lý Nội Dung', content);
}

/** Creative Task brief step: project + creative catalog task + deadline (no criteria/brief). */
export async function fillCreativeBriefStep(
  page: Page,
  drawer: Locator,
  opts: { taskType?: string } = {},
): Promise<void> {
  const taskType = opts.taskType ?? 'QA';
  await pickProjectName(page, drawer);
  await pickFormSelect(page, drawer, 'Tên task', new RegExp(`^${taskType}$`));
}

export async function waitCreateTaskResponse(page: Page): Promise<{
  id: string;
  taskName: string;
  pipelineStage?: string;
  department?: string;
  level?: number;
  staff?: unknown[];
  taskCategory?: string;
}> {
  const response = await page.waitForResponse(
    (res) =>
      res.request().method() === 'POST' &&
      /\/tasks\/my\/?$/.test(new URL(res.url()).pathname) &&
      res.status() < 500,
    { timeout: 30_000 },
  );
  expect(response.status()).toBeLessThan(400);
  const json = (await response.json()) as {
    data?: {
      id: string;
      taskName: string;
      pipelineStage?: string;
      department?: string;
      level?: number;
      staff?: unknown[];
      taskCategory?: string;
    };
  };
  if (!json.data?.id) {
    throw new Error(`create task response missing data: ${JSON.stringify(json)}`);
  }
  return json.data;
}
