import type { Role } from '@/config/permissions';
import { ROLES } from '@/config/permissions';
import { CONFIRMATION_LABELS } from '@/shared/constants/taskConfirmation';
import type { StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';
import type { MyTask, TaskConfirmationStatus } from '../schemas/task.schema';
import { hasCmEvaluation } from './evaluationRemainder';

/**
 * Display / filter buckets (list summary, badge, status filters).
 * «Từ chối» and «Hủy» are separate — picker write path only exposes Hủy.
 */
export type TaskSummaryBucket =
  | 'inProgress'
  | 'needsEvaluation'
  | 'declined'
  | 'cancelled'
  | 'completed';

export interface TaskConfirmationSummary {
  total: number;
  inProgress: number;
  needsEvaluation: number;
  declined: number;
  cancelled: number;
  completed: number;
}

/** Order: Đang làm → Cần đánh giá → Đã từ chối → Hủy → Hoàn thành. */
export const TASK_SUMMARY_BUCKET_ORDER: readonly TaskSummaryBucket[] = [
  'inProgress',
  'needsEvaluation',
  'declined',
  'cancelled',
  'completed',
] as const;

export const TASK_SUMMARY_BUCKET_LABELS: Record<TaskSummaryBucket, string> = {
  inProgress: 'Đang làm',
  needsEvaluation: 'Cần đánh giá',
  declined: CONFIRMATION_LABELS.decline,
  cancelled: CONFIRMATION_LABELS.cancelled,
  completed: 'Hoàn thành',
};

export const TASK_SUMMARY_BUCKET_VARIANT: Record<TaskSummaryBucket, StatusPillVariant> = {
  inProgress: 'in-progress',
  needsEvaluation: 'pending',
  declined: 'overdue',
  cancelled: 'cancelled',
  completed: 'completed',
};

export const TASK_SUMMARY_BUCKET_OPTIONS = TASK_SUMMARY_BUCKET_ORDER.map((value) => ({
  value,
  label: TASK_SUMMARY_BUCKET_LABELS[value],
}));

/**
 * Status picker (Update status / Edit / detail chips) — no «Cần đánh giá», no «Đã từ chối».
 * Hủy → `cancelled`. Từ chối chỉ qua CTA → `decline`.
 */
export const TASK_STATUS_PICKER_BUCKET_ORDER = [
  'inProgress',
  'cancelled',
  'completed',
] as const satisfies readonly TaskSummaryBucket[];

export type TaskStatusPickerBucket = (typeof TASK_STATUS_PICKER_BUCKET_ORDER)[number];

export const TASK_STATUS_PICKER_LABELS: Record<TaskStatusPickerBucket, string> = {
  inProgress: TASK_SUMMARY_BUCKET_LABELS.inProgress,
  cancelled: TASK_SUMMARY_BUCKET_LABELS.cancelled,
  completed: TASK_SUMMARY_BUCKET_LABELS.completed,
};

export const TASK_STATUS_PICKER_OPTIONS = TASK_STATUS_PICKER_BUCKET_ORDER.map((value) => ({
  value,
  label: TASK_STATUS_PICKER_LABELS[value],
}));

/** Hide «Hủy» for Staff (họ từ chối qua CTA); vẫn hiện nếu task đã cancelled. */
export const getTaskStatusPickerOptions = (
  role: Role | undefined,
  current?: Pick<MyTask, 'staffConfirmation'>,
) =>
  TASK_STATUS_PICKER_OPTIONS.filter((option) => {
    if (option.value !== 'cancelled') return true;
    if (current?.staffConfirmation === 'cancelled') return true;
    return role != null && role !== ROLES.EMPLOYEE;
  });

const EMPTY_SUMMARY: TaskConfirmationSummary = {
  total: 0,
  inProgress: 0,
  needsEvaluation: 0,
  declined: 0,
  cancelled: 0,
  completed: 0,
};

/** Status + optional evaluate fields (tests / partial rows may omit scores). */
export type TaskSummaryInput = Pick<MyTask, 'staffConfirmation'> &
  Partial<Pick<MyTask, 'completionPercent' | 'pmEvaluation'>>;

export const resolveTaskSummaryBucket = (task: TaskSummaryInput): TaskSummaryBucket => {
  switch (task.staffConfirmation) {
    case 'not_updated':
    case 'confirmed':
      return 'inProgress';
    case 'decline':
      return 'declined';
    case 'cancelled':
      return 'cancelled';
    case 'finished':
      return hasCmEvaluation(task) ? 'completed' : 'needsEvaluation';
    default:
      return 'inProgress';
  }
};

/**
 * Map current task → picker selection.
 * - needsEvaluation → Hoàn thành (picker không có Cần đánh giá)
 * - declined → Đang làm (từ chối không phải option Hủy)
 * - cancelled → Hủy
 */
export const resolveTaskStatusPickerBucket = (task: TaskSummaryInput): TaskSummaryBucket => {
  if (task.staffConfirmation === 'decline') return 'inProgress';
  if (task.staffConfirmation === 'cancelled') return 'cancelled';
  const bucket = resolveTaskSummaryBucket(task);
  return bucket === 'needsEvaluation' ? 'completed' : bucket;
};

export const computeTaskConfirmationSummary = (
  tasks: TaskSummaryInput[],
): TaskConfirmationSummary => {
  if (tasks.length === 0) return EMPTY_SUMMARY;

  const summary: TaskConfirmationSummary = { ...EMPTY_SUMMARY, total: tasks.length };

  for (const task of tasks) {
    summary[resolveTaskSummaryBucket(task)] += 1;
  }

  return summary;
};

export type BucketToStatusResult =
  | { ok: true; status: TaskConfirmationStatus }
  | { ok: false; error: string };

/**
 * Map picker/summary bucket → API `staffConfirmation` on save.
 * «Hủy» → `cancelled`. «Đã từ chối» không ghi từ picker (CTA riêng).
 */
export const bucketToStaffConfirmation = (
  bucket: TaskSummaryBucket,
  _role?: Role,
  _current?: TaskSummaryInput,
): BucketToStatusResult => {
  void _role;
  void _current;
  switch (bucket) {
    case 'inProgress':
      return { ok: true, status: 'confirmed' };
    case 'needsEvaluation':
    case 'completed':
      return { ok: true, status: 'finished' };
    case 'cancelled':
      return { ok: true, status: 'cancelled' };
    case 'declined':
      return {
        ok: false,
        error: 'Từ chối task qua CTA Từ chối, không chọn trong form trạng thái.',
      };
    default:
      return { ok: true, status: 'confirmed' };
  }
};
