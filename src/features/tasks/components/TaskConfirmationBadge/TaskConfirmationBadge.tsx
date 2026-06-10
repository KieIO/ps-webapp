import { CONFIRMATION_LABELS, CONFIRMATION_VARIANT } from '../../constants';
import type { TaskConfirmationStatus } from '../../schemas/task.schema';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';

interface TaskConfirmationBadgeProps {
  status: TaskConfirmationStatus;
  className?: string;
}

export function TaskConfirmationBadge({ status, className }: TaskConfirmationBadgeProps) {
  return (
    <StatusPill
      label={CONFIRMATION_LABELS[status]}
      variant={CONFIRMATION_VARIANT[status]}
      className={className}
    />
  );
}
