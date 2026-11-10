import { ROLES, type Role } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import { isCreativeDeptTask } from './creativePipeline';

/** Plain Assignee label for PM on Creative handoff tasks (no staff names / links). */
export const PM_CREATIVE_ASSIGNEE_LABEL = 'Creative Department';

/**
 * PM tracks Creative as a department handoff — hide CM/Staff identity on Assignee.
 * Other roles keep named staff links.
 */
export const resolveAssigneePlainLabel = (
  role: Role | undefined,
  task: Pick<MyTask, 'department' | 'assignDirection' | 'workflowKind'>,
): string | null => {
  if (role !== ROLES.PM) return null;
  if (!isCreativeDeptTask(task)) return null;
  return PM_CREATIVE_ASSIGNEE_LABEL;
};
