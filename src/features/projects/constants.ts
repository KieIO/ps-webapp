import {
  EVALUATION_LEVELS,
  PROJECT_DEPARTMENTS,
  PROJECT_STATUSES,
  type EvaluationLevel,
  type ProjectDepartment,
  type ProjectStatus,
  type ProjectUrgency,
} from './schemas/project.schema';
import type { StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_updated: 'Not Updated',
  in_progress: 'In Progress',
  finish: 'Finish',
  cancel: 'Cancel',
};

export const STATUS_VARIANT: Record<ProjectStatus, StatusPillVariant> = {
  not_updated: 'on-leave',
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
  red: { dot: '#DC2626', label: 'Gấp' },
  orange: { dot: '#EA580C', label: 'Gấp vừa' },
  green: { dot: '#16A34A', label: 'Hoàn tất' },
  gray: { dot: '#94A3B8', label: 'Bình thường' },
};

export const PROJECT_EVALUATION_COLUMN_HEADERS = {
  volume: 'Khối Lượng',
  nature: 'Tính Chất',
  time: 'Thời Gian',
  additionalFactors: 'Yếu Tố Bổ Sung',
} as const;

export const PROJECTS_PAGE_SIZE = 10;

export const PROJECTS_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const PROJECT_TASKS_PAGE_SIZE = 10;

export const PROJECT_TASKS_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
