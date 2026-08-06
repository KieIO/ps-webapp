import { OT_STATUS_LABELS, OT_STATUS_VARIANT } from '../../constants';
import type { OvertimeStatus } from '../../schemas/overtime.schema';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';

interface OvertimeStatusBadgeProps {
  status: OvertimeStatus;
  className?: string;
}

export function OvertimeStatusBadge({ status, className }: OvertimeStatusBadgeProps) {
  return (
    <StatusPill
      label={OT_STATUS_LABELS[status]}
      variant={OT_STATUS_VARIANT[status]}
      className={className}
    />
  );
}
