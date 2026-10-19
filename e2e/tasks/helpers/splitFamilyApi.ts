/**
 * Shared API helpers for creative split Playwright specs (TASK-66 / TASK-68).
 */
import { SEED_ACCOUNTS } from '../../fixtures/auth';

export const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export type ApiUser = { id: string; email?: string; name?: string };

export type TaskDto = {
  id: string;
  taskName: string;
  taskCode?: string;
  quantity: number;
  parentTaskId?: string | null;
  pipelineStage?: string;
  staffConfirmation?: string;
  staff?: Array<{ userId?: string; name?: string }>;
};

export async function apiLogin(
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

export async function apiJson<T>(
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

export async function createCreativeHandoff(
  token: string,
  taskName: string,
  quantity = 1,
): Promise<TaskDto> {
  const { data } = await apiJson<TaskDto>('POST', '/tasks/my', token, {
    projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
    projectManager: { code: 'PM.DEV', name: 'Dev PM' },
    taskName,
    // Split assign requires parent qty === sum(subtask qty); seed qty up front.
    quantity,
    date: new Date().toISOString().slice(0, 10),
    description: 'E2E brief for split family',
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

export async function assignCm(token: string, taskId: string, cmUserId: string): Promise<TaskDto> {
  const { data } = await apiJson<TaskDto>('PATCH', `/tasks/my/${taskId}/assign-cm`, token, {
    cmUserId,
    description: 'E2E CH → CM',
  });
  return data;
}

export async function splitAssign(
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

export async function listSplitChildren(token: string, parentId: string): Promise<TaskDto[]> {
  const { data } = await apiJson<{ items: TaskDto[] }>(
    'GET',
    `/tasks/my/${parentId}/split-children`,
    token,
  );
  return data.items ?? [];
}

export async function patchStatus(
  token: string,
  taskId: string,
  staffConfirmation: string,
): Promise<void> {
  await apiJson('PATCH', `/tasks/my/${taskId}/status`, token, {
    staffConfirmation,
    staffNote: 'e2e',
  });
}

export async function setupSplitFamily(opts: {
  taskName: string;
  qtyA?: number;
  qtyB?: number;
  staffAUserId?: string;
  staffBUserId?: string;
}): Promise<{
  parent: TaskDto;
  children: TaskDto[];
  cm: { token: string; user: ApiUser };
  admin: { token: string; user: ApiUser };
  pm: { token: string; user: ApiUser };
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

  type StaffOption = { userId?: string };
  const { data: staffOptions } = await apiJson<StaffOption[]>(
    'GET',
    '/tasks/my/staff-options',
    cm.token,
  );
  const ids = (staffOptions ?? [])
    .map((entry) => entry.userId)
    .filter((id): id is string => Boolean(id));
  if (ids.length < 2) {
    throw new Error(`need ≥2 staff-options for split, got ${ids.length}`);
  }

  const staffA = opts.staffAUserId ?? ids[0]!;
  const staffB = opts.staffBUserId ?? ids.find((id) => id !== staffA) ?? ids[1]!;
  const qtyA = opts.qtyA ?? 8;
  const qtyB = opts.qtyB ?? 8;

  const created = await createCreativeHandoff(pm.token, opts.taskName, qtyA + qtyB);
  await assignCm(ch.token, created.id, cm.user.id);
  const parent = await splitAssign(cm.token, created.id, staffA, staffB, qtyA, qtyB);

  let children = await listSplitChildren(cm.token, parent.id);
  if (children.length < 2) {
    children = await listSplitChildren(admin.token, parent.id);
  }
  if (children.length < 2) {
    throw new Error(`expected 2 split children, got ${children.length}`);
  }

  return { parent, children, cm, admin, pm };
}
