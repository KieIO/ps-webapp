import { STATUS_LABELS, STATUS_VARIANT } from '../../constants';
import type { ProjectStatus } from '../../schemas/project.schema';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  return (
    <StatusPill
      label={STATUS_LABELS[status]}
      variant={STATUS_VARIANT[status]}
      className={className}
    />
  );
}
