import type { MyTask, TaskConfirmationStatus } from '../schemas/task.schema';
import {
  getCreativeSplitSubtasks,
  isSplitParentTask,
  resolveEffectivePipelineStage,
  resolveWholeAssignStaff,
} from './creativePipeline';
import { deriveCompletedQuantityFromPercent } from './evaluationCompletion';
import { hasCmEvaluation } from './evaluationRemainder';
import {
  resolveTaskSummaryBucket,
  TASK_SUMMARY_BUCKET_LABELS,
  type TaskSummaryBucket,
} from './taskConfirmationSummary';

/** CM «Giao Staff» board buckets (clickable summary pills). */
export type CmStaffAssignBucket = 'needsAssign' | 'assigned' | 'completed';

export interface CmStaffAssignSummary {
  total: number;
  needsAssign: number;
  assigned: number;
  completed: number;
}

export const CM_STAFF_ASSIGN_BUCKET_ORDER = [
  'needsAssign',
  'assigned',
  'completed',
] as const satisfies readonly CmStaffAssignBucket[];

export const CM_STAFF_ASSIGN_BUCKET_LABELS: Record<CmStaffAssignBucket, string> = {
  needsAssign: 'Cần giao',
  assigned: 'Đã giao',
  completed: 'Hoàn thành',
};

const EMPTY_SUMMARY: CmStaffAssignSummary = {
  total: 0,
  needsAssign: 0,
  assigned: 0,
  completed: 0,
};

const listSplitChildren = (parent: MyTask, allTasks: MyTask[]): MyTask[] =>
  getCreativeSplitSubtasks(parent, allTasks);

/** Aggregate Staff confirmation for a split parent from its children. */
export const resolveSplitParentStaffConfirmation = (
  parent: MyTask,
  allTasks: MyTask[],
): TaskConfirmationStatus => {
  const children = listSplitChildren(parent, allTasks);
  if (children.length === 0) return parent.staffConfirmation;

  if (children.every((child) => child.staffConfirmation === 'finished')) {
    return 'finished';
  }
  if (children.every((child) => child.staffConfirmation === 'cancelled')) {
    return 'cancelled';
  }
  if (children.some((child) => child.staffConfirmation === 'decline')) {
    return 'decline';
  }
  if (children.some((child) => child.staffConfirmation === 'confirmed')) {
    return 'confirmed';
  }
  return 'not_updated';
};

export const resolveCmStaffCompletionBucket = (
  task: MyTask,
  allTasks: MyTask[],
): TaskSummaryBucket => {
  if (isSplitParentTask(task)) {
    const confirmation = resolveSplitParentStaffConfirmation(task, allTasks);
    const children = listSplitChildren(task, allTasks);
    const anyEvaluated = children.some((child) => hasCmEvaluation(child));
    return resolveTaskSummaryBucket({
      staffConfirmation: confirmation,
      completionPercent: anyEvaluated ? 1 : undefined,
      pmEvaluation: anyEvaluated ? '1' : undefined,
    });
  }
  return resolveTaskSummaryBucket(task);
};

export const resolveCmStaffAssignBucket = (
  task: MyTask,
  allTasks: MyTask[] = [],
): CmStaffAssignBucket => {
  const stage = resolveEffectivePipelineStage(task);
  if (stage === 'awaiting_cm') return 'needsAssign';

  if (isSplitParentTask(task)) {
    const children = listSplitChildren(task, allTasks);
    const needsStaff =
      children.length === 0 ||
      children.some((child) => resolveWholeAssignStaff(child).length === 0);
    if (needsStaff) return 'needsAssign';
  }

  if (resolveCmStaffCompletionBucket(task, allTasks) === 'completed') {
    return 'completed';
  }
  if (task.staffConfirmation === 'finished') {
    return 'completed';
  }
  return 'assigned';
};

export const computeCmStaffAssignSummary = (
  tasks: MyTask[],
  allTasks: MyTask[] = tasks,
): CmStaffAssignSummary => {
  if (tasks.length === 0) return EMPTY_SUMMARY;
  const summary: CmStaffAssignSummary = { ...EMPTY_SUMMARY, total: tasks.length };
  for (const task of tasks) {
    summary[resolveCmStaffAssignBucket(task, allTasks)] += 1;
  }
  return summary;
};

/**
 * Short completed-quantity label for the Giao Staff table.
 * - Split parent: `2/5` (task con đã HT / tổng task con)
 * - Whole finished: `16/31` (SL đạt / SL giao)
 * - Otherwise: `—`
 */
export const formatCmStaffCompletedQuantityLabel = (task: MyTask, allTasks: MyTask[]): string => {
  if (resolveEffectivePipelineStage(task) === 'awaiting_cm') return '—';

  if (isSplitParentTask(task)) {
    const children = listSplitChildren(task, allTasks);
    if (children.length === 0) return '—';
    const done = children.filter((child) => child.staffConfirmation === 'finished').length;
    return `${done}/${children.length}`;
  }

  const total = Math.round(task.quantity ?? 0);
  if (total <= 0) return '—';
  if (task.staffConfirmation !== 'finished') return `0/${total}`;

  if (task.completionPercent != null) {
    const done = deriveCompletedQuantityFromPercent(task.completionPercent, total);
    return `${done}/${total}`;
  }
  return `${total}/${total}`;
};

export const formatCmStaffCompletionStatusLabel = (task: MyTask, allTasks: MyTask[]): string => {
  if (resolveEffectivePipelineStage(task) === 'awaiting_cm') return '—';
  const bucket = resolveCmStaffCompletionBucket(task, allTasks);
  return TASK_SUMMARY_BUCKET_LABELS[bucket];
};
