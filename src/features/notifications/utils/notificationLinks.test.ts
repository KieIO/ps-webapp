import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/config/constants';
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
  it('routes creative handoff to Creative queue', () => {
    expect(
      getNotificationPath(
        base({
          type: 'task_creative_handoff',
          refType: 'task',
          refId: 'task-123',
        }),
      ),
    ).toBe(ROUTES.CREATIVE_REVIEW);
  });

  it('routes creative CM assign to Creative queue (not task detail)', () => {
    expect(
      getNotificationPath(
        base({
          type: 'task_creative_cm',
          refType: 'task',
          refId: 'task-456',
        }),
      ),
    ).toBe(ROUTES.CREATIVE_REVIEW);
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
