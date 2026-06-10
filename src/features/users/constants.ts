import { ROLE_LABELS, type Role } from '@/config/permissions';
import type { UserStatus } from './schemas/user.schema';

export { ROLE_LABELS };

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  invited: 'Invited',
};

export const DEPARTMENT_LABELS = {
  project: 'Project Department',
  creative: 'Creative Department',
  admin: 'Admin / HR',
} as const;

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value: value as Role,
  label,
}));

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value: value as UserStatus,
  label,
}));

export const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABELS).map(([value, label]) => ({
  value: value as keyof typeof DEPARTMENT_LABELS,
  label,
}));
