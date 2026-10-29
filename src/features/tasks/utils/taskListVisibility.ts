import { ROLES, type Role } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import {
  isCreativeDeptTask,
  isCreativePipelineParent,
  isSplitChildTask,
  resolveEffectivePipelineStage,
} from './creativePipeline';
import { isCreativeWholeAssigned } from './taskEvaluation';
import { isRevisionTask } from './taskRevision';

/** Roles that oversee Creative handoffs and should not see CM→staff slices on Project Tasks. */
export const isOversightTaskListRole = (role: Role | undefined): boolean =>
  role === ROLES.PM || role === ROLES.CREATIVE_HEAD || role === ROLES.HEAD || role === ROLES.ADMIN;

/** Hide CM split children from PM / CH / Head / Admin Project Tasks lists. */
export const shouldHideSplitChildFromTaskList = (task: MyTask, role: Role | undefined): boolean =>
  isOversightTaskListRole(role) && isSplitChildTask(task);

/**
 * Oversight lists hide split children by default.
 * When the list is scoped to one project (Project Detail / projectName filter),
 * keep children so QA and staff slices match Tracker pills.
 */
export const filterTasksForViewerRole = (
  tasks: MyTask[],
  role: Role | undefined,
  options?: { includeSplitChildren?: boolean },
): MyTask[] => {
  if (options?.includeSplitChildren) return tasks;
  return tasks.filter((task) => !shouldHideSplitChildFromTaskList(task, role));
};

/**
 * CM Project Tasks scopes (option C):
 * - received: CH→CM parents still on the handoff layer (awaiting_cm + split parents)
 * - staff: units Staff works on (whole-assign parents + split children)
 */
export type CmProjectTaskScope = 'received' | 'staff';

export const CM_PROJECT_TASK_SCOPE_PARAM = 'cmScope';

export const CM_PROJECT_TASK_SCOPE_LABELS: Record<CmProjectTaskScope, string> = {
  received: 'Task nhận',
  staff: 'Task giao Staff',
};

/** Management-oriented hints — distinct from Creative Queue inbox copy. */
export const CM_PROJECT_TASK_SCOPE_HINTS: Record<CmProjectTaskScope, string> = {
  received: 'Gói việc CH giao cho bạn, kể cả task đã giao nguyên. Theo dõi đánh giá từ CH.',
  staff: 'Việc đã giao Staff (nguyên hoặc task nhỏ) - quản lý và đánh giá nhân viên.',
};

export const parseCmProjectTaskScope = (value: string | null | undefined): CmProjectTaskScope =>
  value === 'staff' ? 'staff' : 'received';

export const matchesCmProjectTaskScope = (task: MyTask, scope: CmProjectTaskScope): boolean => {
  // Non-creative rows rarely appear for CM; keep them on the receive tab only.
  if (!isCreativeDeptTask(task)) {
    return scope === 'received';
  }

  if (isRevisionTask(task)) {
    return scope === (task.parentTaskId ? 'staff' : 'received');
  }

  if (isSplitChildTask(task)) {
    return scope === 'staff';
  }

  if (!isCreativePipelineParent(task)) {
    return scope === 'staff';
  }

  const stage = resolveEffectivePipelineStage(task);

  // Whole-assign parent stays on both tabs: CH scores the CM package, CM scores Staff.
  if (stage === 'assigned_staff') {
    if (isCreativeWholeAssigned(task)) return true;
    return scope === 'staff';
  }

  // awaiting_cm / split / awaiting_ch / returned_to_pm / unknown → Task nhận.
  return scope === 'received';
};

export const filterTasksForCmProjectScope = (
  tasks: MyTask[],
  scope: CmProjectTaskScope,
): MyTask[] => tasks.filter((task) => matchesCmProjectTaskScope(task, scope));

export const countCmProjectTaskScopes = (tasks: MyTask[]): Record<CmProjectTaskScope, number> => ({
  received: filterTasksForCmProjectScope(tasks, 'received').length,
  staff: filterTasksForCmProjectScope(tasks, 'staff').length,
});
