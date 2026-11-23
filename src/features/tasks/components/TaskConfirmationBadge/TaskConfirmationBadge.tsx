import type { TaskConfirmationStatus } from '../../schemas/task.schema';
import {
  resolveTaskSummaryBucket,
  TASK_SUMMARY_BUCKET_LABELS,
  TASK_SUMMARY_BUCKET_VARIANT,
} from '../../utils/taskConfirmationSummary';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';

interface TaskConfirmationBadgeProps {
  status: TaskConfirmationStatus;
  /** Needed to split finished → Cần đánh giá vs Hoàn thành. */
  completionPercent?: number | null;
  pmEvaluation?: string | null;
  className?: string;
}

export function TaskConfirmationBadge({
  status,
  completionPercent,
  pmEvaluation,
  className,
}: TaskConfirmationBadgeProps) {
  const bucket = resolveTaskSummaryBucket({
    staffConfirmation: status,
    completionPercent,
    pmEvaluation,
  });

  return (
    <StatusPill
      label={TASK_SUMMARY_BUCKET_LABELS[bucket]}
      variant={TASK_SUMMARY_BUCKET_VARIANT[bucket]}
      className={className}
    />
  );
}
