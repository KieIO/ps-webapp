import { test, expect, loginAs, logout, SEED_ACCOUNTS } from '../fixtures/auth';
import {
  TARGET_EMAIL,
  TARGET_NAME,
  TARGET_PASSWORD,
  apiJson,
  apiLogin,
  apiLoginOk,
  cancelAllOpenLeaves,
  createLeave,
  findUserIdByEmail,
  formatApiDate,
  getUserStatus,
  listOpenLeaves,
  offDayHasUser,
  upcomingFriMonSpan,
  type TrackerOffDay,
} from './helpers';

/**
 * Leave-02 — customer leave policy smoke (API + light UI).
 * 1) On leave can still login; Deactivate cannot
 * 2) Ending / clearing covering leave auto-restores Active (no Activate UI)
 * 3) Fri→Mon leave omits Sat/Sun on Tracker offDays
 */
test.describe('Leave-02 login, auto Active, tracker weekends', () => {
  test('on_leave can login; inactive cannot; auto Active; tracker skips weekends', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const admin = SEED_ACCOUNTS.admin;
    const { token: adminToken } = await apiLoginOk(admin.email, admin.password);
    const userId = await findUserIdByEmail(adminToken, TARGET_EMAIL);
    await cancelAllOpenLeaves(adminToken, userId);
    expect(await getUserStatus(adminToken, userId)).toBe('active');

    // --- Cover today → On leave, still login ---
    const covering = await createLeave(
      adminToken,
      userId,
      formatApiDate(0),
      formatApiDate(1),
      `E2E cover today ${Date.now()}`,
    );
    expect(covering.status).toBe('active');
    expect(await getUserStatus(adminToken, userId)).toBe('on_leave');

    const employeeLogin = await apiLogin(TARGET_EMAIL, TARGET_PASSWORD);
    expect(employeeLogin.status).toBeLessThan(400);
    expect(employeeLogin.token).toBeTruthy();
    expect(employeeLogin.user?.status).toBe('on_leave');

    await loginAs(page, 'employee');
    await expect(page).not.toHaveURL(/\/login/);
    await logout(page);

    await loginAs(page, 'admin');
    await page.goto(`/users/${userId}`);
    await expect(page.getByRole('heading', { name: TARGET_NAME })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText('Needs Activate')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Activate employee' })).toHaveCount(0);
    await expect(page.getByText(/ready to return/i)).toHaveCount(0);

    // Cancel covering leave → sync restores Active (no reactivate call).
    await cancelAllOpenLeaves(adminToken, userId);
    expect(await getUserStatus(adminToken, userId)).toBe('active');

    // --- Deactivate blocks login; restore after ---
    type UserDetail = {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      department: string;
      jobTitleId?: string | null;
    };
    const detail = await apiJson<UserDetail>('GET', `/users/${userId}`, adminToken);
    expect(detail.status).toBeLessThan(400);

    // Seed employee may lack a job title; PATCH requires one.
    let jobTitleId = detail.data.jobTitleId ?? null;
    if (!jobTitleId) {
      const titles = await apiJson<{ items: Array<{ id: string }> }>(
        'GET',
        '/job-titles?limit=1',
        adminToken,
      );
      jobTitleId = titles.data?.items?.[0]?.id ?? null;
    }
    expect(jobTitleId).toBeTruthy();

    const patchBody = {
      name: detail.data.name,
      email: detail.data.email,
      role: detail.data.role,
      department: detail.data.department,
      jobTitleId,
    };

    const deactivate = await apiJson('PATCH', `/users/${userId}`, adminToken, {
      ...patchBody,
      status: 'inactive',
    });
    expect(deactivate.status).toBeLessThan(400);

    const blocked = await apiLogin(TARGET_EMAIL, TARGET_PASSWORD);
    expect(blocked.status).toBeGreaterThanOrEqual(400);
    expect(blocked.token).toBeFalsy();

    const restore = await apiJson('PATCH', `/users/${userId}`, adminToken, {
      ...patchBody,
      status: 'active',
    });
    expect(restore.status).toBeLessThan(400);
    expect(await getUserStatus(adminToken, userId)).toBe('active');

    // --- Fri→Mon: Tracker shows Fri + Mon only ---
    const span = upcomingFriMonSpan(14);
    const weekendLeave = await createLeave(
      adminToken,
      userId,
      span.fri,
      span.mon,
      `E2E fri-mon ${Date.now()}`,
    );
    expect(weekendLeave.status).toBe('scheduled');
    expect(await getUserStatus(adminToken, userId)).toBe('active');

    const tracker = await apiJson<{ offDays: TrackerOffDay[] }>('GET', '/tracker', adminToken);
    expect(tracker.status).toBeLessThan(400);
    const offDays = tracker.data?.offDays ?? [];

    const onFri = offDays.find((day) => day.date === span.fri);
    const onSat = offDays.find((day) => day.date === span.sat);
    const onSun = offDays.find((day) => day.date === span.sun);
    const onMon = offDays.find((day) => day.date === span.mon);

    expect(onFri && offDayHasUser(onFri, userId, TARGET_NAME)).toBeTruthy();
    expect(onMon && offDayHasUser(onMon, userId, TARGET_NAME)).toBeTruthy();
    expect(onSat && offDayHasUser(onSat, userId, TARGET_NAME)).toBeFalsy();
    expect(onSun && offDayHasUser(onSun, userId, TARGET_NAME)).toBeFalsy();

    await cancelAllOpenLeaves(adminToken, userId);
    expect(await listOpenLeaves(adminToken, userId)).toHaveLength(0);
    expect(await getUserStatus(adminToken, userId)).toBe('active');
  });
});
