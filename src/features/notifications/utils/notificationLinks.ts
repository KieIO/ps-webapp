import {
  ROUTES,
  buildMyTaskDetailPath,
  buildOvertimeDetailPath,
  buildProjectDetailPath,
} from '@/config/constants';
import type { Notification } from '../schemas/notification.schema';

/** Creative pipeline inbox actions (CH assign CM / CM assign Staff) — not My Task detail. */
const CREATIVE_QUEUE_NOTIFICATION_TYPES = new Set(['task_creative_handoff', 'task_creative_cm']);

/** Resolve deep-link path for a notification; null when no navigable ref. */
export const getNotificationPath = (notification: Notification): string | null => {
  const refType = notification.refType?.trim();
  const refId = notification.refId?.trim();

  if (CREATIVE_QUEUE_NOTIFICATION_TYPES.has(notification.type)) {
    return ROUTES.CREATIVE_REVIEW;
  }

  if (refType === 'task' && refId) {
    return buildMyTaskDetailPath(refId);
  }
  if (refType === 'project' && refId) {
    return buildProjectDetailPath(refId);
  }
  if (refType === 'overtime') {
    return refId ? buildOvertimeDetailPath(refId) : ROUTES.OVERTIME;
  }
  return null;
};
