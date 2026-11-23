import { Modal } from 'antd';
import { ROLES, type Role } from '@/config/permissions';
import { TASK_STATUS_OPTIONS } from '../constants';
import type { MyTask, TaskConfirmationStatus } from '../schemas/task.schema';

export const CANCELLED_TASK_STATUS: TaskConfirmationStatus = 'cancelled';

export const isCancelledTaskStatus = (status: TaskConfirmationStatus): boolean =>
  status === CANCELLED_TASK_STATUS;

export const isCancelledTask = (task: Pick<MyTask, 'staffConfirmation'>): boolean =>
  isCancelledTaskStatus(task.staffConfirmation);

/** Finished / cancelled tasks cannot have meta (deadline, level, …) edited. */
export const isTaskMetaEditLockedByStatus = (status: TaskConfirmationStatus | undefined): boolean =>
  status === 'finished' || status === 'cancelled';

/** Banner when opening Edit on a finished/cancelled task (read-only). */
export const TASK_META_EDIT_STATUS_LOCKED_MESSAGE = (status: TaskConfirmationStatus): string =>
  status === 'cancelled'
    ? 'Task đã Hủy — không thể chỉnh sửa.'
    : 'Task đã Hoàn thành — không thể chỉnh sửa.';

/** Employees cannot set a task to cancelled; PM+ (and Head/Admin) can. */
export const canCancelTask = (role: Role | undefined): boolean =>
  role != null && role !== ROLES.EMPLOYEE;

/**
 * Who may open the Edit UI (including read-only on finished/cancelled).
 * Write access still goes through canEditTaskMeta.
 */
export const canOpenTaskMetaEdit = (
  task: Pick<MyTask, 'staffConfirmation' | 'createdById'> | null | undefined,
  role: Role | undefined,
  userId: string | undefined,
): boolean => {
  if (!role || !task) return false;
  if (role === ROLES.ADMIN || role === ROLES.HEAD || role === ROLES.PM) return true;
  if (userId && task.createdById && userId === task.createdById) return true;
  return false;
};

/**
 * Meta edit (deadline, brief, …): Admin (incl. finished/cancelled), Head, PM, or creator.
 * Deadline Creative is narrower (Admin / Head / creator) — see canEditCreativeDeadlineMeta.
 * Non-admin roles stay locked on finished/cancelled. CH/CM use pipeline drawers.
 */
export const canEditTaskMeta = (
  task: Pick<MyTask, 'staffConfirmation' | 'createdById'> | null | undefined,
  role: Role | undefined,
  userId: string | undefined,
): boolean => {
  if (!canOpenTaskMetaEdit(task, role, userId)) return false;
  if (role === ROLES.ADMIN) return true;
  if (!task || isTaskMetaEditLockedByStatus(task.staffConfirmation)) return false;
  return true;
};

/** @deprecated Prefer canEditTaskMeta(task, role, userId). Role-only check kept for delete gating. */
export const canEditTask = (role: Role | undefined): boolean =>
  role != null && role !== ROLES.EMPLOYEE && role !== ROLES.CREATIVE_MANAGER;

/** Employees cannot delete tasks; PM+ (and Head/Admin) can. CM uses pipeline flows only. */
export const canDeleteTask = (role: Role | undefined): boolean =>
  role != null && role !== ROLES.EMPLOYEE && role !== ROLES.CREATIVE_MANAGER;

/** True when the task has at least one linked assignee account. */
export const taskHasAssignedStaff = (task: Pick<MyTask, 'staff'>): boolean =>
  task.staff.some((member) => Boolean(member.userId));

/** Current user is on the task's staff assignee list. */
export const isTaskAssignee = (task: Pick<MyTask, 'staff'>, userId: string | undefined): boolean =>
  Boolean(userId && task.staff.some((member) => member.userId === userId));

/**
 * Who may change staffConfirmation (task status):
 * - Cancelled → Admin only (unchanged)
 * - No assignee yet → anyone who can open the status UI (unchanged)
 * - Has assignee → only that assigned staff (or Admin break-glass)
 * PM / Head / others are view-only once staff is assigned.
 */
export const canChangeTaskStatus = (
  task: Pick<MyTask, 'staffConfirmation' | 'staff'>,
  role: Role | undefined,
  userId?: string,
): boolean => {
  if (!role) return false;
  if (isCancelledTask(task)) return role === ROLES.ADMIN;
  if (!taskHasAssignedStaff(task)) return true;
  if (role === ROLES.ADMIN) return true;
  return isTaskAssignee(task, userId);
};

export const isTransitioningToCancelled = (
  current: TaskConfirmationStatus,
  next: TaskConfirmationStatus,
): boolean => isCancelledTaskStatus(next) && !isCancelledTaskStatus(current);

/**
 * @deprecated Prefer `TASK_SUMMARY_BUCKET_OPTIONS` — status UI uses summary buckets.
 * Kept for any raw API-status tooling.
 */
export const getTaskStatusOptionsForRole = (
  role: Role | undefined,
  currentStatus?: TaskConfirmationStatus,
) =>
  TASK_STATUS_OPTIONS.filter((option) => {
    if (option.value !== CANCELLED_TASK_STATUS) return true;
    if (currentStatus === CANCELLED_TASK_STATUS) return true;
    return canCancelTask(role);
  });

export const TASK_STATUS_LOCKED_MESSAGE =
  'This task is cancelled. Only an admin can change its status.';

export const TASK_STATUS_ASSIGNEE_ONLY_MESSAGE =
  'Chỉ Staff được giao task mới cập nhật được trạng thái. PM chỉ xem.';

/** Confirm copy — destructive-status pattern: consequence first, clear primary CTA. */
export const TASK_CANCEL_CONFIRM = {
  title: 'Hủy task này?',
  content:
    'Task vẫn hiện trong danh sách, nhưng trạng thái sẽ bị khóa. Chỉ Admin mới mở lại được sau này.',
  okText: 'Hủy task',
  cancelText: 'Quay lại',
} as const;

/** Returns true when the user confirms cancel. */
export const confirmCancelTask = (): Promise<boolean> =>
  new Promise((resolve) => {
    Modal.confirm({
      title: TASK_CANCEL_CONFIRM.title,
      content: TASK_CANCEL_CONFIRM.content,
      okText: TASK_CANCEL_CONFIRM.okText,
      okButtonProps: { danger: true },
      cancelText: TASK_CANCEL_CONFIRM.cancelText,
      centered: true,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
