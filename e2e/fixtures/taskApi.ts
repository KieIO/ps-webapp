/**
 * API helpers for task Playwright setup (post-assign edit + pipeline chrome).
 * Stages real seed-dev tasks so UI specs can open Edit modal / CreativeEditDrawer.
 * Logic/authz stay covered by ps-be TaskMgmt API tests.
 */
import { SEED_ACCOUNTS, type SeedRole } from './auth';

const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ApiTask {
  id: string;
  taskName: string;
  pipelineStage?: string;
  department?: string;
  staffConfirmation?: string;
  description?: string;
}

async function apiJson<T>(
  method: string,
  path: string,
  token?: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json()) as { data?: T; message?: string; code?: string };
  if (!res.ok) {
    throw new Error(
      `${method} ${path} → ${res.status} ${json.code ?? ''} ${json.message ?? JSON.stringify(json)}`,
    );
  }
  return json.data as T;
}

export async function apiLogin(role: SeedRole): Promise<{ token: string; user: ApiUser }> {
  const account = SEED_ACCOUNTS[role];
  const data = await apiJson<{ token: string; user: ApiUser }>('POST', '/auth/login', undefined, {
    email: account.email,
    password: account.password,
  });
  return { token: data.token, user: data.user };
}

/** List users (Admin) — pick a second seed employee for assign-then-edit. */
async function apiListEmployees(token: string): Promise<ApiUser[]> {
  const data = await apiJson<{ items: ApiUser[] } | ApiUser[]>('GET', '/users?limit=100', token);
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return items.filter((u) => u.role === 'employee');
}

function todayDeadlineIso(): string {
  // Far enough that default “Hôm nay” work-date window still includes the task.
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 7);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function staffRef(user: ApiUser): { userId: string; code: string; name: string } {
  const local = user.email.split('@')[0] ?? 'STAFF';
  return {
    userId: user.id,
    code: local.toUpperCase().replace(/[^A-Z0-9.]/g, '.'),
    name: user.name,
  };
}

/** Project-dept task created with staff → assigned_staff (API TASK-01 / TASK-61). */
export async function apiCreateProjectWithStaff(taskName: string): Promise<ApiTask> {
  const { token } = await apiLogin('admin');
  const { user: employee } = await apiLogin('employee');
  return apiJson<ApiTask>('POST', '/tasks/my', token, {
    taskCategory: 'project',
    department: 'project',
    projectName: 'Sanofi Meninga',
    projectManager: { code: 'CUONG.LE', name: 'Le Minh Cuong' },
    taskName,
    quantity: 2,
    date: todayDeadlineIso(),
    description: 'E2E project brief',
    staff: [staffRef(employee)],
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    staffConfirmation: 'not_updated',
    staffNote: '',
    urgency: 'auto',
  });
}

/** Explicit assign (API TASK-37 / TASK-73). Prefer a different employee when available. */
export async function apiAssignProjectStaff(taskId: string): Promise<ApiTask> {
  const { token } = await apiLogin('admin');
  const { user: primary } = await apiLogin('employee');
  const employees = await apiListEmployees(token);
  const other = employees.find((u) => u.id !== primary.id) ?? primary;
  return apiJson<ApiTask>('PATCH', `/tasks/my/${taskId}/assign`, token, {
    staff: [staffRef(other)],
    staffNote: 'E2E post-assign',
  });
}

/** Create project task → assign (TASK-73 staging). */
export async function apiCreateProjectAfterAssign(taskName: string): Promise<ApiTask> {
  const created = await apiCreateProjectWithStaff(taskName);
  return apiAssignProjectStaff(created.id);
}

/** Creative project task with empty staff → awaiting_ch (API TASK-06). */
export async function apiCreateAwaitingCh(taskName: string): Promise<ApiTask> {
  const { token } = await apiLogin('admin');
  return apiJson<ApiTask>('POST', '/tasks/my', token, {
    taskCategory: 'project',
    department: 'creative',
    projectName: 'Sanofi Meninga',
    projectManager: { code: 'CUONG.LE', name: 'Le Minh Cuong' },
    taskName,
    quantity: 12,
    date: todayDeadlineIso(),
    description: 'E2E creative brief',
    staff: [],
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    staffConfirmation: 'not_updated',
    staffNote: '',
    urgency: 'auto',
  });
}

/** Advance awaiting_ch → awaiting_cm (API TASK-47). */
export async function apiAssignCm(taskId: string): Promise<ApiTask> {
  const { token } = await apiLogin('creative_head');
  const { user: cm } = await apiLogin('creative_manager');
  return apiJson<ApiTask>('PATCH', `/tasks/my/${taskId}/assign-cm`, token, {
    cmUserId: cm.id,
    cmNote: 'E2E handoff to CM',
  });
}

/** Advance awaiting_cm → assigned_staff whole (API TASK-50). */
export async function apiAssignStaffWhole(taskId: string, quantity = 12): Promise<ApiTask> {
  const { token } = await apiLogin('creative_manager');
  const { user: employee } = await apiLogin('employee');
  return apiJson<ApiTask>('PATCH', `/tasks/my/${taskId}/assign-staff`, token, {
    mode: 'whole',
    staffUserId: employee.id,
    quantity,
  });
}

export async function apiCreateAwaitingCm(taskName: string): Promise<ApiTask> {
  const created = await apiCreateAwaitingCh(taskName);
  return apiAssignCm(created.id);
}

/** Creative whole assigned_staff (API TASK-75 staging). */
export async function apiCreateAssignedStaffCreative(taskName: string): Promise<ApiTask> {
  const awaitingCm = await apiCreateAwaitingCm(taskName);
  return apiAssignStaffWhole(awaitingCm.id);
}
