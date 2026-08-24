import {
  ROUTES,
  buildMyTaskDetailPath,
  buildOvertimeDetailPath,
  buildProjectDetailPath,
} from '@/config/constants';
import type { Notification } from '../schemas/notification.schema';

/** Resolve deep-link path for a notification; null when no navigable ref. */
export const getNotificationPath = (notification: Notification): string | null => {
  const refType = notification.refType?.trim();
  const refId = notification.refId?.trim();

  // Creative handoff → CH/CM inbox (not personal task detail).
  if (notification.type === 'task_creative_handoff') {
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
