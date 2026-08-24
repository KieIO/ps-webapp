import { ROLES, type Role } from '@/config/permissions';
import type {
  BriefOwner,
  CreateMyTaskRequest,
  CreativePipelineStage,
  MyTask,
  TaskAssignee,
} from '../schemas/task.schema';
import {
  canSelectAssigneeWithCapacity,
  displayCapacityPercentFromSnapshot,
  availabilityFromSnapshot,
  type AssignCapacitySnapshot,
} from './assignCapacity';
import {
  ASSIGN_OVERLOAD_CAPACITY_PERCENT,
  availabilityFromCapacity,
  isStaffAssignable,
  staffMatchesDepartment,
} from './staffAvailability';
import { staffOptionKey } from './staff';

export const PIPELINE_STAGE_LABELS: Record<CreativePipelineStage, string> = {
  awaiting_ch: 'Chờ xử lý',
  awaiting_cm: 'Chờ assign',
  assigned_staff: 'Đã giao Staff',
  split: 'Đã chia nhỏ',
};

export type CreativeQueueView = 'ch' | 'cm';

export const canViewCreativeQueue = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_HEAD || role === ROLES.CREATIVE_MANAGER || role === ROLES.ADMIN;

export const canProcessChQueue = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_HEAD || role === ROLES.ADMIN;

export const canProcessCmQueue = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_MANAGER || role === ROLES.ADMIN;

export const defaultCreativeQueueView = (role: Role | undefined): CreativeQueueView =>
  role === ROLES.CREATIVE_MANAGER ? 'cm' : 'ch';

export const isCreativeHandoffPayload = (payload: CreateMyTaskRequest): boolean =>
  payload.workflowKind === 'creative' || payload.assignDirection === 'creative_department';

export const resolveCreatePipelineStage = (
  payload: CreateMyTaskRequest,
): CreativePipelineStage | undefined => {
  if (isCreativeHandoffPayload(payload)) return 'awaiting_ch';
  if (payload.staff.length > 0) return 'assigned_staff';
  return undefined;
};

export const resolveCreateBriefOwner = (payload: CreateMyTaskRequest): BriefOwner | undefined => {
  if (payload.workflowKind === 'creative') return 'ch';
  if (payload.assignDirection === 'creative_department') return 'pm';
  return undefined;
};

export const needsChBrief = (task: MyTask): boolean => {
  if (task.briefOwner === 'pm') return false;
  if (task.briefOwner === 'ch') return !task.description.trim();
  // Real API without briefOwner: empty brief on unassigned creative task needs CH fill.
  return isCreativeDeptTask(task) && task.staff.length === 0 && !task.description.trim();
};

export const hasReadyBrief = (task: MyTask): boolean => Boolean(task.description.trim());

export const isCreativePipelineParent = (task: MyTask): boolean => !task.parentTaskId;

const isCreativeDeptTask = (task: MyTask): boolean =>
  task.department === 'creative' ||
  Boolean(task.department?.startsWith('creative_')) ||
  task.assignDirection === 'creative_department' ||
  task.workflowKind === 'creative';

export const isCreativeManagerAssignee = (staff: TaskAssignee): boolean =>
  staff.role === ROLES.CREATIVE_MANAGER || staff.userId === `dev-${ROLES.CREATIVE_MANAGER}`;

export const isCreativeHeadAssignee = (staff: TaskAssignee): boolean =>
  staff.role === ROLES.CREATIVE_HEAD || staff.userId === `dev-${ROLES.CREATIVE_HEAD}`;

/** Prefer persisted stage; fall back for live API tasks that only have department + staff. */
export const resolveEffectivePipelineStage = (task: MyTask): CreativePipelineStage | undefined => {
  if (task.pipelineStage) return task.pipelineStage;
  if (task.parentTaskId || !isCreativeDeptTask(task)) return undefined;
  if (task.staff.length === 0) return 'awaiting_ch';
  if (task.staff.length === 1 && isCreativeManagerAssignee(task.staff[0])) {
    return 'awaiting_cm';
  }
  if (
    task.creativeManager?.userId &&
    task.staff.some((member) => member.userId === task.creativeManager?.userId)
  ) {
    return 'awaiting_cm';
  }
  if (task.staff.length > 0) return 'assigned_staff';
  return undefined;
};

export const isAwaitingCh = (task: MyTask): boolean =>
  resolveEffectivePipelineStage(task) === 'awaiting_ch';

export const isAwaitingCm = (task: MyTask): boolean =>
  resolveEffectivePipelineStage(task) === 'awaiting_cm';

const isAssignedToUser = (task: MyTask, userId: string): boolean =>
  task.staff.some((member) => member.userId === userId) || task.creativeManager?.userId === userId;

export const filterCreativeQueue = (
  tasks: MyTask[],
  view: CreativeQueueView,
  userId: string | undefined,
  role: Role | undefined,
): MyTask[] => {
  const parents = tasks.filter(
    (task) =>
      isCreativePipelineParent(task) && task.taskCategory === 'project' && isCreativeDeptTask(task),
  );

  if (view === 'ch') {
    return parents
      .filter((task) => {
        const stage = resolveEffectivePipelineStage(task);
        return stage === 'awaiting_ch' || stage === 'awaiting_cm';
      })
      .sort((a, b) => {
        const stageA = resolveEffectivePipelineStage(a);
        const stageB = resolveEffectivePipelineStage(b);
        if (stageA === stageB) return 0;
        return stageA === 'awaiting_ch' ? -1 : 1;
      });
  }

  return parents.filter((task) => {
    const stage = resolveEffectivePipelineStage(task);
    if (stage !== 'awaiting_cm' && stage !== 'assigned_staff') {
      return false;
    }
    if (role === ROLES.ADMIN) return true;
    if (!userId) return false;
    return isAssignedToUser(task, userId);
  });
};

export const countActionableQueueItems = (
  tasks: MyTask[],
  view: CreativeQueueView,
  userId: string | undefined,
  role: Role | undefined,
): number =>
  filterCreativeQueue(tasks, view, userId, role).filter((task) =>
    view === 'ch' ? isAwaitingCh(task) : isAwaitingCm(task),
  ).length;

export const filterCreativeManagers = (staffOptions: TaskAssignee[]): TaskAssignee[] =>
  staffOptions.filter(
    (staff) => staffMatchesDepartment(staff, 'creative') && isCreativeManagerAssignee(staff),
  );

export const filterCreativeStaff = (staffOptions: TaskAssignee[]): TaskAssignee[] =>
  staffOptions.filter(
    (staff) =>
      staffMatchesDepartment(staff, 'creative') &&
      !isCreativeManagerAssignee(staff) &&
      !isCreativeHeadAssignee(staff),
  );

const ACTIVE_CONFIRMATIONS = new Set(['not_updated', 'confirmed', 'decline']);

export interface AssigneeWorkload {
  activeCount: number;
  capacityPercent: number;
}

/** Rough FE estimate when capacity API has no row for this user yet. */
const ESTIMATED_CAPACITY_PER_ACTIVE_TASK = 15;

export const getAssigneeWorkload = (
  tasks: MyTask[],
  userId: string | undefined,
): AssigneeWorkload => {
  if (!userId) return { activeCount: 0, capacityPercent: 0 };
  const activeCount = tasks.filter(
    (task) =>
      task.staff.some((member) => member.userId === userId) &&
      ACTIVE_CONFIRMATIONS.has(task.staffConfirmation) &&
      resolveEffectivePipelineStage(task) !== 'split',
  ).length;
  return {
    activeCount,
    capacityPercent: Math.min(100, activeCount * ESTIMATED_CAPACITY_PER_ACTIVE_TASK),
  };
};

export const displayCapacityPercent = (
  staff: TaskAssignee,
  tasks: MyTask[],
  capacityByUserId?: Map<string, AssignCapacitySnapshot>,
): number => {
  const fromApi = displayCapacityPercentFromSnapshot(staff, capacityByUserId);
  if (fromApi != null) return fromApi;

  const fromTasks = getAssigneeWorkload(tasks, staff.userId ?? undefined).capacityPercent;
  if (fromTasks > 0) return fromTasks;
  if (staff.availability === 'overloaded') return ASSIGN_OVERLOAD_CAPACITY_PERCENT;
  if (staff.availability === 'free') return 30;
  if (staff.availability === 'normal') return 65;
  if (staff.availability === 'on_leave') return 0;
  return 0;
};

export const resolveAssigneeAvailability = (
  staff: TaskAssignee,
  capacityByUserId?: Map<string, AssignCapacitySnapshot>,
) =>
  availabilityFromSnapshot(
    capacityByUserId && staff.userId ? capacityByUserId.get(staff.userId) : undefined,
    staff.availability,
  );

export const canSelectAssignee = (
  staff: TaskAssignee,
  tasks?: MyTask[],
  capacityByUserId?: Map<string, AssignCapacitySnapshot>,
): boolean => {
  const fromCapacity = canSelectAssigneeWithCapacity(staff, capacityByUserId);
  if (fromCapacity != null) return fromCapacity;

  if (!isStaffAssignable(staff.availability)) return false;
  if (!tasks) return true;
  const estimated = getAssigneeWorkload(tasks, staff.userId ?? undefined).capacityPercent;
  if (estimated <= 0) return true;
  return isStaffAssignable(availabilityFromCapacity(estimated));
};

export const queueActionLabel = (task: MyTask, view: CreativeQueueView): string => {
  if (view === 'ch') {
    if (isAwaitingCh(task)) {
      return needsChBrief(task) ? 'Fill brief & Assign' : 'Assign cho CM';
    }
    return 'Xem';
  }
  if (isAwaitingCm(task)) return 'Giao cho Staff';
  return 'Xem';
};

export const staffOptionKeyOf = staffOptionKey;
