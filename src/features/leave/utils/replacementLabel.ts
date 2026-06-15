import { JOB_LEVEL_LABELS, type JobLevel } from '@/features/capacity/constants';
import { DEPARTMENT_LABELS, type UserDepartment } from '@/features/users/constants';
import type { LeaveReplacementCandidate } from '../schemas/leave.schema';

export function formatReplacementLabel(candidate: LeaveReplacementCandidate): string {
  const level = JOB_LEVEL_LABELS[candidate.jobLevel as JobLevel] ?? candidate.jobLevel;
  const dept = DEPARTMENT_LABELS[candidate.department as UserDepartment] ?? candidate.department;
  const capacity =
    candidate.capacityPercent !== null ? `${candidate.capacityPercent}%` : '—';
  return `${candidate.name} · ${dept} · ${level} · ${capacity}`;
}
