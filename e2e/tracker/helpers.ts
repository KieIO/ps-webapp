import { expect, type Page } from '@playwright/test';
import { SEED_ACCOUNTS } from '../fixtures/auth';
import {
  MILESTONE_PROJECT_NAME as DEFAULT_MILESTONE_NAME,
  SEED_PROJECT_PM as DEFAULT_SEED_PM,
  addMilestoneBar,
  loginWithCredentials,
  openTracker,
} from '../milestones/helpers';

export { addMilestoneBar, loginWithCredentials, openTracker };

const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export interface TrackerE2eFixture {
  projectName: string;
  projectId: string;
  startDate: string;
  endDate: string;
  clientId: string;
  pmEmail: string;
  pmPassword: string;
}

type ProjectRecord = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  department?: string;
  status?: string;
  urgency?: string;
  volume?: number;
  nature?: number;
  time?: number;
  brief?: string;
  additionalFactors?: string;
  evaluation?: string;
  note?: string;
  departmentHead?: { code?: string; name?: string; userId?: string };
  pm?: { code?: string; name?: string; userId?: string };
};

let cachedFixture: TrackerE2eFixture | null = null;

export async function apiLogin(email: string, password: string): Promise<string> {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = (await response.json()) as { data?: { token?: string }; message?: string };
  const token = json.data?.token;
  if (!response.ok || !token) {
    throw new Error(`API login failed (${email}): ${response.status} ${json.message ?? ''}`);
  }
  return token;
}

async function tryLogin(email: string, password: string): Promise<boolean> {
  try {
    await apiLogin(email, password);
    return true;
  } catch {
    return false;
  }
}

export async function adminToken(): Promise<string> {
  return apiLogin(SEED_ACCOUNTS.admin.email, SEED_ACCOUNTS.admin.password);
}

async function listProjects(token: string): Promise<ProjectRecord[]> {
  const response = await fetch(`${apiBase}/projects?archived=false&limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await response.json()) as { data?: { items?: ProjectRecord[] } };
  return json.data?.items ?? [];
}

export async function getProject(token: string, projectId: string): Promise<ProjectRecord> {
  const response = await fetch(`${apiBase}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`GET project failed: ${response.status}`);
  }
  const json = (await response.json()) as { data: ProjectRecord };
  return json.data;
}

/**
 * Prefer env overrides / Sanofi+cuong.le (full seed-dev); fall back to first
 * active project + pm@ when the local DB is a thinner seed.
 */
export async function resolveTrackerFixture(): Promise<TrackerE2eFixture> {
  if (cachedFixture) return cachedFixture;

  const adminTok = await adminToken();
  const items = await listProjects(adminTok);
  if (items.length === 0) {
    throw new Error('No active projects in seed DB for tracker e2e');
  }

  const preferredName = process.env.E2E_MILESTONE_PROJECT_NAME ?? DEFAULT_MILESTONE_NAME;
  const project =
    items.find((item) => item.name === preferredName) ??
    items.find((item) => /sanofi/i.test(item.name)) ??
    items[0];

  const preferredPmEmail = process.env.E2E_SEED_PROJECT_PM_EMAIL ?? DEFAULT_SEED_PM.email;
  const preferredPmPassword = process.env.E2E_PASSWORD ?? DEFAULT_SEED_PM.password;

  let pmEmail = preferredPmEmail;
  let pmPassword = preferredPmPassword;
  if (!(await tryLogin(pmEmail, pmPassword))) {
    pmEmail = SEED_ACCOUNTS.pm.email;
    pmPassword = SEED_ACCOUNTS.pm.password;
    if (!(await tryLogin(pmEmail, pmPassword))) {
      throw new Error(
        `No usable seed PM login (tried ${preferredPmEmail} and ${SEED_ACCOUNTS.pm.email})`,
      );
    }
  }

  const full = await getProject(adminTok, project.id);

  cachedFixture = {
    projectName: full.name,
    projectId: full.id,
    startDate: (full.startDate ?? '').slice(0, 10),
    endDate: (full.endDate ?? '').slice(0, 10),
    clientId: full.clientId ?? '',
    pmEmail,
    pmPassword,
  };
  return cachedFixture;
}

export async function loginSeedProjectPm(page: Page): Promise<void> {
  const fixture = await resolveTrackerFixture();
  await loginWithCredentials(page, fixture.pmEmail, fixture.pmPassword);
}

export async function openTrackerProject(page: Page): Promise<TrackerE2eFixture> {
  const fixture = await resolveTrackerFixture();
  await page.goto('/');
  // ProjectNameLink is Ant Button type="link" → role=button, not link.
  await expect(
    page.getByRole('button', { name: fixture.projectName, exact: true }).first(),
  ).toBeVisible({ timeout: 30_000 });
  return fixture;
}

/** Urgency edit control on Tracker left column (PM/Head/Admin). */
export function urgencyDotForProject(page: Page, _projectName?: string) {
  return page.getByRole('button', { name: /Đổi mức ưu tiên/ }).first();
}

export async function findProjectByName(
  token: string,
  name: string,
): Promise<{ id: string; name: string; startDate: string; endDate: string; clientId: string }> {
  const items = await listProjects(token);
  const match = items.find((item) => item.name === name) ?? items[0];
  if (!match?.id) {
    throw new Error(`Project not found: ${name}`);
  }
  const full = await getProject(token, match.id);
  return {
    id: full.id,
    name: full.name,
    startDate: full.startDate ?? '',
    endDate: full.endDate ?? '',
    clientId: full.clientId ?? '',
  };
}

/** PATCH dates while preserving required save fields (clientId, people, criteria). */
export async function patchProjectDates(
  token: string,
  projectId: string,
  body: { startDate: string; endDate: string; name?: string },
): Promise<Response> {
  const current = await getProject(token, projectId);
  const payload = {
    clientId: current.clientId,
    name: body.name ?? current.name,
    startDate: body.startDate,
    endDate: body.endDate,
    department: current.department ?? 'project',
    departmentHead: current.departmentHead ?? {},
    brief: current.brief ?? '',
    volume: current.volume ?? 2,
    nature: current.nature ?? 2,
    time: current.time ?? 2,
    additionalFactors: current.additionalFactors ?? '',
    pm: current.pm ?? {},
    evaluation: current.evaluation ?? '',
    note: current.note ?? '',
    status: current.status ?? 'in_progress',
    urgency: current.urgency ?? 'auto',
  };
  return fetch(`${apiBase}/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function patchProjectUrgency(
  token: string,
  projectId: string,
  urgency: string,
): Promise<Response> {
  return fetch(`${apiBase}/projects/${projectId}/urgency`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urgency }),
  });
}

export async function fetchTrackerProjects(
  token: string,
): Promise<
  Array<{ id: string; name: string; blocks: Array<{ start: string; end: string; type: string }> }>
> {
  const response = await fetch(`${apiBase}/tracker`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`GET /tracker failed: ${response.status}`);
  }
  const json = (await response.json()) as {
    data?: {
      projects?: Array<{
        id: string;
        name: string;
        blocks: Array<{ start: string; end: string; type: string }>;
      }>;
    };
  };
  return json.data?.projects ?? [];
}

/** DD/MM/YYYY for Ant DatePicker (DATE_FORMAT). */
export function formatUiDate(isoYmd: string): string {
  const [y, m, d] = isoYmd.split('-');
  return `${d}/${m}/${y}`;
}

export async function openEditProjectModal(page: Page, projectName: string): Promise<void> {
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: 'Dự án' })).toBeVisible({ timeout: 30_000 });
  // Wait for list data before filtering — empty search races leave Tổng: 0.
  const editBtn = page.getByRole('button', { name: `Edit ${projectName}` });
  await expect(editBtn).toBeVisible({ timeout: 30_000 });
  await editBtn.click();
  await expect(page.getByRole('dialog').getByText(/Edit project/)).toBeVisible();
}

export async function fillEndDateAndSave(
  page: Page,
  endDateYmd: string,
): Promise<{ requestBody: unknown }> {
  const dialog = page.getByRole('dialog');
  const endInput = dialog
    .locator('.ant-form-item')
    .filter({ hasText: /^End date/ })
    .getByRole('textbox');
  await endInput.click();
  await endInput.fill('');
  await endInput.fill(formatUiDate(endDateYmd));
  await endInput.press('Enter');

  const waitPatch = page.waitForRequest(
    (req) =>
      req.method() === 'PATCH' &&
      /\/projects\/[^/]+$/.test(req.url()) &&
      !req.url().includes('/urgency'),
  );
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  const request = await waitPatch;
  const requestBody = request.postDataJSON();
  await expect(page.getByText('Project updated successfully')).toBeVisible({ timeout: 15_000 });
  return { requestBody };
}

export async function clearMilestonesForFixture(): Promise<void> {
  const fixture = await resolveTrackerFixture();
  const token = await adminToken();
  const response = await fetch(`${apiBase}/projects/${fixture.projectId}/milestones`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ milestones: [] }),
  });
  if (!response.ok) {
    throw new Error(`clear milestones failed: ${response.status} ${await response.text()}`);
  }
}
