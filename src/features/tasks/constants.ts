import {
  CLASSIFICATION_LEVELS,
  TASK_CONFIRMATION_STATUSES,
  type ClassificationLevel,
} from './schemas/task.schema';
import { PROJECT_NAME_COLUMN_LABEL } from '@/features/projects/constants';

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

/** Status picker in My Tasks table — display order for employees. */
export const TASK_STATUS_OPTIONS = [
  { value: 'finished' as const, label: CONFIRMATION_LABELS.finished },
  { value: 'confirmed' as const, label: CONFIRMATION_LABELS.confirmed },
  { value: 'not_updated' as const, label: CONFIRMATION_LABELS.not_updated },
  { value: 'decline' as const, label: CONFIRMATION_LABELS.decline },
];

export const CLASSIFICATION_LEVEL_OPTIONS = CLASSIFICATION_LEVELS.map((value) => ({
  value,
  label: CLASSIFICATION_LEVEL_LABELS[value],
}));

/** Default task names for create form — user may also enter a custom value. */
export const DEFAULT_TASK_NAME_OPTIONS = [
  'Animation',
  'Slides',
  'Edit feedback DE',
  'Redo slide',
  'DA',
] as const;

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
  date: 'Date',
  description: 'Description',
  staffName: 'Staff Name',
  designThinking: 'Tư Duy Thiết Kế',
  technical: 'Kỹ Thuật',
  contentProcessing: 'Xử Lý Nội Dung',
  additionalFactors: 'Yếu Tố Bổ Sung',
  completion: 'Hoàn Thành',
  evaluation: 'Đánh Giá',
  pmNote: 'Note',
  confirmation: 'Trạng Thái',
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
  confirmation: 'Trạng Thái',
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

/** Creative Head & Creative Manager — same columns and PM classification labels as Project Manager. */
export const MY_TASK_CREATIVE_HEAD_COLUMN_KEYS: MyTaskColumnKey[] = [...MY_TASK_PM_COLUMN_KEYS];
export const MY_TASK_CREATIVE_MANAGER_COLUMN_KEYS: MyTaskColumnKey[] = [...MY_TASK_PM_COLUMN_KEYS];

export const TASK_STATUS_CHANGE_NOTE_LABEL = 'Note khi đổi trạng thái (nếu có)';

/** Head / project evaluation score shown in ĐÁNH GIÁ column (1–4). */
export const PROJECT_EVALUATION_SCORE_OPTIONS = ['1', '2', '3', '4'].map((value) => ({
  value,
  label: value,
}));
