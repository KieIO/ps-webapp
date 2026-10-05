import { ROLES, type Role } from '@/config/permissions';
import type { MyTaskColumnKey } from '../constants';
import { getMyTaskColumnKeysForRole } from './myTaskColumns';

/** Table columns that are never editable inside the task edit modal. */
const READ_ONLY_COLUMN_KEYS = new Set<MyTaskColumnKey>([
  'projectName',
  'projectManager',
  'level',
  'projectLevel',
  'startDate',
  'endDate',
  'brief',
  'volume',
  'nature',
  'projectTime',
  'projectStatus',
  'finishedDate',
]);

export type EditTaskField =
  | 'description'
  | 'taskName'
  | 'quantity'
  | 'date'
  | 'urgency'
  | 'staff'
  | 'designThinking'
  | 'technical'
  | 'contentProcessing'
  | 'additionalFactors'
  | 'completion'
  | 'evaluation'
  | 'pmNote'
  | 'confirmation'
  | 'staffNote';

const COLUMN_TO_EDIT_FIELD: Partial<Record<MyTaskColumnKey, EditTaskField>> = {
  description: 'description',
  taskName: 'taskName',
  quantity: 'quantity',
  date: 'date',
  urgency: 'urgency',
  staffName: 'staff',
  designThinking: 'designThinking',
  technical: 'technical',
  contentProcessing: 'contentProcessing',
  additionalFactors: 'additionalFactors',
  completion: 'completion',
  evaluation: 'evaluation',
  pmNote: 'pmNote',
  confirmation: 'confirmation',
  staffNote: 'staffNote',
};

/** PM / Admin edit evaluation via the Evaluate action — not inline in this modal. */
const EVALUATION_VIA_EVALUATE_ACTION: Role[] = [ROLES.PM, ROLES.ADMIN, ROLES.HEAD];

export const getEditTaskFieldsForRole = (role: Role, canEvaluate: boolean): Set<EditTaskField> => {
  const fields = new Set<EditTaskField>();

  for (const column of getMyTaskColumnKeysForRole(role)) {
    if (READ_ONLY_COLUMN_KEYS.has(column)) continue;

    const field = COLUMN_TO_EDIT_FIELD[column];
    if (!field) continue;

    if (
      (field === 'completion' || field === 'evaluation' || field === 'pmNote') &&
      canEvaluate &&
      EVALUATION_VIA_EVALUATE_ACTION.includes(role)
    ) {
      continue;
    }

    fields.add(field);
  }

  return fields;
};

export const showsTaskLevelPreview = (role: Role): boolean =>
  getMyTaskColumnKeysForRole(role).includes('level');

export const showsEvaluationReadOnly = (role: Role, canEvaluate: boolean): boolean => {
  if (!canEvaluate || !EVALUATION_VIA_EVALUATE_ACTION.includes(role)) return false;
  const columns = getMyTaskColumnKeysForRole(role);
  return (
    columns.includes('completion') || columns.includes('evaluation') || columns.includes('pmNote')
  );
};

/**
 * Generic EditTaskModal requires Staff for normal project tasks.
 * Creative handoff / pipeline tasks assign via Creative drawers — do not force Staff here.
 */
export const requiresStaffOnGenericEdit = (task: {
  taskCategory?: string;
  department?: string | null;
  assignDirection?: string | null;
  workflowKind?: string | null;
}): boolean => {
  if (task.taskCategory !== 'project') return false;
  const isCreative =
    task.department === 'creative' ||
    Boolean(task.department?.startsWith('creative_')) ||
    task.assignDirection === 'creative_department' ||
    task.workflowKind === 'creative';
  return !isCreative;
};
