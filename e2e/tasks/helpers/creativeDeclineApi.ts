/**
 * Shared API helpers for creative decline / rehand Playwright specs.
 */
export const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export type ApiUser = { id: string; email?: string; name?: string };

export type TaskDto = {
  id: string;
  taskName: string;
  taskCode?: string;
  quantity?: number;
  pipelineStage?: string;
  staffConfirmation?: string;
  staffNote?: string;
  projectName?: string;
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
): Promise<{ status: number; data: T; ok: boolean; message?: string }> {
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
  return {
    status: response.status,
    data: parsed.data as T,
    ok: response.ok,
    message: parsed.message,
  };
}

export async function createCreativeHandoff(
  token: string,
  taskName: string,
  quantity = 12,
): Promise<TaskDto> {
  const { ok, status, data, message } = await apiJson<TaskDto>('POST', '/tasks/my', token, {
    projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
    projectManager: { code: 'PM.DEV', name: 'Dev PM' },
    taskName,
    quantity,
    date: new Date().toISOString().slice(0, 10),
    description: 'E2E brief for decline coverage',
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
  if (!ok || !data?.id) {
    throw new Error(`create handoff failed ${status}: ${message ?? JSON.stringify(data)}`);
  }
  return data;
}

export async function declineTask(
  token: string,
  taskId: string,
  staffNote: string,
): Promise<{ ok: boolean; status: number; data?: TaskDto; message?: string }> {
  const result = await apiJson<TaskDto>('PATCH', `/tasks/my/${taskId}/status`, token, {
    staffConfirmation: 'decline',
    staffNote,
  });
  return result;
}

export async function assignCm(token: string, taskId: string, cmUserId: string): Promise<TaskDto> {
  const { ok, status, data, message } = await apiJson<TaskDto>(
    'PATCH',
    `/tasks/my/${taskId}/assign-cm`,
    token,
    { cmUserId, description: 'E2E CH → CM for decline' },
  );
  if (!ok || !data?.id) {
    throw new Error(`assign-cm failed ${status}: ${message ?? JSON.stringify(data)}`);
  }
  return data;
}

export type TrackerBlock = { label?: string; type?: string };
export type TrackerProject = { name?: string; blocks?: TrackerBlock[]; totalSlides?: number };

export async function fetchTracker(token: string): Promise<TrackerProject[]> {
  const { ok, status, data, message } = await apiJson<{ projects?: TrackerProject[] }>(
    'GET',
    '/tracker',
    token,
  );
  if (!ok) {
    throw new Error(`tracker failed ${status}: ${message}`);
  }
  return data?.projects ?? [];
}

export function trackerHasTaskLabel(projects: TrackerProject[], taskName: string): boolean {
  const needle = taskName.trim().toLowerCase();
  for (const project of projects) {
    for (const block of project.blocks ?? []) {
      const label = (block.label ?? '').toLowerCase();
      if (label.includes(needle)) return true;
    }
  }
  return false;
}
