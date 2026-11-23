import { ROLE_LABELS, ROLES, type Role } from '@/config/permissions';
import { getDepartmentLabel } from '@/features/departments/hooks/useDepartmentOptions';
import type { MyTask } from '../schemas/task.schema';
import { isCreativeDeptTask, resolveEffectivePipelineStage } from './creativePipeline';

/** @deprecated Prefer department label via `resolveAssigneePlainLabel`. Kept for callers/tests. */
export const PM_CREATIVE_ASSIGNEE_LABEL = 'Creative Department';

/**
 * Cross-department handoff (e.g. PM → Creative): Assignee shows department name
 * until execution Staff is assigned within that department.
 */
export const isCrossDepartmentAssigneeHandoff = (
  task: Pick<
    MyTask,
    | 'department'
    | 'assignDirection'
    | 'workflowKind'
    | 'pipelineStage'
    | 'staff'
    | 'creativeManager'
    | 'parentTaskId'
  >,
): boolean => {
  if (task.assignDirection === 'project_staff') return false;
  if (!isCreativeDeptTask(task)) return false;

  const stage = resolveEffectivePipelineStage(task as MyTask);
  return stage === 'awaiting_ch' || stage === 'awaiting_cm' || stage === 'returned_to_pm';
};

/**
 * Assignee display:
 * - Cross-dept handoff (chưa giao Staff trong phòng nhận) → tên phòng ban
 * - Trong phòng / đã giao Staff → null (UI hiện tên staff)
 */
export const resolveAssigneePlainLabel = (
  _role: Role | undefined,
  task: Pick<
    MyTask,
    | 'department'
    | 'assignDirection'
    | 'workflowKind'
    | 'pipelineStage'
    | 'staff'
    | 'creativeManager'
    | 'parentTaskId'
  >,
): string | null => {
  if (!isCrossDepartmentAssigneeHandoff(task)) return null;
  const label = getDepartmentLabel(task.department);
  return label || PM_CREATIVE_ASSIGNEE_LABEL;
};

export type AssignedByDisplay = {
  name: string;
  userId?: string | null;
  roleLabel: string;
};

const roleDisplayLabel = (role: string | undefined): string => {
  if (!role) return '';
  if (role in ROLE_LABELS) return ROLE_LABELS[role as Role];
  return role;
};

/**
 * Assigned by:
 * - Cross-dept handoff → PM của project/task (vd. Anh Kiệt (Project Manager))
 * - Trong phòng / đã giao Staff → người last-handoff (`assignedBy`)
 */
export const resolveAssignedByDisplay = (
  task: Pick<
    MyTask,
    | 'department'
    | 'assignDirection'
    | 'workflowKind'
    | 'pipelineStage'
    | 'staff'
    | 'creativeManager'
    | 'parentTaskId'
    | 'projectManager'
    | 'assignedBy'
  >,
): AssignedByDisplay | null => {
  if (isCrossDepartmentAssigneeHandoff(task)) {
    const pmName = task.projectManager?.name?.trim();
    if (pmName) {
      return {
        name: pmName,
        userId: task.projectManager.userId,
        roleLabel: ROLE_LABELS[ROLES.PM],
      };
    }
  }

  const assigned = task.assignedBy;
  const name = assigned?.name?.trim();
  if (!name) return null;
  return {
    name,
    userId: assigned.userId,
    roleLabel: roleDisplayLabel(assigned.role),
  };
};

/** List / CSV label: `Name (Role)` or empty when unknown. */
export const formatAssignedByLabel = (
  task: Parameters<typeof resolveAssignedByDisplay>[0],
): string => {
  const display = resolveAssignedByDisplay(task);
  if (!display) return '';
  return display.roleLabel ? `${display.name} (${display.roleLabel})` : display.name;
};
