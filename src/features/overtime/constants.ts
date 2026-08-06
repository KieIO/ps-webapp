import type { StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';
import { OVERTIME_STATUSES, type OvertimeStatus } from './schemas/overtime.schema';

export const OT_QUERY_KEYS = {
  all: ['overtime'] as const,
  list: (filters: unknown) => ['overtime', 'list', filters] as const,
  pending: ['overtime', 'pending'] as const,
  detail: (id: string) => ['overtime', 'detail', id] as const,
  assignableTasks: (id: string) => ['overtime', 'assignable-tasks', id] as const,
  dashboard: (year: number, month: number) => ['overtime', 'dashboard', year, month] as const,
  settings: ['overtime', 'settings'] as const,
};

export const OT_STATUS_LABELS: Record<OvertimeStatus, string> = {
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
  approved: 'Đã duyệt',
  in_progress: 'Đang làm',
  awaiting_review: 'Chờ review',
  completed: 'Hoàn thành',
};

export const OT_STATUS_VARIANT: Record<OvertimeStatus, StatusPillVariant> = {
  pending: 'pending',
  rejected: 'cancelled',
  approved: 'in-progress',
  in_progress: 'in-progress',
  awaiting_review: 'overdue',
  completed: 'completed',
};

export const OT_STATUS_OPTIONS = OVERTIME_STATUSES.map((value) => ({
  value,
  label: OT_STATUS_LABELS[value],
}));

export const OT_FILTER_LABELS = {
  search: 'Tìm kiếm',
  searchPlaceholder: 'Lý do, dự án, người...',
  status: 'Trạng thái',
  statusPlaceholder: 'Tất cả trạng thái',
  project: 'Dự án',
  projectPlaceholder: 'Tất cả dự án',
  assignee: 'Người OT',
  assigneePlaceholder: 'Tất cả nhân sự',
  dateRange: 'Khoảng ngày OT',
} as const;
