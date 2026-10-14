import { test, expect, loginAs, logout, SEED_ACCOUNTS } from '../fixtures/auth';

/**
 * TASK-65 — PM rehands a CH-refused creative task back to awaiting_ch.
 * Expect: returned_to_pm visible on PM Creative CH queue; rehand → awaiting_ch;
 * any CH can then assign CM.
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
      projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
      projectManager: { code: 'PM.DEV', name: 'Dev PM' },
      taskName,
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
      description: 'E2E brief for PM rehand',
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
  const json = (await response.json()) as { data: { id: string } };
  return { id: json.data.id };
}

async function refuseAsCH(token: string, taskId: string): Promise<void> {
  const response = await fetch(`${apiBase}/tasks/my/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ staffConfirmation: 'decline', staffNote: '' }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CH refuse failed ${response.status}: ${body}`);
  }
}

test.describe('TASK-65 PM rehand CH-refused task', () => {
  test('PM sees refused task and rehands to CH queue', async ({ page }) => {
    const taskName = `E2E PM Rehand ${Date.now()}`;
    const pm = SEED_ACCOUNTS.pm;
    const ch = SEED_ACCOUNTS.creative_head;
    const pmToken = await apiLogin(pm.email, pm.password);
    const chToken = await apiLogin(ch.email, ch.password);
    const created = await createCreativeHandoff(pmToken, taskName);
    await refuseAsCH(chToken, created.id);

    await loginAs(page, 'pm');
    await page.goto('/creative/review');
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Đã trả PM')).toBeVisible();

    await page
      .getByRole('button', { name: /Đưa lại CH/ })
      .first()
      .click();
    const confirm = page.locator('.ant-modal-confirm').last();
    await expect(confirm.locator('.ant-modal-confirm-title')).toHaveText('Đưa lại hàng chờ CH?');
    await confirm.getByRole('button', { name: 'Đưa lại CH', exact: true }).click();

    await expect(page.getByText('Đã đưa lại hàng chờ CH')).toBeVisible({
      timeout: 20_000,
    });

    await logout(page);
    await loginAs(page, 'creative_head');
    await page.goto('/creative/review');
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Chờ xử lý').first()).toBeVisible();
  });
});
