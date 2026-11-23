import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/config/constants';
import { ROLES } from '@/config/permissions';
import { getNotificationPath } from './notificationLinks';
import type { Notification } from '../schemas/notification.schema';

const base = (overrides: Partial<Notification>): Notification => ({
  id: 'n1',
  type: 'system',
  title: 't',
  body: 'b',
  isRead: false,
  createdAt: '2026-05-14T00:00:00.000Z',
  ...overrides,
});

describe('getNotificationPath', () => {
  it('routes creative handoff to Creative queue for CH/CM/Admin', () => {
    expect(
      getNotificationPath(
        base({
          type: 'task_creative_handoff',
          refType: 'task',
          refId: 'task-123',
        }),
        ROLES.CREATIVE_HEAD,
      ),
    ).toBe(ROUTES.CREATIVE_REVIEW);
  });

  it('routes creative CM assign to Creative Queue for CM (not task detail)', () => {
    expect(
      getNotificationPath(
        base({
          type: 'task_creative_cm',
          refType: 'task',
          refId: 'task-456',
        }),
        ROLES.CREATIVE_MANAGER,
      ),
    ).toBe(ROUTES.CREATIVE_REVIEW);
  });

  it('routes creative queue notices to task detail for PM (no Creative Queue access)', () => {
    expect(
      getNotificationPath(
        base({
          type: 'task_creative_handoff',
          refType: 'task',
          refId: 'task-123',
        }),
        ROLES.PM,
      ),
    ).toContain('task-123');
    expect(
      getNotificationPath(
        base({
          type: 'task_creative_cm',
          refType: 'task',
          refId: 'task-456',
        }),
        ROLES.PM,
      ),
    ).toContain('task-456');
  });

  it('routes task_assigned to task detail', () => {
    expect(
      getNotificationPath(
        base({
          type: 'task_assigned',
          refType: 'task',
          refId: 'task-123',
        }),
      ),
    ).toContain('task-123');
  });

  it('routes CH refuse (task_creative_pm) to task detail for PM', () => {
    expect(
      getNotificationPath(
        base({
          type: 'task_creative_pm',
          refType: 'task',
          refId: 'task-789',
        }),
      ),
    ).toContain('task-789');
  });

  it('routes project staff decline (task_declined) to task detail for PM', () => {
    expect(
      getNotificationPath(
        base({
          type: 'task_declined',
          refType: 'task',
          refId: 'task-321',
        }),
      ),
    ).toContain('task-321');
  });

  it('routes evaluation notices to task detail Evaluation tab', () => {
    expect(
      getNotificationPath(
        base({
          type: 'task_evaluation_cm',
          refType: 'task',
          refId: 'task-eval-cm',
        }),
      ),
    ).toBe('/tasks/detail/task-eval-cm?tab=evaluation');
    expect(
      getNotificationPath(
        base({
          type: 'task_evaluation_staff',
          refType: 'task',
          refId: 'task-eval-staff',
        }),
      ),
    ).toBe('/tasks/detail/task-eval-staff?tab=evaluation');
  });

  it('keeps staff assign on task detail even when ref looks like creative task', () => {
    const path = getNotificationPath(
      base({
        type: 'task_assigned',
        refType: 'task',
        refId: 'creative-parent-1',
      }),
    );
    expect(path).not.toBe(ROUTES.CREATIVE_REVIEW);
    expect(path).toContain('creative-parent-1');
  });
});
