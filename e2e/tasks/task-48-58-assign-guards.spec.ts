import { test, expect, loginAs } from '../fixtures/auth';
import {
  apiFetch,
  apiLogin,
  setupAwaitingCh,
  setupAwaitingCm,
  SEED_ACCOUNTS,
} from './helpers/splitFamilyApi';

/**
 * TASK-38 / 48 / 49 / 52 / 58 — Assign guards (API + light UI chrome).
 */

test.describe('TASK-38/48/49/52/58 assign guards', () => {
  test('TASK-48 Staff/CM cannot assign-cm; employee has no Giao CM', async ({ page }) => {
    const taskName = `E2E Guard CM ${Date.now()}`;
    const { parent, cm } = await setupAwaitingCh(taskName);
    const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);

    expect(
      (
        await apiFetch('PATCH', `/tasks/my/${parent.id}/assign-cm`, employee.token, {
          cmUserId: cm.user.id,
          description: 'nope',
        })
      ).status,
    ).toBe(403);

    expect(
      (
        await apiFetch('PATCH', `/tasks/my/${parent.id}/assign-cm`, cm.token, {
          cmUserId: cm.user.id,
          description: 'nope',
        })
      ).status,
    ).toBe(403);

    const pm = await apiLogin(SEED_ACCOUNTS.pm.email, SEED_ACCOUNTS.pm.password);
    expect(
      (
        await apiFetch('PATCH', `/tasks/my/${parent.id}/assign-cm`, pm.token, {
          cmUserId: cm.user.id,
          description: 'nope',
        })
      ).status,
    ).toBe(403);

    await loginAs(page, 'employee');
    await page.goto('/creative/review');
    // Queue CTA is "Giao CM"; drawer title would be "Giao cho CM" — Staff must see neither.
    await expect(page.getByRole('button', { name: /Giao CM|Giao cho CM/ })).toHaveCount(0);
  });

  test('TASK-49 assign-cm rejects non-CM target and non-awaiting_ch task', async () => {
    const { parent, ch, cm, admin } = await setupAwaitingCh(`E2E Val CM ${Date.now()}`);
    const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);

    const nonCm = await apiFetch('PATCH', `/tasks/my/${parent.id}/assign-cm`, ch.token, {
      cmUserId: employee.user.id,
      description: 'bad',
    });
    expect(nonCm.status).toBe(422);

    const created = await apiFetch('POST', '/tasks/my', admin.token, {
      projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
      projectManager: { code: 'PM.DEV', name: 'Dev PM' },
      taskName: `E2E Proj ${Date.now()}`,
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
      description: 'project',
      designThinking: 2,
      technical: 2,
      contentProcessing: 2,
      additionalFactors: '',
      staff: [{ userId: employee.user.id, code: 'EMPLOYEE', name: 'Dev Employee' }],
      taskCategory: 'project',
      department: 'project',
      staffConfirmation: 'not_updated',
      staffNote: '',
      urgency: 'auto',
    });
    expect(created.status).toBe(201);
    const projectId = (created.data as { id: string }).id;

    const wrongStage = await apiFetch('PATCH', `/tasks/my/${projectId}/assign-cm`, ch.token, {
      cmUserId: cm.user.id,
      description: 'bad stage',
    });
    expect(wrongStage.status).toBe(422);
  });

  test('TASK-52 employee cannot assign-staff; owning CM can', async ({ page }) => {
    const taskName = `E2E Guard Staff ${Date.now()}`;
    const { parent, cm } = await setupAwaitingCm(taskName);
    const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);

    expect(
      (
        await apiFetch('PATCH', `/tasks/my/${parent.id}/assign-staff`, employee.token, {
          mode: 'whole',
          staffUserId: employee.user.id,
          quantity: 2,
        })
      ).status,
    ).toBe(403);

    expect(
      (
        await apiFetch('PATCH', `/tasks/my/${parent.id}/assign-staff`, cm.token, {
          mode: 'whole',
          staffUserId: employee.user.id,
          quantity: 2,
        })
      ).status,
    ).toBe(200);

    await loginAs(page, 'employee');
    await page.goto(`/tasks/detail/${parent.id}`);
    await expect(page.getByRole('button', { name: /Giao cho Staff/ })).toHaveCount(0);
  });

  test('TASK-58 assign-staff validation rejects empty staff / zero qty / over SL', async () => {
    const { parent, cm } = await setupAwaitingCm(`E2E Val Staff ${Date.now()}`);
    const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);
    const bad = await apiFetch('PATCH', `/tasks/my/${parent.id}/assign-staff`, cm.token, {
      mode: 'whole',
      staffUserId: '',
      quantity: 0,
    });
    expect(bad.status).toBe(422);

    const over = await apiFetch('PATCH', `/tasks/my/${parent.id}/assign-staff`, cm.token, {
      mode: 'whole',
      staffUserId: employee.user.id,
      quantity: parent.quantity + 1,
    });
    expect(over.status).toBe(422);
  });

  test('TASK-38 create with on_leave assignee returns ASSIGNEE_ON_LEAVE', async () => {
    const admin = await apiLogin(SEED_ACCOUNTS.admin.email, SEED_ACCOUNTS.admin.password);
    const employee = await apiLogin(SEED_ACCOUNTS.employee.email, SEED_ACCOUNTS.employee.password);

    const leavePatch = await apiFetch('PATCH', `/users/${employee.user.id}`, admin.token, {
      status: 'on_leave',
    });
    test.skip(leavePatch.status >= 400, 'users status PATCH unavailable');

    try {
      const create = await apiFetch('POST', '/tasks/my', admin.token, {
        projectName: process.env.E2E_PROJECT_NAME ?? 'SG Multibrand SEP',
        projectManager: { code: 'PM.DEV', name: 'Dev PM' },
        taskName: `E2E OnLeave ${Date.now()}`,
        quantity: 1,
        date: new Date().toISOString().slice(0, 10),
        description: 'leave',
        designThinking: 2,
        technical: 2,
        contentProcessing: 2,
        additionalFactors: '',
        staff: [{ userId: employee.user.id, code: 'EMPLOYEE', name: 'Dev Employee' }],
        taskCategory: 'project',
        department: 'project',
        staffConfirmation: 'not_updated',
        staffNote: '',
        urgency: 'auto',
      });
      expect(create.status).toBe(422);
      expect(create.code).toBe('ASSIGNEE_ON_LEAVE');
    } finally {
      await apiFetch('PATCH', `/users/${employee.user.id}`, admin.token, { status: 'active' });
    }
  });
});
