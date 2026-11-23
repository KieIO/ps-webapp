import {
  ROUTES,
  buildMyTaskDetailPath,
  buildOvertimeDetailPath,
  buildProjectDetailPath,
} from '@/config/constants';
import { ROLES, type Role } from '@/config/permissions';
import type { Notification } from '../schemas/notification.schema';

/** Creative pipeline inbox actions (CH assign CM / CM assign Staff) — not My Task detail. */
const CREATIVE_QUEUE_NOTIFICATION_TYPES = new Set(['task_creative_handoff', 'task_creative_cm']);

/** Roles that may open Creative Queue UI (sidebar + route). PM is excluded. */
const CREATIVE_QUEUE_ROLES = new Set<Role>([
  ROLES.CREATIVE_HEAD,
  ROLES.CREATIVE_MANAGER,
  ROLES.ADMIN,
]);

/** Evaluation notices open task detail on the Evaluation tab. */
const EVALUATION_NOTIFICATION_TYPES = new Set(['task_evaluation_cm', 'task_evaluation_staff']);

/** Resolve deep-link path for a notification; null when no navigable ref. */
export const getNotificationPath = (
  notification: Notification,
  role?: Role | null,
): string | null => {
  const refType = notification.refType?.trim();
  const refId = notification.refId?.trim();

  if (CREATIVE_QUEUE_NOTIFICATION_TYPES.has(notification.type)) {
    const canOpenQueue = role != null && CREATIVE_QUEUE_ROLES.has(role);
    if (canOpenQueue) return ROUTES.CREATIVE_REVIEW;
    if (refType === 'task' && refId) return buildMyTaskDetailPath(refId);
    return ROUTES.PROJECT_TASKS;
  }

  if (refType === 'task' && refId) {
    if (EVALUATION_NOTIFICATION_TYPES.has(notification.type)) {
      return buildMyTaskDetailPath(refId, { tab: 'evaluation' });
    }
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
