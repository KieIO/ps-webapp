import type { StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';
import { OVERTIME_STATUSES, type OvertimeStatus } from './schemas/overtime.schema';

export const OT_QUERY_KEYS = {
  all: ['overtime'] as const,
  list: (filters: unknown) => ['overtime', 'list', filters] as const,
  pending: ['overtime', 'pending'] as const,
  detail: (id: string) => ['overtime', 'detail', id] as const,
  assignableTasks: (id: string) => ['overtime', 'assignable-tasks', id] as const,
  projectOptions: (fromDate: string, toDate: string) =>
    ['overtime', 'project-options', fromDate, toDate] as const,
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

export const OT_REASON_CATEGORIES = [
  'late_feedbacks',
  'urgent',
  'scope_of_works',
  'internal_dependency_delay',
  'cross_department_delay',
  'technical_issue',
  'holidays',
  'others',
] as const;

export type OtReasonCategory = (typeof OT_REASON_CATEGORIES)[number];

export const OT_REASON_CATEGORY_LABELS: Record<OtReasonCategory, string> = {
  late_feedbacks: 'Late Feedbacks',
  urgent: 'Urgent',
  scope_of_works: 'Scope of Works',
  internal_dependency_delay: 'Internal Dependency Delay',
  cross_department_delay: 'Cross-department Delay',
  technical_issue: 'Technical Issue',
  holidays: 'Holidays',
  others: 'Others',
};

export const OT_REASON_CATEGORY_OPTIONS = OT_REASON_CATEGORIES.map((value) => ({
  value,
  label: OT_REASON_CATEGORY_LABELS[value],
}));

export const formatOtReasonCategories = (
  categories: readonly string[] | null | undefined,
): string => {
  if (!categories?.length) return '';
  return categories
    .map((key) =>
      key in OT_REASON_CATEGORY_LABELS ? OT_REASON_CATEGORY_LABELS[key as OtReasonCategory] : key,
    )
    .join(', ');
};

/** Edit is only allowed while the request is still waiting for Head approval. */
export const canEditOvertimeRequest = (status: OvertimeStatus): boolean => status === 'pending';

export const overtimeEditDisabledReason = (status: OvertimeStatus): string | null => {
  if (canEditOvertimeRequest(status)) return null;
  if (status === 'rejected') {
    return 'OT request đã bị từ chối nên không chỉnh sửa được';
  }
  return 'OT request đã được duyệt nên không chỉnh sửa được';
};

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
