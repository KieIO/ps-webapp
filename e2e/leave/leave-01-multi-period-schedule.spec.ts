import { test, expect, loginAs, SEED_ACCOUNTS } from '../fixtures/auth';

/**
 * Leave multi-period smoke.
 * API creates scheduled periods (RangePicker is flaky in CI); UI verifies list + cancel.
 * Overlap guard is asserted via API (same BE rule the wizard uses).
 */
const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

const TARGET_EMAIL = process.env.E2E_LEAVE_USER_EMAIL ?? 'employee@pokeslide.dev';
const TARGET_NAME = process.env.E2E_LEAVE_USER_NAME ?? 'Dev Employee';

type ApiUser = { id: string; email?: string; name?: string; status?: string };

type LeaveRecord = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
};

async function apiLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: ApiUser }> {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`login failed ${response.status}`);
  }
  const json = (await response.json()) as {
    data?: { token?: string; accessToken?: string; user?: ApiUser };
    token?: string;
    user?: ApiUser;
  };
  const token = json.data?.token ?? json.data?.accessToken ?? json.token;
  const user = json.data?.user ?? json.user;
  if (!token || !user?.id) {
    throw new Error(`login response missing token/user: ${JSON.stringify(json)}`);
  }
  return { token, user };
}

async function apiJson<T>(
  method: string,
  path: string,
  token: string,
  body?: unknown,
): Promise<{ status: number; data: T; message?: string }> {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let parsed: { data?: T; message?: string } = {};
  try {
    parsed = text ? (JSON.parse(text) as { data?: T; message?: string }) : {};
  } catch {
    throw new Error(`${method} ${path} non-JSON ${response.status}: ${text}`);
  }
  return { status: response.status, data: parsed.data as T, message: parsed.message };
}

async function findUserIdByEmail(token: string, email: string): Promise<string> {
  const queries = [email, email.split('@')[0] ?? email, TARGET_NAME];
  for (const query of queries) {
    const { status, data } = await apiJson<{ items: ApiUser[] }>(
      'GET',
      `/users?search=${encodeURIComponent(query)}`,
      token,
    );
    if (status >= 400) continue;
    const match = (data?.items ?? []).find(
      (user) =>
        user.email?.toLowerCase() === email.toLowerCase() ||
        user.name?.toLowerCase() === TARGET_NAME.toLowerCase(),
    );
    if (match?.id) return match.id;
  }
  throw new Error(`user ${email} not found in /users search`);
}

async function listOpenLeaves(token: string, userId: string): Promise<LeaveRecord[]> {
  const { status, data, message } = await apiJson<LeaveRecord[]>(
    'GET',
    `/users/${userId}/leave/open`,
    token,
  );
  if (status >= 400) {
    throw new Error(`list open leave failed ${status}: ${message ?? ''}`);
  }
  return data ?? [];
}

async function createLeave(
  token: string,
  userId: string,
  startDate: string,
  endDate: string,
  reason: string,
): Promise<LeaveRecord> {
  const { status, data, message } = await apiJson<LeaveRecord>(
    'POST',
    `/users/${userId}/leave`,
    token,
    { startDate, endDate, reason, reassignments: [] },
  );
  if (status >= 400 || !data?.id) {
    throw new Error(`create leave failed ${status}: ${message ?? JSON.stringify(data)}`);
  }
  return data;
}

async function cancelAllOpenLeaves(token: string, userId: string): Promise<void> {
  const open = await listOpenLeaves(token, userId);
  for (const leave of open) {
    await apiJson('POST', `/users/${userId}/leave/${leave.id}/cancel`, token);
  }
  const user = await apiJson<ApiUser>('GET', `/users/${userId}`, token);
  if (user.data?.status === 'on_leave') {
    await apiJson('POST', `/users/${userId}/reactivate`, token);
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatApiDate(offsetDays: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

test.describe('Leave-01 multi-period schedule', () => {
  test('Admin sees two scheduled periods, cancels one, overlap rejected', async ({ page }) => {
    test.setTimeout(90_000);

    const admin = SEED_ACCOUNTS.admin;
    const { token } = await apiLogin(admin.email, admin.password);
    const userId = await findUserIdByEmail(token, TARGET_EMAIL);
    await cancelAllOpenLeaves(token, userId);

    const base = 120 + (Date.now() % 40);
    const period1Start = base;
    const period1End = base + 4;
    const period2Start = base + 15;
    const period2End = base + 19;
    const overlapStart = base + 2;
    const overlapEnd = base + 6;

    const first = await createLeave(
      token,
      userId,
      formatApiDate(period1Start),
      formatApiDate(period1End),
      `E2E leave period 1 ${Date.now()}`,
    );
    expect(first.status).toBe('scheduled');

    const second = await createLeave(
      token,
      userId,
      formatApiDate(period2Start),
      formatApiDate(period2End),
      `E2E leave period 2 ${Date.now()}`,
    );
    expect(second.status).toBe('scheduled');

    const userAfterCreate = await apiJson<ApiUser>('GET', `/users/${userId}`, token);
    expect(userAfterCreate.data.status).toBe('active');

    let open = await listOpenLeaves(token, userId);
    expect(open).toHaveLength(2);

    await loginAs(page, 'admin');
    await page.goto(`/users/${userId}`);
    await expect(page.getByRole('heading', { name: TARGET_NAME })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Scheduled & current')).toBeVisible();
    const periodRows = page
      .locator('li')
      .filter({ has: page.getByText('Scheduled', { exact: true }) });
    await expect(periodRows).toHaveCount(2, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Schedule leave' })).toBeVisible();
    await expect(page.getByText('Add another non-overlapping period')).toBeVisible();

    // Cancel the later period from UI so period 1 remains for overlap checks.
    await periodRows.nth(1).getByRole('button', { name: 'Cancel' }).click();
    const confirm = page.locator('.ant-modal-confirm').filter({ hasText: 'Cancel leave?' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Cancel leave' }).click();
    await expect(page.getByText('Leave cancelled')).toBeVisible({ timeout: 15_000 });

    open = await listOpenLeaves(token, userId);
    expect(open).toHaveLength(1);
    expect(open[0]?.startDate).toBe(formatApiDate(period1Start));
    await expect(periodRows).toHaveCount(1);

    const overlap = await apiJson('POST', `/users/${userId}/leave`, token, {
      startDate: formatApiDate(overlapStart),
      endDate: formatApiDate(overlapEnd),
      reason: `E2E overlap ${Date.now()}`,
      reassignments: [],
    });
    expect(overlap.status).toBe(409);
    expect(overlap.message ?? '').toMatch(/overlap/i);

    open = await listOpenLeaves(token, userId);
    expect(open).toHaveLength(1);

    await cancelAllOpenLeaves(token, userId);
  });
});
