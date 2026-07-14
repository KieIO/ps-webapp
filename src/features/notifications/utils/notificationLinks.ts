import { ROUTES, buildMyTaskDetailPath, buildProjectDetailPath } from '@/config/constants';
import type { Notification } from '../schemas/notification.schema';

/** Resolve deep-link path for a notification; null when no navigable ref. */
export const getNotificationPath = (notification: Notification): string | null => {
  const refType = notification.refType?.trim();
  const refId = notification.refId?.trim();

  if (refType === 'task' && refId) {
    return buildMyTaskDetailPath(refId);
  }
  if (refType === 'project' && refId) {
    return buildProjectDetailPath(refId);
  }
  if (refType === 'overtime') {
    return ROUTES.OVERTIME;
  }
  return null;
};
