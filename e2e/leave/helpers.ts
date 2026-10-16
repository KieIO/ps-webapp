/**
 * Shared API helpers for leave e2e (real API + seed-dev).
 */

export const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export const TARGET_EMAIL = process.env.E2E_LEAVE_USER_EMAIL ?? 'employee@pokeslide.dev';
export const TARGET_NAME = process.env.E2E_LEAVE_USER_NAME ?? 'Dev Employee';
export const TARGET_PASSWORD =
  process.env.E2E_LEAVE_USER_PASSWORD ?? process.env.E2E_EMPLOYEE_PASSWORD ?? 'ps123';

export type ApiUser = { id: string; email?: string; name?: string; status?: string };

export type LeaveRecord = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
};

export type TrackerOffDay = {
  date: string;
  names?: string[];
  people?: Array<{ id: string; name: string }>;
};

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ status: number; token?: string; user?: ApiUser; message?: string }> {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await response.text();
  let parsed: {
    data?: { token?: string; accessToken?: string; user?: ApiUser };
    token?: string;
    user?: ApiUser;
    message?: string;
  } = {};
  try {
    parsed = text ? (JSON.parse(text) as typeof parsed) : {};
  } catch {
    return { status: response.status, message: text };
  }
  const token = parsed.data?.token ?? parsed.data?.accessToken ?? parsed.token;
  const user = parsed.data?.user ?? parsed.user;
  return { status: response.status, token, user, message: parsed.message };
}

export async function apiLoginOk(
  email: string,
  password: string,
): Promise<{ token: string; user: ApiUser }> {
  const result = await apiLogin(email, password);
  if (result.status >= 400 || !result.token || !result.user?.id) {
    throw new Error(`login failed ${result.status}: ${result.message ?? JSON.stringify(result)}`);
  }
  return { token: result.token, user: result.user };
}

export async function apiJson<T>(
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

export async function findUserIdByEmail(token: string, email: string): Promise<string> {
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

export async function listOpenLeaves(token: string, userId: string): Promise<LeaveRecord[]> {
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

export async function createLeave(
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

export async function cancelAllOpenLeaves(token: string, userId: string): Promise<void> {
  const open = await listOpenLeaves(token, userId);
  for (const leave of open) {
    await apiJson('POST', `/users/${userId}/leave/${leave.id}/cancel`, token);
  }
  // Listing open leaves runs leave sync, which auto-restores Active when nothing covers today.
  await listOpenLeaves(token, userId);
}

export async function getUserStatus(token: string, userId: string): Promise<string> {
  const { status, data, message } = await apiJson<ApiUser>('GET', `/users/${userId}`, token);
  if (status >= 400 || !data?.status) {
    throw new Error(`get user failed ${status}: ${message ?? ''}`);
  }
  return data.status;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatApiDate(offsetDays: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function formatYmdUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Next Friday at least `minOffset` days out, plus Sat/Sun/Mon of that weekend. */
export function upcomingFriMonSpan(minOffset = 14): {
  fri: string;
  sat: string;
  sun: string;
  mon: string;
} {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  for (let i = minOffset; i < minOffset + 21; i += 1) {
    const candidate = new Date(start);
    candidate.setUTCDate(start.getUTCDate() + i);
    if (candidate.getUTCDay() !== 5) continue;
    const sat = new Date(candidate);
    sat.setUTCDate(candidate.getUTCDate() + 1);
    const sun = new Date(candidate);
    sun.setUTCDate(candidate.getUTCDate() + 2);
    const mon = new Date(candidate);
    mon.setUTCDate(candidate.getUTCDate() + 3);
    return {
      fri: formatYmdUTC(candidate),
      sat: formatYmdUTC(sat),
      sun: formatYmdUTC(sun),
      mon: formatYmdUTC(mon),
    };
  }
  throw new Error('could not find upcoming Friday');
}

export function offDayHasUser(day: TrackerOffDay, userId: string, userName: string): boolean {
  if (day.people?.some((person) => person.id === userId || person.name === userName)) {
    return true;
  }
  return (day.names ?? []).includes(userName);
}
