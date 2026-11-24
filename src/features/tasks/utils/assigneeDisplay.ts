import { ROLE_LABELS, ROLES, type Role } from '@/config/permissions';
import { getDepartmentLabel } from '@/features/departments/hooks/useDepartmentOptions';
import type { MyTask } from '../schemas/task.schema';
import { isCreativeDeptTask, resolveEffectivePipelineStage } from './creativePipeline';

/** @deprecated Prefer department label via `resolveAssigneePlainLabel`. Kept for callers/tests. */
export const PM_CREATIVE_ASSIGNEE_LABEL = 'Creative Department';

type AssigneeTaskFields = Pick<
  MyTask,
  | 'department'
  | 'assignDirection'
  | 'workflowKind'
  | 'pipelineStage'
  | 'staff'
  | 'creativeManager'
  | 'parentTaskId'
>;

type AssignedByTaskFields = AssigneeTaskFields & Pick<MyTask, 'projectManager' | 'assignedBy'>;

/** Short catalog label (`Creative`) — handoff pills for non-PM viewers. */
const creativeDepartmentLabel = (task: Pick<MyTask, 'department'>): string =>
  getDepartmentLabel(task.department) || 'Creative';

const projectPmDisplay = (task: Pick<MyTask, 'projectManager'>): AssignedByDisplay | null => {
  const pmName = task.projectManager?.name?.trim();
  if (!pmName) return null;
  return {
    name: pmName,
    userId: task.projectManager.userId,
    roleLabel: ROLE_LABELS[ROLES.PM],
  };
};

/**
 * Cross-department handoff (e.g. PM → Creative): Assignee shows department name
 * until execution Staff is assigned within that department.
 */
export const isCrossDepartmentAssigneeHandoff = (task: AssigneeTaskFields): boolean => {
  if (task.assignDirection === 'project_staff') return false;
  if (!isCreativeDeptTask(task)) return false;

  const stage = resolveEffectivePipelineStage(task as MyTask);
  return stage === 'awaiting_ch' || stage === 'awaiting_cm' || stage === 'returned_to_pm';
};

/**
 * Assignee display:
 * - **PM** + task phòng Creative → luôn `Creative Department` (không hiện tên Staff)
 * - Cross-dept handoff (role khác, chưa giao Staff) → tên phòng ban ngắn (`Creative`)
 * - Task Project / đã giao Staff (role khác) → null (UI hiện tên staff)
 */
export const resolveAssigneePlainLabel = (
  role: Role | undefined,
  task: AssigneeTaskFields,
): string | null => {
  // Chỉ task Creative — Project Staff vẫn hiện tên người.
  if (role === ROLES.PM && isCreativeDeptTask(task)) {
    return PM_CREATIVE_ASSIGNEE_LABEL;
  }
  if (!isCrossDepartmentAssigneeHandoff(task)) return null;
  return creativeDepartmentLabel(task);
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
 * - **PM** + task Creative → luôn PM project (gói bàn giao từ PM sang Creative)
 * - Cross-dept handoff → PM của project/task
 * - Trong phòng / đã giao Staff → người last-handoff (`assignedBy`)
 */
export const resolveAssignedByDisplay = (
  task: AssignedByTaskFields,
  role?: Role,
): AssignedByDisplay | null => {
  if (role === ROLES.PM && isCreativeDeptTask(task)) {
    return projectPmDisplay(task);
  }
  if (isCrossDepartmentAssigneeHandoff(task)) {
    return projectPmDisplay(task);
  }

  const assigned = task.assignedBy;
  const name = assigned?.name?.trim();
  if (!assigned || !name) return null;
  return {
    name,
    userId: assigned.userId,
    roleLabel: roleDisplayLabel(assigned.role),
  };
};

/** List / CSV label: `Name (Role)` or empty when unknown. */
export const formatAssignedByLabel = (task: AssignedByTaskFields, role?: Role): string => {
  const display = resolveAssignedByDisplay(task, role);
  if (!display) return '';
  return display.roleLabel ? `${display.name} (${display.roleLabel})` : display.name;
};
