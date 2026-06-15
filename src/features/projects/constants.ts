import {
  EVALUATION_LEVELS,
  PROJECT_DEPARTMENTS,
  PROJECT_STATUSES,
  type EvaluationLevel,
  type ProjectDepartment,
  type ProjectStatus,
  type ProjectUrgency,
} from './schemas/project.schema';
import { URGENCY_STYLES } from '@/shared/constants/urgencyStyles';
import type { StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';

export const PROJECT_NAME_COLUMN_LABEL = 'Tên dự án';

/** Single source of truth — used on /projects summary bar, table badge, filters, export. */
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_updated: 'Chưa cập nhật',
  in_progress: 'Đang làm',
  finish: 'Hoàn thành',
  cancel: 'Đã hủy',
};

export const STATUS_VARIANT: Record<ProjectStatus, StatusPillVariant> = {
  not_updated: 'pending',
  in_progress: 'in-progress',
  finish: 'completed',
  cancel: 'on-leave',
};

export const DEPARTMENT_LABELS: Record<ProjectDepartment, string> = {
  project: 'Project',
  creative: 'Creative',
  admin: 'Admin / HR',
};

export const DEPARTMENT_OPTIONS = PROJECT_DEPARTMENTS.map((value) => ({
  value,
  label: DEPARTMENT_LABELS[value],
}));

export const STATUS_OPTIONS = PROJECT_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export const PROJECT_LEVEL_OPTIONS = EVALUATION_LEVELS.map((value) => ({
  value,
  label: `Level ${value}`,
}));

export const EVALUATION_LEVEL_OPTIONS = EVALUATION_LEVELS.map((value) => ({
  value,
  label: `Level ${value}`,
}));

export const EVALUATION_LEVEL_LABELS: Record<EvaluationLevel, string> = {
  1: 'Level 1',
  2: 'Level 2',
  3: 'Level 3',
  4: 'Level 4',
};

export const PROJECT_URGENCY_STYLES: Record<
  ProjectUrgency,
  { dot: string; label: string }
> = {
  red: { dot: URGENCY_STYLES.red.dot, label: URGENCY_STYLES.red.label },
  orange: { dot: URGENCY_STYLES.orange.dot, label: URGENCY_STYLES.orange.label },
  green: { dot: URGENCY_STYLES.green.dot, label: URGENCY_STYLES.green.label },
  gray: { dot: URGENCY_STYLES.gray.dot, label: URGENCY_STYLES.gray.label },
};

export const PROJECT_EVALUATION_COLUMN_HEADERS = {
  volume: 'Khối Lượng',
  nature: 'Tính Chất',
  time: 'Thời Gian',
  additionalFactors: 'Yếu Tố Bổ Sung',
} as const;

export const PROJECT_TABLE_COLUMN_HEADERS = {
  client: 'Khách hàng',
  department: 'Phòng ban',
  tasks: 'Tasks',
  startDate: 'Ngày bắt đầu',
  endDate: 'Ngày kết thúc',
  level: 'Level',
  headName: 'Trưởng phòng',
  brief: 'Brief',
  pmName: 'PM',
  members: 'Thành viên',
  slides: 'Slides',
  completion: '% Hoàn thành',
  evaluation: 'Đánh giá',
  note: 'Ghi chú',
  status: 'Trạng thái',
  finishedDate: 'Ngày hoàn thành',
} as const;

export const PROJECT_FILTER_LABELS = {
  search: 'Tìm kiếm',
  searchPlaceholder: 'Tìm dự án, khách hàng hoặc brief...',
  client: 'Khách hàng',
  clientPlaceholder: 'Tất cả khách hàng',
  status: 'Trạng thái',
  statusPlaceholder: 'Tất cả trạng thái',
  headName: 'Trưởng phòng',
  headPlaceholder: 'Tất cả trưởng phòng',
  pm: 'PM',
  pmPlaceholder: 'Tất cả PM',
  level: 'Level dự án',
  levelPlaceholder: 'Tất cả level',
  export: 'Xuất Excel',
} as const;

export const PROJECTS_PAGE_SIZE = 10;

export const PROJECTS_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const PROJECT_TASKS_PAGE_SIZE = 10;

export const PROJECT_TASKS_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
