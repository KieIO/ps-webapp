import {
  CLASSIFICATION_LEVELS,
  TASK_CONFIRMATION_STATUSES,
  type ClassificationLevel,
} from './schemas/task.schema';
import {
  PROJECT_NAME_COLUMN_LABEL,
  PROJECT_URGENCY_SETTING_STYLES,
} from '@/features/projects/constants';
import {
  PROJECT_URGENCY_SETTING_ORDER,
  type ProjectUrgency,
} from '@/features/projects/schemas/project.schema';

import { CONFIRMATION_LABELS, CONFIRMATION_VARIANT } from '@/shared/constants/taskConfirmation';

export { CONFIRMATION_LABELS, CONFIRMATION_VARIANT };

export const CLASSIFICATION_LEVEL_LABELS: Record<ClassificationLevel, string> = {
  1: 'Level 1',
  2: 'Level 2',
  3: 'Level 3',
  4: 'Level 4',
};

export const CONFIRMATION_OPTIONS = TASK_CONFIRMATION_STATUSES.map((value) => ({
  value,
  label: CONFIRMATION_LABELS[value],
}));

/** Status picker in My Tasks — display order for staff workflow + cancel. */
export const TASK_STATUS_OPTIONS = [
  { value: 'finished' as const, label: CONFIRMATION_LABELS.finished },
  { value: 'confirmed' as const, label: CONFIRMATION_LABELS.confirmed },
  { value: 'not_updated' as const, label: CONFIRMATION_LABELS.not_updated },
  { value: 'decline' as const, label: CONFIRMATION_LABELS.decline },
  { value: 'cancelled' as const, label: CONFIRMATION_LABELS.cancelled },
];

export const CLASSIFICATION_LEVEL_OPTIONS = CLASSIFICATION_LEVELS.map((value) => ({
  value,
  label: CLASSIFICATION_LEVEL_LABELS[value],
}));

export const MY_TASKS_PAGE_SIZE = 10;

export const MY_TASKS_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/** Table / export column headers — English where provided in English, Vietnamese otherwise. */
export const UNASSIGNED_STAFF_LABEL = 'Unassigned';

export type MyTaskColumnKey =
  | 'projectName'
  | 'projectManager'
  | 'taskName'
  | 'level'
  | 'quantity'
  | 'date'
  | 'creativeDeadline'
  | 'urgency'
  | 'description'
  | 'staffName'
  | 'designThinking'
  | 'technical'
  | 'contentProcessing'
  | 'additionalFactors'
  | 'completion'
  | 'evaluation'
  | 'pmNote'
  | 'confirmation'
  | 'staffNote'
  | 'startDate'
  | 'endDate'
  | 'projectLevel'
  | 'brief'
  | 'volume'
  | 'nature'
  | 'projectTime'
  | 'projectStatus'
  | 'finishedDate';

export const MY_TASK_COLUMN_HEADERS: Record<MyTaskColumnKey, string> = {
  projectName: PROJECT_NAME_COLUMN_LABEL,
  projectManager: 'PM Name',
  taskName: 'Task Name',
  level: 'Level',
  quantity: 'Quantity',
  date: 'Deadline',
  creativeDeadline: 'Deadline phòng Creative',
  urgency: 'Urgency',
  description: 'Description',
  staffName: 'Staff Name',
  designThinking: 'Tư Duy Thiết Kế',
  technical: 'Kỹ Thuật',
  contentProcessing: 'Xử Lý Nội Dung',
  additionalFactors: 'Yếu Tố Bổ Sung',
  completion: 'Hoàn Thành',
  evaluation: 'Đánh Giá',
  pmNote: 'Note',
  confirmation: 'Task status',
  staffNote: 'Note',
  startDate: 'Start Date',
  endDate: 'End Date',
  projectLevel: 'Project Level',
  brief: 'Brief',
  volume: 'Khối Lượng',
  nature: 'Tính Chất',
  projectTime: 'Thời Gian',
  projectStatus: 'Project Status',
  finishedDate: 'Finished Date',
};

/** Department Head — column labels on the task list (and shared labels in EditHeadTaskModal). */
export const MY_TASK_HEAD_COLUMN_HEADERS: Partial<Record<MyTaskColumnKey, string>> = {
  projectName: PROJECT_NAME_COLUMN_LABEL,
  projectManager: 'PM Name',
  taskName: 'Task Name',
  description: 'Description',
  nature: 'Độ Khó',
  volume: 'Khối Lượng',
  projectTime: 'Thời Gian',
  additionalFactors: 'Yếu Tố Bổ Sung',
  completion: 'Hoàn Thành',
  evaluation: 'Đánh Giá',
  pmNote: 'Note',
  confirmation: 'Task status',
  staffNote: 'Note',
  startDate: 'Start Date',
  endDate: 'End Date',
  projectLevel: 'Project Level',
  brief: 'Brief',
  projectStatus: 'Project Status',
  finishedDate: 'Finished Date',
};

/** Employee — personal task view without classification / PM evaluation columns. */
export const MY_TASK_EMPLOYEE_COLUMN_KEYS: MyTaskColumnKey[] = [
  'projectName',
  'projectManager',
  'taskName',
  'quantity',
  'description',
  'date',
  'urgency',
  'confirmation',
  'staffNote',
];

/** Project Manager — full operational columns with PM classification labels. */
export const MY_TASK_PM_COLUMN_KEYS: MyTaskColumnKey[] = [
  'projectName',
  'projectManager',
  'taskName',
  'level',
  'quantity',
  'description',
  'date',
  'urgency',
  'staffName',
  'designThinking',
  'technical',
  'contentProcessing',
  'additionalFactors',
  'completion',
  'evaluation',
  'pmNote',
  'confirmation',
  'staffNote',
];

/**
 * Department Head — task + project classification columns (project fields denormalized on each row).
 */
export const MY_TASK_HEAD_COLUMN_KEYS: MyTaskColumnKey[] = [
  'projectName',
  'projectManager',
  'taskName',
  'level',
  'quantity',
  'description',
  'date',
  'urgency',
  'staffName',
  'nature',
  'volume',
  'projectTime',
  'additionalFactors',
  'completion',
  'evaluation',
  'pmNote',
  'confirmation',
  'staffNote',
];

/** Admin — full PM operational columns. */
export const MY_TASK_ADMIN_COLUMN_KEYS: MyTaskColumnKey[] = [...MY_TASK_PM_COLUMN_KEYS];

const insertAfter = <T extends string>(items: readonly T[], after: T, value: T): T[] => {
  const index = items.indexOf(after);
  if (index < 0) return [...items, value];
  return [...items.slice(0, index + 1), value, ...items.slice(index + 1)];
};

/** Creative Head & Creative Manager — PM columns plus internal creative deadline. */
export const MY_TASK_CREATIVE_HEAD_COLUMN_KEYS: MyTaskColumnKey[] = insertAfter(
  MY_TASK_PM_COLUMN_KEYS,
  'date',
  'creativeDeadline',
);
export const MY_TASK_CREATIVE_MANAGER_COLUMN_KEYS: MyTaskColumnKey[] = [
  ...MY_TASK_CREATIVE_HEAD_COLUMN_KEYS,
];

export const TASK_STATUS_CHANGE_NOTE_LABEL = 'Note khi đổi trạng thái (nếu có)';

/** Head / project evaluation score shown in ĐÁNH GIÁ column (1–5). */
export const PROJECT_EVALUATION_SCORE_OPTIONS = ['1', '2', '3', '4', '5'].map((value) => ({
  value,
  label: value,
}));

/** Urgency select options — Auto first, then locked levels in product table order. */
export const TASK_URGENCY_OPTIONS = PROJECT_URGENCY_SETTING_ORDER.map((value: ProjectUrgency) => ({
  value,
  label: PROJECT_URGENCY_SETTING_STYLES[value].label,
  color: PROJECT_URGENCY_SETTING_STYLES[value].dot,
}));
