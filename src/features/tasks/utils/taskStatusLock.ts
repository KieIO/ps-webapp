import { Modal } from 'antd';
import { ROLES, type Role } from '@/config/permissions';
import { TASK_STATUS_OPTIONS } from '../constants';
import type { MyTask, TaskConfirmationStatus } from '../schemas/task.schema';

export const CANCELLED_TASK_STATUS: TaskConfirmationStatus = 'cancelled';

export const isCancelledTaskStatus = (status: TaskConfirmationStatus): boolean =>
  status === CANCELLED_TASK_STATUS;

export const isCancelledTask = (task: Pick<MyTask, 'staffConfirmation'>): boolean =>
  isCancelledTaskStatus(task.staffConfirmation);

/** Employees cannot set a task to cancelled; PM+ (and Head/Admin) can. */
export const canCancelTask = (role: Role | undefined): boolean =>
  role != null && role !== ROLES.EMPLOYEE;

/**
 * Cancelled tasks remain visible, but only admins may leave the cancelled status.
 */
export const canChangeTaskStatus = (
  task: Pick<MyTask, 'staffConfirmation'>,
  role: Role | undefined,
): boolean => !isCancelledTask(task) || role === ROLES.ADMIN;

export const isTransitioningToCancelled = (
  current: TaskConfirmationStatus,
  next: TaskConfirmationStatus,
): boolean => isCancelledTaskStatus(next) && !isCancelledTaskStatus(current);

/**
 * Status picker options — hide "Hủy" for employees unless the task is already cancelled
 * (so the locked current value still renders correctly).
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
