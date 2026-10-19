import { test, expect, loginAs, logout, SEED_ACCOUNTS } from '../fixtures/auth';

/**
 * TASK-69 — CM Project Tasks scopes (option C)
 * Toggle Task nhận vs Task giao Staff; oversight roles must not see the control.
 * API setup asserts split parent/child land on the correct tabs.
 */

const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

type ApiUser = { id: string; email?: string; name?: string };

type TaskDto = {
  id: string;
  taskName: string;
  taskCode?: string;
  parentTaskId?: string | null;
  pipelineStage?: string;
};

type StaffOption = { userId?: string; name?: string; code?: string };

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
): Promise<{ status: number; data: T }> {
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
  if (!response.ok) {
    throw new Error(`${method} ${path} failed ${response.status}: ${parsed.message ?? text}`);
  }
  return { status: response.status, data: parsed.data as T };
}

async function createCreativeHandoff(token: string, taskName: string): Promise<TaskDto> {
  const { data } = await apiJson<TaskDto>('POST', '/tasks/my', token, {
    projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
    projectManager: { code: 'PM.DEV', name: 'Dev PM' },
    taskName,
    quantity: 16,
    date: new Date().toISOString().slice(0, 10),
    description: 'E2E brief for CM project scopes',
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
  });
  return data;
}

async function assignCm(token: string, taskId: string, cmUserId: string): Promise<TaskDto> {
  const { data } = await apiJson<TaskDto>('PATCH', `/tasks/my/${taskId}/assign-cm`, token, {
    cmUserId,
    description: 'E2E CH → CM for scopes',
  });
  return data;
}

async function fetchCreativeStaffIds(token: string): Promise<[string, string]> {
  const { data } = await apiJson<StaffOption[]>('GET', '/tasks/my/staff-options', token);
  const ids = (data ?? []).map((entry) => entry.userId).filter((id): id is string => Boolean(id));
  if (ids.length < 2) {
    throw new Error(`need ≥2 staff-options for split, got ${ids.length}`);
  }
  return [ids[0]!, ids[1]!];
}

async function splitAssign(
  token: string,
  taskId: string,
  staffA: string,
  staffB: string,
): Promise<TaskDto> {
  const { data } = await apiJson<TaskDto>('PATCH', `/tasks/my/${taskId}/assign-staff`, token, {
    mode: 'split',
    subtasks: [
      {
        name: 'E2E Scope S1',
        staffUserId: staffA,
        quantity: 8,
        description: 'Brief S1',
      },
      {
        name: 'E2E Scope S2',
        staffUserId: staffB,
        quantity: 8,
        description: 'Brief S2',
      },
    ],
  });
  return data;
}

async function listSplitChildren(token: string, parentId: string): Promise<TaskDto[]> {
  const { data } = await apiJson<{ items: TaskDto[] }>(
    'GET',
    `/tasks/my/${parentId}/split-children`,
    token,
  );
  return data.items ?? [];
}

async function setupSplitFamily(
  taskName: string,
): Promise<{ parent: TaskDto; children: TaskDto[] }> {
  const pm = await apiLogin(SEED_ACCOUNTS.pm.email, SEED_ACCOUNTS.pm.password);
  const ch = await apiLogin(
    SEED_ACCOUNTS.creative_head.email,
    SEED_ACCOUNTS.creative_head.password,
  );
  const cm = await apiLogin(
    SEED_ACCOUNTS.creative_manager.email,
    SEED_ACCOUNTS.creative_manager.password,
  );
  const admin = await apiLogin(SEED_ACCOUNTS.admin.email, SEED_ACCOUNTS.admin.password);

  const created = await createCreativeHandoff(pm.token, taskName);
  await assignCm(ch.token, created.id, cm.user.id);
  const [staffA, staffB] = await fetchCreativeStaffIds(cm.token);
  const parent = await splitAssign(cm.token, created.id, staffA, staffB);

  let children = await listSplitChildren(cm.token, parent.id);
  if (children.length < 2) {
    children = await listSplitChildren(admin.token, parent.id);
  }
  if (children.length < 2) {
    throw new Error(`expected 2 split children, got ${children.length}`);
  }

  return { parent, children };
}

test.describe('TASK-69 CM Project Tasks scopes', () => {
  test('CM sees scope toggle; PM and CH do not', async ({ page }) => {
    await loginAs(page, 'creative_manager');
    await page.goto('/tasks/project?workDate=all');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Task nhận \(/)).toBeVisible();
    await expect(page.getByText(/Task giao Staff \(/)).toBeVisible();
    await expect(page.getByText(/Gói việc CH giao cho bạn/)).toBeVisible();

    // Non-project list stays unscoped (no CM receive/staff split).
    await page.goto('/tasks/non-project');
    await expect(page.getByRole('heading', { name: 'Non-project tasks' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Task nhận \(/)).toHaveCount(0);
    await logout(page);

    await loginAs(page, 'pm');
    await page.goto('/tasks/project?workDate=all');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Task nhận \(/)).toHaveCount(0);
    await expect(page.getByText(/Task giao Staff \(/)).toHaveCount(0);
    await logout(page);

    await loginAs(page, 'creative_head');
    await page.goto('/tasks/project?workDate=all');
    await expect(page.getByRole('heading', { name: 'Project Tasks' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Task nhận \(/)).toHaveCount(0);
    await expect(page.getByText(/Task giao Staff \(/)).toHaveCount(0);
  });

  test('CM tab switch updates URL and hint', async ({ page }) => {
    await loginAs(page, 'creative_manager');
    await page.goto('/tasks/project?workDate=all');
    await expect(page.getByText(/Task nhận \(/)).toBeVisible({ timeout: 30_000 });

    await page.getByText(/Task giao Staff \(/).click();
    await expect(page).toHaveURL(/cmScope=staff/);
    await expect(page.getByText(/Việc đã giao Staff \(nguyên hoặc task nhỏ\)/)).toBeVisible();

    await page.getByText(/Task nhận \(/).click();
    await expect(page).not.toHaveURL(/cmScope=/);
    await expect(page.getByText(/Gói việc CH giao cho bạn/)).toBeVisible();
  });

  test('split parent stays on Task nhận; children on Task giao Staff', async ({ page }) => {
    const taskName = `E2E CM Scope ${Date.now()}`;
    const { children } = await setupSplitFamily(taskName);
    const childName = children[0]?.taskName ?? 'E2E Scope S1';

    await loginAs(page, 'creative_manager');

    // Use full query URLs — avoids search onChange racing and wiping cmScope.
    await page.goto(`/tasks/project?workDate=all&search=${encodeURIComponent(taskName)}`);
    await expect(page.getByRole('radio', { name: /Task nhận/ })).toBeChecked({
      timeout: 30_000,
    });
    await expect(page.getByText(taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(childName, { exact: false })).toHaveCount(0);

    await page.goto(
      `/tasks/project?workDate=all&cmScope=staff&search=${encodeURIComponent(childName)}`,
    );
    await expect(page.getByRole('radio', { name: /Task giao Staff/ })).toBeChecked({
      timeout: 30_000,
    });
    await expect(page.getByText(childName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
