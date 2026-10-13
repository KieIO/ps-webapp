import { test, expect, loginAs, logout, SEED_ACCOUNTS } from '../fixtures/auth';

/**
 * TASK-64 — Creative Head refuses a PM → CH creative handoff.
 * Expect: sticky decline, pipelineStage returned_to_pm, leaves Creative queue;
 * PM sees the task in My Tasks; PM cannot refuse the handoff themselves.
 */
const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

async function apiLogin(email: string, password: string): Promise<string> {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`login failed ${response.status}`);
  }
  const json = (await response.json()) as {
    data?: { token?: string; accessToken?: string };
    token?: string;
  };
  const token = json.data?.token ?? json.data?.accessToken ?? json.token;
  if (!token) throw new Error(`login response missing token: ${JSON.stringify(json)}`);
  return token;
}

async function createCreativeHandoff(token: string, taskName: string): Promise<{ id: string }> {
  const response = await fetch(`${apiBase}/tasks/my`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      // Prefer seeded demo project when present; fall back to local-dev project name.
      projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
      projectManager: { code: 'PM.DEV', name: 'Dev PM' },
      taskName,
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
      description: 'E2E brief for CH refuse',
      designThinking: 2,
      technical: 2,
      contentProcessing: 2,
      additionalFactors: '',
      staff: [],
      taskCategory: 'project',
      department: 'creative',
      staffConfirmation: 'not_updated',
      staffNote: '',
      urgency: 'auto',
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`create handoff failed ${response.status}: ${body}`);
  }
  const json = (await response.json()) as { data: { id: string; pipelineStage?: string } };
  if (json.data.pipelineStage && json.data.pipelineStage !== 'awaiting_ch') {
    throw new Error(`expected awaiting_ch got ${json.data.pipelineStage}`);
  }
  return { id: json.data.id };
}

test.describe('TASK-64 CH refuse PM creative handoff', () => {
  test('CH refuses handoff; PM cannot; task leaves Creative queue', async ({ page }) => {
    const taskName = `E2E CH Refuse ${Date.now()}`;
    const pm = SEED_ACCOUNTS.pm;
    const pmToken = await apiLogin(pm.email, pm.password);
    const created = await createCreativeHandoff(pmToken, taskName);

    // PM must not be able to refuse own handoff via status API.
    const pmRefuse = await fetch(`${apiBase}/tasks/my/${created.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({ staffConfirmation: 'decline', staffNote: '' }),
    });
    expect(pmRefuse.ok).toBeFalsy();

    await loginAs(page, 'creative_head');
    await page.goto('/creative/review');
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 30_000 });

    await page.getByText(taskName).click();
    const refuseBtn = page.getByRole('button', { name: /Từ chối nhận/ });
    await expect(refuseBtn).toBeVisible({ timeout: 15_000 });
    await refuseBtn.click();

    const confirm = page.locator('.ant-modal-confirm').last();
    await expect(confirm.locator('.ant-modal-confirm-title')).toHaveText('Từ chối nhận task này?');
    await confirm.getByRole('button', { name: 'Từ chối', exact: true }).click();

    await expect(page.getByText('Đã từ chối task')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(taskName)).toHaveCount(0, { timeout: 20_000 });

    await logout(page);
    await loginAs(page, 'pm');
    await page.goto('/tasks/project');
    await page.locator('#my-task-search').fill(taskName);
    const row = page.locator('.ant-table-row').filter({ hasText: taskName }).first();
    await expect(row).toBeVisible({ timeout: 30_000 });
    await expect(row.getByText(/Từ chối/)).toBeVisible();
  });
});
