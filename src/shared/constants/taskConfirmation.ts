import type { StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';

export const TASK_CONFIRMATION_STATUSES = [
  'not_updated',
  'finished',
  'confirmed',
  'decline',
  'cancelled',
] as const;

export type TaskConfirmationStatus = (typeof TASK_CONFIRMATION_STATUSES)[number];

/** Single source of truth — used on /tasks/project and Project Tracker timeline legend. */
export const CONFIRMATION_LABELS: Record<TaskConfirmationStatus, string> = {
  not_updated: 'Chưa cập nhật',
  finished: 'Hoàn thành',
  confirmed: 'Đã xác nhận',
  decline: 'Từ chối',
  cancelled: 'Hủy',
};

export const CONFIRMATION_VARIANT: Record<TaskConfirmationStatus, StatusPillVariant> = {
  not_updated: 'pending',
  finished: 'completed',
  confirmed: 'in-progress',
  decline: 'overdue',
  cancelled: 'cancelled',
};

export const TRACKER_BLOCK_TYPES = [
  'pending',
  'active',
  'completed',
  'decline',
  'cancelled',
] as const;

export type TrackerBlockType = (typeof TRACKER_BLOCK_TYPES)[number];

/** Task confirmation colors on the tracker (excludes project-only `cancelled`). */
export const TRACKER_TASK_BLOCK_TYPES = [
  'pending',
  'active',
  'completed',
  'decline',
] as const satisfies ReadonlyArray<TrackerBlockType>;

/** Maps tracker timeline block type → task staffConfirmation semantics. */
export const TRACKER_BLOCK_CONFIRMATION: Record<
  (typeof TRACKER_TASK_BLOCK_TYPES)[number],
  TaskConfirmationStatus
> = {
  pending: 'not_updated',
  active: 'confirmed',
  completed: 'finished',
  decline: 'decline',
};

export const TRACKER_BLOCK_LABELS: Record<(typeof TRACKER_TASK_BLOCK_TYPES)[number], string> = {
  pending: CONFIRMATION_LABELS.not_updated,
  active: CONFIRMATION_LABELS.confirmed,
  completed: CONFIRMATION_LABELS.finished,
  decline: CONFIRMATION_LABELS.decline,
};

/** Project span bar colors — aligned with project.status via BE projectBlockType. */
export const TRACKER_PROJECT_STATUS_LEGEND: ReadonlyArray<{
  key: TrackerBlockType;
  label: string;
}> = [
  { key: 'pending', label: 'Chưa cập nhật' },
  { key: 'active', label: 'Đang làm' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Hủy' },
];

export const TRACKER_BLOCK_LEGEND = TRACKER_TASK_BLOCK_TYPES.map((key) => ({
  key,
  label: TRACKER_BLOCK_LABELS[key],
}));
