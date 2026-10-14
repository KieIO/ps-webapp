import { test, expect, loginAs, SEED_ACCOUNTS } from '../fixtures/auth';

/**
 * TASK-66 — Creative split evaluate remainder + confirmed SL edit (UI smoke).
 * Setup via real API; asserts Evaluate modal spawn CTA and CreativeEditDrawer locks.
 */
const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

type ApiUser = { id: string; email?: string; name?: string };

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

type TaskDto = {
  id: string;
  taskName: string;
  taskCode?: string;
  quantity: number;
  parentTaskId?: string | null;
  pipelineStage?: string;
  staffConfirmation?: string;
};

type StaffOption = { userId?: string; name?: string; code?: string };

async function createCreativeHandoff(token: string, taskName: string): Promise<TaskDto> {
  const { data } = await apiJson<TaskDto>('POST', '/tasks/my', token, {
    projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
    projectManager: { code: 'PM.DEV', name: 'Dev PM' },
    taskName,
    quantity: 1,
    date: new Date().toISOString().slice(0, 10),
    description: 'E2E brief for split evaluate remainder',
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
    description: 'E2E CH → CM',
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
  qtyA: number,
  qtyB: number,
): Promise<TaskDto> {
  const { data } = await apiJson<TaskDto>('PATCH', `/tasks/my/${taskId}/assign-staff`, token, {
    mode: 'split',
    subtasks: [
      {
        name: 'E2E Split A',
        staffUserId: staffA,
        quantity: qtyA,
        description: 'Brief split A',
      },
      {
        name: 'E2E Split B',
        staffUserId: staffB,
        quantity: qtyB,
        description: 'Brief split B',
      },
    ],
  });
  return data;
}

async function listSplitChildren(token: string, parentId: string): Promise<TaskDto[]> {
  const { data } = await apiJson<{ items: TaskDto[] }>(
    'GET',
    '/tasks/my?taskCategory=project',
    token,
  );
  return (data.items ?? []).filter((item) => item.parentTaskId === parentId);
}

async function patchStatus(
  token: string,
  taskId: string,
  staffConfirmation: string,
): Promise<void> {
  await apiJson('PATCH', `/tasks/my/${taskId}/status`, token, {
    staffConfirmation,
    staffNote: 'e2e',
  });
}

async function setupSplitFamily(opts: { taskName: string; qtyA?: number; qtyB?: number }): Promise<{
  parent: TaskDto;
  children: TaskDto[];
  cm: { token: string; user: ApiUser };
  admin: { token: string; user: ApiUser };
}> {
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

  const created = await createCreativeHandoff(pm.token, opts.taskName);
  await assignCm(ch.token, created.id, cm.user.id);
  const [staffA, staffB] = await fetchCreativeStaffIds(cm.token);
  const parent = await splitAssign(
    cm.token,
    created.id,
    staffA,
    staffB,
    opts.qtyA ?? 8,
    opts.qtyB ?? 8,
  );

  let children = await listSplitChildren(cm.token, parent.id);
  if (children.length < 2) {
    children = await listSplitChildren(admin.token, parent.id);
  }
  if (children.length < 2) {
    throw new Error(`expected 2 split children, got ${children.length}`);
  }

  return { parent, children, cm, admin };
}

test.describe('TASK-66 split evaluate remainder + confirmed SL', () => {
  test('CM evaluate finished child can spawn remainder sibling', async ({ page }) => {
    const taskName = `E2E Split Rem ${Date.now()}`;
    const { children, admin } = await setupSplitFamily({ taskName, qtyA: 8, qtyB: 8 });
    const source = children[0]!;

    await patchStatus(admin.token, source.id, 'finished');

    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${source.id}`);
    await expect(page.getByText(source.taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });

    // Accessible name includes Ant icon alt text ("star Evaluate").
    await page.getByRole('button', { name: /Evaluate/ }).click();
    const modal = page.getByRole('dialog');
    await expect(modal.getByText('Evaluate task')).toBeVisible();

    const qtyInput = modal.getByRole('spinbutton', { name: /Số lượng đạt/ });
    await qtyInput.click();
    await qtyInput.fill('3');
    await expect(modal.getByText(/Còn 5/)).toBeVisible();

    await modal.getByRole('button', { name: /Tạo task phần còn lại/ }).click();
    await expect(page.getByText('Đã tạo task phần còn lại')).toBeVisible({ timeout: 20_000 });
    const remainderLink = modal.getByRole('link').filter({ hasText: /-S\d+/ });
    await expect(remainderLink).toBeVisible();
    await expect(remainderLink).toHaveAttribute('target', '_blank');
  });

  test('Creative edit: confirmed SL editable, finished SL locked', async ({ page }) => {
    const taskName = `E2E Split Edit ${Date.now()}`;
    const { parent, children, admin } = await setupSplitFamily({
      taskName,
      qtyA: 12,
      qtyB: 12,
    });
    const confirmed = children[0]!;
    const finished = children[1]!;

    await patchStatus(admin.token, confirmed.id, 'confirmed');
    await patchStatus(admin.token, finished.id, 'finished');

    // CM list includes split children (Admin/PM/CH hide them), so the edit drawer can load rows.
    await loginAs(page, 'creative_manager');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByText(parent.taskName, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole('button', { name: /Sửa \/ Task nhỏ|Sửa \/ Đổi giao/ }).click();
    const drawer = page.getByRole('dialog', { name: /Sửa \/ Đổi giao task Creative/ });
    await expect(drawer.getByText('Sửa / Đổi giao task Creative')).toBeVisible();
    await expect(drawer.getByText(/Chưa tải được danh sách task nhỏ/)).toHaveCount(0, {
      timeout: 20_000,
    });

    const confirmedQty = drawer.getByRole('spinbutton', { name: `SL ${confirmed.taskCode}` });
    const finishedQty = drawer.getByRole('spinbutton', { name: `SL ${finished.taskCode}` });
    await expect(confirmedQty).toBeEnabled();
    await expect(finishedQty).toBeDisabled();

    await confirmedQty.click();
    await confirmedQty.fill('10');
    await expect(drawer.getByText(/\/ 2[24]/)).toBeVisible();
  });
});
