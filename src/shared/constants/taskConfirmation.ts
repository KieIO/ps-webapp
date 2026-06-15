import type { StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';

export const TASK_CONFIRMATION_STATUSES = [
  'not_updated',
  'finished',
  'confirmed',
  'decline',
] as const;

export type TaskConfirmationStatus = (typeof TASK_CONFIRMATION_STATUSES)[number];

/** Single source of truth — used on /tasks/project and Project Tracker timeline legend. */
export const CONFIRMATION_LABELS: Record<TaskConfirmationStatus, string> = {
  not_updated: 'Chưa cập nhật',
  finished: 'Hoàn thành',
  confirmed: 'Đã xác nhận',
  decline: 'Từ chối',
};

export const CONFIRMATION_VARIANT: Record<TaskConfirmationStatus, StatusPillVariant> = {
  not_updated: 'pending',
  finished: 'completed',
  confirmed: 'in-progress',
  decline: 'overdue',
};

export const TRACKER_BLOCK_TYPES = [
  'pending',
  'active',
  'completed',
  'decline',
] as const;

export type TrackerBlockType = (typeof TRACKER_BLOCK_TYPES)[number];

/** Maps tracker timeline block type → task staffConfirmation semantics. */
export const TRACKER_BLOCK_CONFIRMATION: Record<
  TrackerBlockType,
  TaskConfirmationStatus
> = {
  pending: 'not_updated',
  active: 'confirmed',
  completed: 'finished',
  decline: 'decline',
};

export const TRACKER_BLOCK_LABELS: Record<TrackerBlockType, string> = {
  pending: CONFIRMATION_LABELS.not_updated,
  active: CONFIRMATION_LABELS.confirmed,
  completed: CONFIRMATION_LABELS.finished,
  decline: CONFIRMATION_LABELS.decline,
};

export const TRACKER_BLOCK_LEGEND = TRACKER_BLOCK_TYPES.map((key) => ({
  key,
  label: TRACKER_BLOCK_LABELS[key],
}));
