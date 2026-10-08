/**
 * API helpers for task-pipeline Playwright setup.
 * Creates creative-pipeline stages that seed-dev does not ship by default.
 * Logic/authz stay covered by ps-be TaskMgmt API tests — these only stage UI chrome.
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
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
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

export async function apiCreateAssignedStaffCreative(taskName: string): Promise<ApiTask> {
  const awaitingCm = await apiCreateAwaitingCm(taskName);
  return apiAssignStaffWhole(awaitingCm.id);
}
