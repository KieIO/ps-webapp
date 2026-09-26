import { ROLE_LABELS, type Role } from '@/config/permissions';
import type { UserStatus } from './schemas/user.schema';

export { ROLE_LABELS };

export const STATUS_LABELS = {
  active: 'Active',
  on_leave: 'On leave',
  inactive: 'Deactivate',
  invited: 'Invited',
} as const;

/** Short explanations for Status column tooltip on /users. */
export const STATUS_DESCRIPTIONS = {
  active: 'Đang làm việc, có thể gán task',
  on_leave: 'Đang nghỉ phép, không gán task - Admin activate lại sau khi hết nghỉ',
  inactive: 'Tài khoản ngưng hoạt động',
  invited: 'Đã mời, chưa kích hoạt',
} as const satisfies Record<UserStatus, string>;

export const USER_DEPARTMENTS = ['creative_hcm', 'project', 'creative_ag'] as const;

export type UserDepartment = (typeof USER_DEPARTMENTS)[number];

export const DEPARTMENT_LABELS: Record<UserDepartment, string> = {
  creative_hcm: 'CREATIVE HCM',
  project: 'PROJECT',
  creative_ag: 'CREATIVE AG',
};

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

/** Default initial password when admin leaves the invite password field blank. */
export const DEFAULT_INVITE_PASSWORD = 'ps123';
