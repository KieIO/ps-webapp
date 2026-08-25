import { ROLES, type Role } from '@/config/permissions';
import type {
  BriefOwner,
  CreateMyTaskRequest,
  CreativeAssignMode,
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
  awaiting_cm: 'Chờ giao Staff',
  assigned_staff: 'Đã giao Staff',
  split: 'Đã chia nhỏ',
};

export type CreativeQueueView = 'ch' | 'cm';

export const canViewCreativeQueue = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_HEAD || role === ROLES.CREATIVE_MANAGER || role === ROLES.ADMIN;

export const canProcessChQueue = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_HEAD || role === ROLES.ADMIN || role === ROLES.PM;

export const canProcessCmQueue = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_MANAGER || role === ROLES.ADMIN || role === ROLES.PM;

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

export const CREATIVE_ASSIGN_MODE_OPTIONS: { label: string; value: CreativeAssignMode }[] = [
  { label: 'Giao nguyên task', value: 'whole' },
  { label: 'Chia thành task nhỏ', value: 'split' },
];

/** Locked assign shape after CM giao Staff — not editable via Sửa / Đổi giao. */
export const resolveCreativeAssignMode = (task: MyTask): CreativeAssignMode | null => {
  const stage = resolveEffectivePipelineStage(task);
  if (stage === 'split') return 'split';
  if (stage === 'assigned_staff') return 'whole';
  return null;
};

export const getCreativeSplitSubtasks = (parent: MyTask, allTasks: MyTask[]): MyTask[] =>
  allTasks
    .filter((entry) => entry.parentTaskId === parent.id)
    .sort((a, b) => a.taskCode.localeCompare(b.taskCode));

/** Staff on whole-assigned parent (excludes CM parked on assignees). */
export const resolveWholeAssignStaff = (task: MyTask): TaskAssignee[] => {
  const cmUserId = task.creativeManager?.userId;
  return task.staff.filter(
    (member) =>
      Boolean(member.name?.trim()) &&
      !(cmUserId && member.userId === cmUserId) &&
      !isCreativeManagerAssignee(member),
  );
};

/** Người nhận = Creative Staff only. Split parents use child staff (via allTasks or enriched API). */
export const pipelineAssigneeLabel = (task: MyTask, allTasks?: MyTask[]): string => {
  const stage = resolveEffectivePipelineStage(task);
  if (stage === 'awaiting_ch' || stage === 'awaiting_cm') {
    return '—';
  }

  const cmUserId = task.creativeManager?.userId;
  const namesFromStaff = (staff: TaskAssignee[]): string[] => {
    const names: string[] = [];
    const seen = new Set<string>();
    for (const member of staff) {
      const name = member.name?.trim();
      if (!name) continue;
      if (cmUserId && member.userId === cmUserId) continue;
      if (isCreativeManagerAssignee(member)) continue;
      const key = member.userId?.trim() || name;
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(name);
    }
    return names;
  };

  let names = namesFromStaff(task.staff);
  if (stage === 'split' && names.length === 0 && allTasks?.length) {
    const childStaff = allTasks
      .filter((entry) => entry.parentTaskId === task.id)
      .flatMap((entry) => entry.staff);
    names = namesFromStaff(childStaff);
  }

  return names.length > 0 ? names.join(', ') : '—';
};

/** Stages shown on Creative queue (pipeline board, not inbox-only). */
const PIPELINE_BOARD_STAGES = new Set<CreativePipelineStage>([
  'awaiting_ch',
  'awaiting_cm',
  'assigned_staff',
  'split',
]);

const resolveQueueRecency = (task: MyTask): string =>
  task.updatedAt ?? task.assignedAt ?? task.date ?? '';

/** Actionable inbox rows stay on top; everything else by most recent pipeline activity. */
const compareCreativeQueueRows = (
  a: { task: MyTask; stage: CreativePipelineStage },
  b: { task: MyTask; stage: CreativePipelineStage },
  view: CreativeQueueView,
): number => {
  const aActionable = view === 'ch' ? isAwaitingCh(a.task) : isAwaitingCm(a.task);
  const bActionable = view === 'ch' ? isAwaitingCh(b.task) : isAwaitingCm(b.task);
  if (aActionable !== bActionable) {
    return aActionable ? -1 : 1;
  }

  const byRecency = resolveQueueRecency(b.task).localeCompare(resolveQueueRecency(a.task));
  if (byRecency !== 0) return byRecency;

  const byDate = (b.task.date ?? '').localeCompare(a.task.date ?? '');
  if (byDate !== 0) return byDate;

  return a.task.id.localeCompare(b.task.id);
};

const isPipelineBoardStage = (
  stage: CreativePipelineStage | undefined,
): stage is CreativePipelineStage => stage != null && PIPELINE_BOARD_STAGES.has(stage);

const isAssignedToUser = (task: MyTask, userId: string): boolean =>
  task.staff.some((member) => member.userId === userId) || task.creativeManager?.userId === userId;

export const canEditCreativePipelineRole = (role: Role | undefined): boolean =>
  role === ROLES.ADMIN ||
  role === ROLES.PM ||
  role === ROLES.CREATIVE_HEAD ||
  role === ROLES.CREATIVE_MANAGER;

export const canChangeCreativeLevelRole = (role: Role | undefined): boolean =>
  role === ROLES.ADMIN || role === ROLES.CREATIVE_HEAD;

export const isCreativeLevelLockedByStaffConfirm = (task: MyTask): boolean =>
  task.staffConfirmation === 'confirmed' || task.staffConfirmation === 'finished';

export const isEditableCreativePipelineStage = (task: MyTask): boolean => {
  const stage = resolveEffectivePipelineStage(task);
  return stage === 'awaiting_cm' || stage === 'assigned_staff' || stage === 'split';
};

export const canEditCreativePipelineTask = (
  task: MyTask,
  role: Role | undefined,
  userId: string | undefined,
): boolean => {
  if (!canEditCreativePipelineRole(role) || !isEditableCreativePipelineStage(task)) return false;
  if (task.staffConfirmation === 'finished' || task.staffConfirmation === 'cancelled') return false;
  if (role === ROLES.ADMIN || role === ROLES.PM || role === ROLES.CREATIVE_HEAD) return true;
  if (!userId) return false;
  return isAssignedToUser(task, userId);
};

export const canReassignCreativeStaff = (task: MyTask, role: Role | undefined): boolean =>
  resolveEffectivePipelineStage(task) === 'assigned_staff' && canEditCreativePipelineRole(role);

/** Roles that may see creative assign CTA on task detail. */
export const canSeeCreativeDetailPipelineAction = (role: Role | undefined): boolean =>
  role === ROLES.ADMIN ||
  role === ROLES.PM ||
  role === ROLES.CREATIVE_HEAD ||
  role === ROLES.CREATIVE_MANAGER;

export type CreativeDetailPipelineAction = 'assign_cm' | 'assign_staff' | 'edit';

export type CreativeDetailPipelineActionInfo = {
  action: CreativeDetailPipelineAction;
  label: string;
};

/**
 * Resolve assign/edit CTA for task detail — mirrors Creative queue actions for the
 * same pipeline stage (Admin uses stage-first: awaiting_cm → assign Staff).
 */
export const resolveCreativeDetailPipelineAction = (
  task: MyTask,
  role: Role | undefined,
  userId: string | undefined,
): CreativeDetailPipelineActionInfo | null => {
  if (!canSeeCreativeDetailPipelineAction(role)) return null;
  if (!isCreativePipelineParent(task)) return null;
  if (task.staffConfirmation === 'finished' || task.staffConfirmation === 'cancelled') return null;

  const stage = resolveEffectivePipelineStage(task);
  if (!isPipelineBoardStage(stage)) return null;

  if (stage === 'awaiting_ch') {
    if (!canProcessChQueue(role)) return null;
    return {
      action: 'assign_cm',
      label: needsChBrief(task) ? 'Bổ sung brief & giao CM' : 'Giao cho CM',
    };
  }

  if (stage === 'awaiting_cm') {
    if (canProcessCmQueue(role)) {
      if (role === ROLES.CREATIVE_MANAGER) {
        if (!userId || !isAssignedToUser(task, userId)) return null;
      }
      return { action: 'assign_staff', label: 'Giao cho Staff' };
    }
    if (canEditCreativePipelineTask(task, role, userId)) {
      return { action: 'edit', label: 'Sửa / Đổi giao' };
    }
    return null;
  }

  if (canEditCreativePipelineTask(task, role, userId)) {
    return { action: 'edit', label: 'Sửa / Đổi giao' };
  }
  return null;
};

/**
 * Creative queue board:
 * - CH: all creative parent tasks in pipeline stages (including already assigned / split)
 * - CM: awaiting_cm + assigned_staff + split for tasks assigned to that CM (Admin: all)
 * Subtasks (parentTaskId) and non-creative / non-project tasks are excluded.
 */
export const filterCreativeQueue = (
  tasks: MyTask[],
  view: CreativeQueueView,
  userId: string | undefined,
  role: Role | undefined,
): MyTask[] => {
  const rows: { task: MyTask; stage: CreativePipelineStage }[] = [];

  for (const task of tasks) {
    if (
      !isCreativePipelineParent(task) ||
      task.taskCategory !== 'project' ||
      !isCreativeDeptTask(task)
    ) {
      continue;
    }

    const stage = resolveEffectivePipelineStage(task);
    if (!isPipelineBoardStage(stage)) continue;

    if (view === 'ch') {
      rows.push({ task, stage });
      continue;
    }

    // CM board never lists CH-inbox items.
    if (stage === 'awaiting_ch') continue;
    if (role === ROLES.ADMIN) {
      rows.push({ task, stage });
      continue;
    }
    if (!userId || !isAssignedToUser(task, userId)) continue;
    rows.push({ task, stage });
  }

  rows.sort((a, b) => compareCreativeQueueRows(a, b, view));

  return rows.map((row) => row.task);
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

export const queueActionLabel = (
  task: MyTask,
  view: CreativeQueueView,
  role?: Role,
  userId?: string,
): string => {
  if (view === 'ch') {
    if (isAwaitingCh(task)) {
      return needsChBrief(task) ? 'Bổ sung brief & giao CM' : 'Giao cho CM';
    }
    if (canEditCreativePipelineTask(task, role, userId)) return 'Sửa / Đổi giao';
    return 'Xem';
  }
  if (isAwaitingCm(task)) return 'Giao cho Staff';
  if (canEditCreativePipelineTask(task, role, userId)) return 'Sửa / Đổi giao';
  return 'Xem';
};

export const staffOptionKeyOf = staffOptionKey;
