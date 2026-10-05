import { ROLES, type Role } from '@/config/permissions';
import type {
  BriefOwner,
  CreateMyTaskRequest,
  CreativeAssignMode,
  CreativePipelineStage,
  MyTask,
  TaskAssignee,
} from '../schemas/task.schema';
import { isRevisionTask } from './taskRevision';
import {
  canSelectAssigneeWithCapacity,
  displayCapacityPercentFromSnapshot,
  availabilityFromSnapshot,
  type AssignCapacitySnapshot,
} from './assignCapacity';
import { ASSIGN_OVERLOAD_CAPACITY_PERCENT, staffMatchesDepartment } from './staffAvailability';
import { staffOptionKey } from './staff';

export const PIPELINE_STAGE_LABELS: Record<CreativePipelineStage, string> = {
  awaiting_ch: 'Chờ xử lý',
  awaiting_cm: 'Chờ giao Staff',
  assigned_staff: 'Đã giao Staff',
  split: 'Đã chia nhỏ',
};

export type CreativeQueueView = 'ch' | 'cm';

/** CM Creative queue frames — intake (CH→CM) vs execution (CM→staff). */
export type CreativeCmQueueFrame = 'intake' | 'execution';

export const CREATIVE_CM_QUEUE_FRAME_LABELS: Record<CreativeCmQueueFrame, string> = {
  intake: 'Nhận từ CH / PM',
  execution: 'Giao Staff',
};

export const canViewCreativeQueue = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_HEAD ||
  role === ROLES.CREATIVE_MANAGER ||
  role === ROLES.ADMIN ||
  role === ROLES.PM;

/** Admin/PM see the full CM board (not filtered to personal assignee). */
export const canSeeFullCmQueue = (role: Role | undefined): boolean =>
  role === ROLES.ADMIN || role === ROLES.PM;

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

export const isCreativeDeptTask = (task: MyTask): boolean =>
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
    .filter((entry) => entry.parentTaskId === parent.id && !isRevisionTask(entry))
    .sort((a, b) => a.taskCode.localeCompare(b.taskCode));

export const isSplitParentTask = (task: MyTask): boolean =>
  resolveEffectivePipelineStage(task) === 'split';

/** CM-split child (not revision). */
export const isSplitChildTask = (task: MyTask): boolean =>
  Boolean(task.parentTaskId) &&
  (task.taskKind === 'split' || !task.taskKind) &&
  !isRevisionTask(task);

export const sumSplitChildrenQuantity = (children: MyTask[]): number =>
  children.reduce((sum, child) => sum + (child.quantity ?? 0), 0);

/** True when split family conserves locked parent total (within float epsilon). */
export const isSplitQuantityConserved = (parentQty: number, children: MyTask[]): boolean =>
  Math.abs(sumSplitChildrenQuantity(children) - parentQty) < 1e-6;

/** Split parents hold a locked display total — aggregates count children only. */
export const countsTowardQuantityAggregates = (task: MyTask): boolean =>
  resolveEffectivePipelineStage(task) !== 'split';

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
      .filter((entry) => entry.parentTaskId === task.id && !isRevisionTask(entry))
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

/**
 * Prefer CreativeEditDrawer over generic EditTaskModal for in-pipeline creative tasks
 * (awaiting_cm / assigned_staff / split) so deadline edits do not force Staff re-select.
 */
export const shouldUseCreativePipelineEditDrawer = (
  task: MyTask,
  role: Role | undefined,
  userId: string | undefined,
): boolean => canEditCreativePipelineTask(task, role, userId);

export const canReassignCreativeStaff = (task: MyTask, role: Role | undefined): boolean =>
  resolveEffectivePipelineStage(task) === 'assigned_staff' && canEditCreativePipelineRole(role);

/** CH / Admin may change CM only while the task is still awaiting CM (before Staff assign). */
export const canReassignCreativeManager = (task: MyTask, role: Role | undefined): boolean => {
  if (role !== ROLES.ADMIN && role !== ROLES.CREATIVE_HEAD) return false;
  if (task.staffConfirmation === 'finished' || task.staffConfirmation === 'cancelled') return false;
  return resolveEffectivePipelineStage(task) === 'awaiting_cm';
};

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
  if (task.staffConfirmation === 'finished' || task.staffConfirmation === 'cancelled') return null;

  // Split children: edit Staff + SL against locked parent total (no unsplit).
  if (isSplitChildTask(task)) {
    if (task.staffConfirmation === 'confirmed') return null;
    if (!canEditCreativePipelineTask(task, role, userId)) return null;
    return { action: 'edit', label: 'Đổi Staff / SL' };
  }

  if (!isCreativePipelineParent(task)) return null;

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
    return { action: 'edit', label: stage === 'split' ? 'Sửa / Task nhỏ' : 'Sửa / Đổi giao' };
  }
  return null;
};

/**
 * Creative queue board:
 * - CH: all creative parent tasks in pipeline stages (including already assigned / split)
 * - CM intake: awaiting_cm parents only (work received from CH/PM)
 * - CM execution: assigned_staff / split parents + split children for staff management
 * Subtasks are excluded from CH and CM intake; execution includes split children.
 */
export const filterCreativeQueue = (
  tasks: MyTask[],
  view: CreativeQueueView,
  userId: string | undefined,
  role: Role | undefined,
  cmFrame: CreativeCmQueueFrame = 'intake',
): MyTask[] => {
  const rows: { task: MyTask; stage: CreativePipelineStage }[] = [];

  for (const task of tasks) {
    if (task.taskCategory !== 'project' || !isCreativeDeptTask(task)) {
      continue;
    }

    if (view === 'ch') {
      if (!isCreativePipelineParent(task)) continue;
      const stage = resolveEffectivePipelineStage(task);
      if (!isPipelineBoardStage(stage)) continue;
      rows.push({ task, stage });
      continue;
    }

    // CM frames
    if (cmFrame === 'intake') {
      if (!isCreativePipelineParent(task)) continue;
      const stage = resolveEffectivePipelineStage(task);
      if (stage !== 'awaiting_cm') continue;
      if (!canSeeFullCmQueue(role) && (!userId || !isAssignedToUser(task, userId))) continue;
      rows.push({ task, stage });
      continue;
    }

    // execution: staff-facing work
    if (isSplitChildTask(task)) {
      if (!isCmScopedExecutionTask(task, userId, role)) continue;
      rows.push({ task, stage: 'assigned_staff' });
      continue;
    }

    if (!isCreativePipelineParent(task)) continue;
    const stage = resolveEffectivePipelineStage(task);
    if (stage !== 'assigned_staff' && stage !== 'split') continue;
    if (!canSeeFullCmQueue(role) && (!userId || !isAssignedToUser(task, userId))) continue;
    rows.push({ task, stage });
  }

  rows.sort((a, b) => compareCreativeQueueRows(a, b, view));

  return rows.map((row) => row.task);
};

const isCmScopedExecutionTask = (
  task: MyTask,
  userId: string | undefined,
  role: Role | undefined,
): boolean => {
  if (canSeeFullCmQueue(role)) return true;
  if (!userId) return false;
  if (task.creativeManager?.userId === userId) return true;
  return isAssignedToUser(task, userId);
};

export const countActionableQueueItems = (
  tasks: MyTask[],
  view: CreativeQueueView,
  userId: string | undefined,
  role: Role | undefined,
  cmFrame: CreativeCmQueueFrame = 'intake',
): number => {
  if (view === 'ch') {
    return filterCreativeQueue(tasks, view, userId, role).filter((task) => isAwaitingCh(task))
      .length;
  }
  if (cmFrame === 'intake') {
    return filterCreativeQueue(tasks, view, userId, role, 'intake').filter((task) =>
      isAwaitingCm(task),
    ).length;
  }
  return filterCreativeQueue(tasks, view, userId, role, 'execution').filter(
    (task) =>
      task.staffConfirmation === 'not_updated' &&
      (isSplitChildTask(task) || resolveEffectivePipelineStage(task) === 'assigned_staff'),
  ).length;
};

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

/**
 * Assignable executors for CM giao Staff: Creative Staff + optional CM self (or Admin→CM).
 */
export const filterCreativeAssignableExecutors = (
  staffOptions: TaskAssignee[],
  actorRole: Role | undefined,
  actorUserId: string | undefined,
): TaskAssignee[] => {
  const staff = filterCreativeStaff(staffOptions);
  if (actorRole === ROLES.CREATIVE_MANAGER && actorUserId) {
    const self = staffOptions.find(
      (entry) =>
        entry.userId === actorUserId &&
        staffMatchesDepartment(entry, 'creative') &&
        isCreativeManagerAssignee(entry),
    );
    if (self && !staff.some((entry) => entry.userId === self.userId)) {
      return [self, ...staff];
    }
  }
  if (actorRole === ROLES.ADMIN) {
    const managers = filterCreativeManagers(staffOptions);
    const seen = new Set(staff.map((entry) => entry.userId).filter(Boolean));
    const extras = managers.filter((entry) => entry.userId && !seen.has(entry.userId));
    return [...extras, ...staff];
  }
  return staff;
};

/** Routing / container stages — not execution load (mirrors BE capacity filter). */
const CAPACITY_EXCLUDED_STAGES = new Set<CreativePipelineStage>([
  'awaiting_ch',
  'awaiting_cm',
  'split',
]);

const ACTIVE_CONFIRMATIONS = new Set(['not_updated', 'confirmed']);

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
  const activeCount = tasks.filter((task) => {
    const stage = resolveEffectivePipelineStage(task);
    if (stage != null && CAPACITY_EXCLUDED_STAGES.has(stage)) return false;
    return (
      task.staff.some((member) => member.userId === userId) &&
      ACTIVE_CONFIRMATIONS.has(task.staffConfirmation)
    );
  }).length;
  return {
    activeCount,
    // Do not cap at 100 — overload should surface as >100% when estimate exceeds daily band.
    capacityPercent: activeCount * ESTIMATED_CAPACITY_PER_ACTIVE_TASK,
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

  // Capacity % / Overloaded no longer blocks; only leave does.
  if (staff.availability === 'on_leave') return false;
  void tasks;
  return true;
};

export const queueActionLabel = (
  task: MyTask,
  view: CreativeQueueView,
  role?: Role,
  userId?: string,
): string => {
  if (view === 'ch') {
    if (isAwaitingCh(task)) {
      return needsChBrief(task) ? 'Bổ sung brief' : 'Giao CM';
    }
    if (canEditCreativePipelineTask(task, role, userId)) return 'Sửa';
    return 'Xem';
  }
  if (isAwaitingCm(task)) return 'Giao Staff';
  if (canEditCreativePipelineTask(task, role, userId)) return 'Sửa';
  return 'Xem';
};

/**
 * Staff (assignee) may Confirm / Từ chối after CM giao (assigned_staff / split child).
 * Uses the same status PATCH; BE rolls declined creative work back to CM.
 */
export const canStaffConfirmOrDeclineCreative = (
  task: MyTask,
  userId: string | undefined,
  role: Role | undefined,
): boolean => {
  if (!userId || role == null) return false;
  if (!isCreativeDeptTask(task) || isRevisionTask(task)) return false;
  if (task.staffConfirmation !== 'not_updated') return false;
  if (resolveEffectivePipelineStage(task) !== 'assigned_staff') return false;
  // CM parked on awaiting_cm uses refuse CTA instead.
  if (isAwaitingCm(task)) return false;
  return task.staff.some((member) => member.userId === userId);
};

/**
 * CM (or Admin/PM on CM queue) may refuse an awaiting_cm handoff → returns to CH.
 */
export const canCmRefuseCreativeAssignment = (
  task: MyTask,
  userId: string | undefined,
  role: Role | undefined,
): boolean => {
  if (!canProcessCmQueue(role)) return false;
  if (!isAwaitingCm(task)) return false;
  if (task.staffConfirmation === 'finished' || task.staffConfirmation === 'cancelled') return false;
  if (task.staffConfirmation === 'decline') return false;
  if (role === ROLES.CREATIVE_MANAGER) {
    return Boolean(userId && isAssignedToUser(task, userId));
  }
  return role === ROLES.ADMIN || role === ROLES.PM;
};

/**
 * Mirror BE creative decline rollback for mock mode.
 * Pipeline creative decline resets to not_updated after returning to CH/CM.
 * Revision / non-creative: keep decline status (flat).
 * Throws when creative decline is not allowed for the current stage.
 */
export const applyCreativeDeclineRollback = (task: MyTask): MyTask => {
  if (!isCreativeDeptTask(task) || isRevisionTask(task)) return task;

  const stage = resolveEffectivePipelineStage(task);

  if (stage === 'split') {
    throw new Error(
      'Không từ chối task Creative đã chia nhỏ (split parent). Hãy xử lý từng task nhỏ.',
    );
  }

  if (stage === 'awaiting_cm') {
    return {
      ...task,
      staffConfirmation: 'not_updated',
      pipelineStage: 'awaiting_ch',
      creativeManager: undefined,
      staff: [],
    };
  }

  if (stage === 'assigned_staff' && task.creativeManager?.userId) {
    const cm = task.creativeManager;
    const cmStaff: TaskAssignee = {
      code: cm.code,
      name: cm.name,
      userId: cm.userId,
      role: ROLES.CREATIVE_MANAGER,
    };
    return {
      ...task,
      staffConfirmation: 'not_updated',
      pipelineStage: task.parentTaskId ? task.pipelineStage : 'awaiting_cm',
      staff: [cmStaff],
    };
  }

  throw new Error('Không từ chối được task Creative ở giai đoạn hiện tại.');
};

export const staffOptionKeyOf = staffOptionKey;
