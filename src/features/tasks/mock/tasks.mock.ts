import { PERMISSIONS, ROLES, type Role } from '@/config/permissions';
import { DEV_MOCK_USERS } from '@/features/auth/mock/devUsers';
import { getMockProjectsStore } from '@/features/projects/mock/projects.data';
import { getMockUsersStore } from '@/features/users/mock/users.data';
import type {
  AssignCreativeHeadRequest,
  AssignCreativeManagerRequest,
  AssignMyTaskRequest,
  CreateMyTaskRequest,
  CreateQualityReviewRequest,
  CreateRevisionRequest,
  MyTask,
  MyTaskListFilters,
  MyTaskListResponse,
  QualityReview,
  QualityReviewListResponse,
  RevisionListResponse,
  TaskAssignee,
  UpdateCreativePipelineRequest,
  UpdateHeadMyTaskRequest,
  UpdateMyTaskRequest,
  UpdateMyTaskPmEvaluationRequest,
  UpdateMyTaskStatusRequest,
  TaskHistoryListResponse,
} from '../schemas/task.schema';
import { UNASSIGNED_STAFF_LABEL } from '../constants';
import { buildFallbackTaskHistory } from '../utils/taskDetail';
import { normalizeTaskDateEnd, normalizeTaskDateStart } from '../utils/taskDates';
import { isTaskActiveOnWorkDate } from '../utils/taskWorkDate';
import { computeTaskLevel } from '../utils/taskLevel';
import { isStaffAssignable } from '../utils/staffAvailability';
import { resolveStaffFromUserId } from '../utils/staff';
import {
  applyCreativeDeclineRollback,
  canChangeCreativeLevelRole,
  canEditCreativePipelineTask,
  canProcessChQueue,
  canProcessCmQueue,
  canReassignCreativeManager,
  canReassignCreativeStaff,
  filterCreativeAssignableExecutors,
  filterCreativeManagers,
  filterCreativeStaff,
  isAwaitingCh,
  isCreativeHandoffPayload,
  isCreativeLevelLockedByStaffConfirm,
  isSplitChildTask,
  needsChBrief,
  resolveCreateBriefOwner,
  resolveCreatePipelineStage,
  resolveEffectivePipelineStage,
} from '../utils/creativePipeline';
import { canEditCreativeDeadline, canEditCreativeScheduleMeta } from '../utils/creativeVisibility';
import { canEvaluateTaskLayer } from '../utils/taskEvaluation';
import { shouldHideSplitChildFromTaskList } from '../utils/taskListVisibility';
import { normalizeTaskUrgencySetting } from '../utils/taskUrgency';
import {
  ACTIVE_REVISION_CONFIRMATIONS,
  getDirectRevisionChildren,
  getNextRevisionRound,
  getRequestRevisionBlockReason,
  assertRevisionQuantity,
  isRevisionDeadlineOnOrAfterWorkDate,
  isRevisionTask,
  REQUEST_REVISION_BLOCK_MESSAGES,
  REVISION_DEADLINE_BEFORE_WORK_DATE_MESSAGE,
} from '../utils/taskRevision';
import { enrichMockTaskWithProjectContext } from './mockTaskProjectEnrichment';
import { computeProjectLevel } from '@/features/projects/utils/projectLevel';
import { promoteMockProjectInProgressIfNeeded } from '@/features/projects/mock/projects.data';
import {
  getMockTasksStore,
  MOCK_ASSIGNABLE_STAFF,
  MOCK_PROJECT_MANAGERS,
  setMockTasksStore,
} from './tasks.data';
import { mockDelay } from '@/shared/mock/mockDelay';

const shouldPromoteProjectFromConfirmation = (confirmation: MyTask['staffConfirmation']): boolean =>
  confirmation === 'confirmed' || confirmation === 'finished';

const roleHasDefaultPermission = (role: Role, permission: keyof typeof PERMISSIONS): boolean =>
  (PERMISSIONS[permission] as readonly Role[]).includes(role);

/** Dev auth mock uses `dev-${role}` user ids — derive role for permission parity with runtime RBAC. */
const deriveDevRoleFromUserId = (userId: string): Role | undefined => {
  if (!userId.startsWith('dev-')) return undefined;
  const role = userId.slice(4) as Role;
  return Object.values(ROLES).includes(role) ? role : undefined;
};

const canViewAllTasks = (userId?: string, viewerRole?: Role): boolean => {
  if (viewerRole && roleHasDefaultPermission(viewerRole, 'VIEW_ALL_TASKS')) {
    return true;
  }
  const role = userId ? deriveDevRoleFromUserId(userId) : undefined;
  return role != null && roleHasDefaultPermission(role, 'VIEW_ALL_TASKS');
};

const canEvaluateTask = (userId?: string): boolean => {
  const role = userId ? deriveDevRoleFromUserId(userId) : undefined;
  return role != null && roleHasDefaultPermission(role, 'EVALUATE_TASK');
};

const canAssignTask = (userId?: string): boolean => {
  const role = userId ? deriveDevRoleFromUserId(userId) : undefined;
  return role != null && roleHasDefaultPermission(role, 'ASSIGN_TASK');
};

/** PM evaluation via Evaluate action or inline in Edit modal (Creative roles). */
const canUpdatePmEvaluation = (userId?: string): boolean => {
  if (canEvaluateTask(userId)) return true;
  const role = userId ? deriveDevRoleFromUserId(userId) : undefined;
  return role === ROLES.CREATIVE_HEAD || role === ROLES.CREATIVE_MANAGER;
};

const monthKey = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 7);
};

const dateKey = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

const isCreativeAssignee = (userId: string | null | undefined): boolean => {
  if (!userId) return false;
  const user = getMockUsersStore().find((entry) => entry.id === userId);
  if (user) return user.department === 'creative_hcm' || user.department === 'creative_ag';

  const role = deriveDevRoleFromUserId(userId);
  return role === ROLES.CREATIVE_HEAD || role === ROLES.CREATIVE_MANAGER;
};

const isCreativeDATask = (task: MyTask): boolean => {
  const normalizedName = task.taskName.trim().toLowerCase().replace(/\s+/g, ' ');
  const hasDAName = /^(da|edit da|rework da)( |$)/.test(normalizedName);
  const hasCreativeDepartment =
    task.department === 'creative' ||
    task.staff.some((member) => isCreativeAssignee(member.userId));
  return hasDAName && hasCreativeDepartment;
};

const isProjectOutputTask = (task: MyTask): boolean => {
  const project = getMockProjectsStore().find(
    (entry) => entry.id === task.projectId || entry.name === task.projectName,
  );
  if (project?.department?.trim().toLowerCase() !== 'project') {
    return false;
  }
  if (isCreativeDATask(task)) {
    return false;
  }
  return true;
};

export const filterMockTasks = (
  tasks: MyTask[],
  filters: MyTaskListFilters,
  assigneeUserId?: string,
  viewerRole?: Role,
): MyTaskListResponse['items'] => {
  const search = filters.search?.trim().toLowerCase();
  const viewAllTasks = canViewAllTasks(assigneeUserId, viewerRole);

  const resolvedRole =
    viewerRole ?? (assigneeUserId ? deriveDevRoleFromUserId(assigneeUserId) : undefined);

  return tasks.filter((task) => {
    if (assigneeUserId && !viewAllTasks) {
      const assigneeIds = task.staff.map((member) => member.userId).filter(Boolean);
      const isCreativeManager =
        task.creativeManager?.userId != null && task.creativeManager.userId === assigneeUserId;
      const isAssignee = assigneeIds.includes(assigneeUserId);
      if (!isAssignee && !isCreativeManager) {
        return false;
      }
    }
    // Oversight roles (VIEW_ALL): hide CM→staff split children — parent handoff only.
    if (viewAllTasks && shouldHideSplitChildFromTaskList(task, resolvedRole)) {
      return false;
    }
    if (filters.taskCategory && task.taskCategory !== filters.taskCategory) return false;
    if (filters.projectName && task.projectName !== filters.projectName) return false;
    if (filters.staffName) {
      const staffNames = task.staff.map((member) => member.name);
      if (filters.staffName === UNASSIGNED_STAFF_LABEL) {
        if (staffNames.length > 0) return false;
      } else if (!staffNames.includes(filters.staffName)) {
        return false;
      }
    }
    if (filters.confirmation && task.staffConfirmation !== filters.confirmation) return false;
    if (filters.timeliness) {
      if (
        task.staffConfirmation !== 'finished' ||
        !task.completedAt ||
        monthKey(task.completedAt) !== filters.completedMonth
      ) {
        return false;
      }
      if (filters.timeliness !== 'completed') {
        const completedDate = dateKey(task.completedAt);
        const deadlineDate = dateKey(task.deadline ?? task.date);
        const isOnTime =
          completedDate != null && deadlineDate != null && completedDate <= deadlineDate;
        if (filters.timeliness === 'on_time' && !isOnTime) return false;
        if (filters.timeliness === 'not_on_time' && isOnTime) return false;
      }
    }
    if (filters.outputMetric) {
      if (monthKey(task.date) !== filters.outputMonth) return false;
      if (filters.outputMetric === 'project_slides' && !isProjectOutputTask(task)) return false;
      if (filters.outputMetric === 'creative_da' && !isCreativeDATask(task)) return false;
    }
    if (filters.workDate && !isTaskActiveOnWorkDate(task, filters.workDate)) return false;
    if (search) {
      const haystack =
        `${task.taskCode} ${task.projectName} ${task.taskName} ${task.description}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
};

export const mockGetMyTaskList = async (
  filters: MyTaskListFilters,
  assigneeUserId?: string,
  viewerRole?: Role,
): Promise<MyTaskListResponse> => {
  await mockDelay();
  if (Boolean(filters.outputMetric) !== Boolean(filters.outputMonth)) {
    throw new Error('outputMetric and outputMonth must be provided together');
  }
  const items = filterMockTasks(getMockTasksStore(), filters, assigneeUserId, viewerRole).map(
    (task) => withRevisionChildCount(enrichMockTaskWithProjectContext(task)),
  );
  return { items, total: items.length };
};

const canViewTask = (task: MyTask, viewerUserId?: string, viewerRole?: Role): boolean => {
  if (!viewerUserId) return false;
  if (canViewAllTasks(viewerUserId, viewerRole)) return true;
  const assigneeIds = task.staff.map((member) => member.userId).filter(Boolean);
  if (task.creativeManager?.userId === viewerUserId) return true;
  return assigneeIds.includes(viewerUserId);
};

export const mockGetMyTaskById = async (
  id: string,
  viewerUserId?: string,
  viewerRole?: Role,
): Promise<MyTask> => {
  await mockDelay();
  const task = getMockTasksStore().find((entry) => entry.id === id);
  if (!task) {
    throw new Error('Task not found');
  }
  if (!canViewTask(task, viewerUserId, viewerRole)) {
    throw new Error('You do not have permission to view this task');
  }
  return withRevisionChildCount(enrichMockTaskWithProjectContext(task));
};

const withRevisionChildCount = (task: MyTask): MyTask => {
  if (isRevisionTask(task)) {
    return { ...task, revisionChildCount: 0, activeRevisionChildCount: 0 };
  }
  const children = getDirectRevisionChildren(task.id, getMockTasksStore());
  return {
    ...task,
    revisionChildCount: children.length,
    activeRevisionChildCount: children.filter((child) =>
      ACTIVE_REVISION_CONFIRMATIONS.has(child.staffConfirmation),
    ).length,
  };
};

export const mockGetMyTaskHistory = async (
  id: string,
  viewerUserId?: string,
  viewerRole?: Role,
): Promise<TaskHistoryListResponse> => {
  await mockDelay();
  const task = await mockGetMyTaskById(id, viewerUserId, viewerRole);
  return { items: buildFallbackTaskHistory(task) };
};

const mockQualityReviewsByTask = new Map<string, QualityReview[]>();

export const mockListQualityReviews = async (
  id: string,
  viewerUserId?: string,
  viewerRole?: Role,
): Promise<QualityReviewListResponse> => {
  await mockDelay();
  await mockGetMyTaskById(id, viewerUserId, viewerRole);
  return { items: mockQualityReviewsByTask.get(id) ?? [] };
};

export const mockCreateQualityReview = async (
  id: string,
  payload: CreateQualityReviewRequest,
  editorUserId?: string,
  editorUserName?: string,
): Promise<QualityReview> => {
  await mockDelay();
  await mockGetMyTaskById(id, editorUserId);
  if (editorUserId && !canEvaluateTask(editorUserId)) {
    throw new Error('Employees cannot update task revisions');
  }

  const item: QualityReview = {
    id: `qr-mock-${Date.now()}`,
    taskId: id,
    reviewerId: editorUserId ?? 'unknown',
    reviewerName: editorUserName?.trim() || 'Reviewer',
    revisionCount: payload.revisionCount,
    comment: payload.comment ?? '',
    createdAt: new Date().toISOString(),
  };
  const existing = mockQualityReviewsByTask.get(id) ?? [];
  mockQualityReviewsByTask.set(id, [item, ...existing]);
  return item;
};

export const mockListRevisionTasks = async (
  parentId: string,
  viewerUserId?: string,
  viewerRole?: Role,
): Promise<RevisionListResponse> => {
  await mockDelay();
  await mockGetMyTaskById(parentId, viewerUserId, viewerRole);
  const items = getDirectRevisionChildren(parentId, getMockTasksStore()).map((task) =>
    enrichMockTaskWithProjectContext(task),
  );
  return { items, total: items.length };
};

export const mockCreateRevisionTask = async (
  parentId: string,
  payload: CreateRevisionRequest,
  editorUserId?: string,
): Promise<MyTask> => {
  await mockDelay();
  const parent = await mockGetMyTaskById(parentId, editorUserId);
  const canEvaluate = editorUserId ? canEvaluateTask(editorUserId) : false;
  const store = getMockTasksStore();
  const existingRevisions = getDirectRevisionChildren(parentId, store);

  const blockReason = getRequestRevisionBlockReason(parent, existingRevisions, canEvaluate);
  if (blockReason) {
    throw new Error(REQUEST_REVISION_BLOCK_MESSAGES[blockReason]);
  }

  // Option A: no max vs parent quantity — only > 0 (expanded scope is allowed).
  assertRevisionQuantity(payload.quantity);
  if (!isRevisionDeadlineOnOrAfterWorkDate(payload.date, payload.deadline)) {
    throw new Error(REVISION_DEADLINE_BEFORE_WORK_DATE_MESSAGE);
  }

  const round = getNextRevisionRound(parentId, store);
  const now = new Date().toISOString();
  const dateStart = normalizeTaskDateStart(payload.date);
  const deadline = payload.deadline.includes('T')
    ? payload.deadline
    : normalizeTaskDateEnd(payload.deadline);

  // Assignee locked to parent staff — reassignment not supported yet.
  const staff = parent.staff.map((member) => ({ ...member }));

  const revision: MyTask = enrichMockTaskWithProjectContext({
    ...parent,
    id: `task-rev-${Date.now()}`,
    taskCode: `${parent.taskCode}-R${round}`,
    taskName: parent.taskName,
    description: payload.revisionReason.trim(),
    quantity: payload.quantity,
    level: payload.level,
    date: dateStart,
    deadline,
    creativeDeadline: parent.creativeDeadline ?? deadline,
    staff,
    parentTaskId: parent.id,
    taskKind: 'revision',
    revisionRound: round,
    revisionReason: payload.revisionReason.trim(),
    pipelineStage: 'assigned_staff',
    assignedAt: now,
    staffConfirmation: 'not_updated',
    staffNote: '',
    completionPercent: null,
    pmEvaluation: '',
    pmNote: '',
    overtimeRequestId: undefined,
    actualHours: null,
    updatedAt: now,
    completedAt: undefined,
  });

  setMockTasksStore([revision, ...store]);
  return revision;
};

export const mockGetMyTaskProjectOptions = async (
  assigneeUserId?: string,
  taskCategory?: MyTask['taskCategory'],
  viewerRole?: Role,
): Promise<string[]> => {
  await mockDelay();
  const projects = new Set(
    filterMockTasks(getMockTasksStore(), { taskCategory }, assigneeUserId, viewerRole).map(
      (task) => task.projectName,
    ),
  );
  return [...projects].sort((a, b) => a.localeCompare(b));
};

export const mockGetMyTaskStaffNameOptions = async (
  assigneeUserId?: string,
  taskCategory?: MyTask['taskCategory'],
  viewerRole?: Role,
): Promise<string[]> => {
  await mockDelay();
  const names = new Set<string>();
  let hasUnassigned = false;

  for (const task of filterMockTasks(
    getMockTasksStore(),
    { taskCategory },
    assigneeUserId,
    viewerRole,
  )) {
    if (task.staff.length === 0) {
      hasUnassigned = true;
      continue;
    }
    for (const member of task.staff) {
      names.add(member.name);
    }
  }

  const options = [...names].sort((a, b) => a.localeCompare(b));
  if (hasUnassigned) options.unshift(UNASSIGNED_STAFF_LABEL);
  return options;
};

export const mockGetAllTaskProjectOptions = async (
  taskCategory?: MyTask['taskCategory'],
): Promise<string[]> => {
  await mockDelay();
  const projects = new Set(
    getMockTasksStore()
      .filter((task) => !taskCategory || task.taskCategory === taskCategory)
      .map((task) => task.projectName),
  );
  return [...projects].sort((a, b) => a.localeCompare(b));
};

export const mockGetMyTaskPmOptions = async (): Promise<
  { code: string; name: string; userId?: string }[]
> => {
  await mockDelay();
  const seen = new Map<string, { code: string; name: string; userId?: string }>();

  const upsert = (entry: { code: string; name: string; userId?: string | null }) => {
    if (!entry.code) return;
    const existing = seen.get(entry.code);
    seen.set(entry.code, {
      code: entry.code,
      name: entry.name,
      userId: entry.userId ?? existing?.userId,
    });
  };

  for (const user of getMockUsersStore()) {
    if (user.role === ROLES.EMPLOYEE || user.status !== 'active') continue;
    const local = user.email.split('@')[0] ?? user.email;
    upsert({ code: local.toUpperCase(), name: user.name, userId: user.id });
  }

  for (const user of DEV_MOCK_USERS) {
    if (user.role === ROLES.EMPLOYEE) continue;
    const local = user.email.split('@')[0] ?? user.email;
    upsert({ code: local.toUpperCase(), name: user.name, userId: `dev-${user.role}` });
  }

  for (const pm of MOCK_PROJECT_MANAGERS) {
    upsert(pm);
  }
  for (const task of getMockTasksStore()) {
    upsert(task.projectManager);
  }

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
};

const collectUniqueStaff = (members: TaskAssignee[]): TaskAssignee[] => {
  const seen = new Map<string, TaskAssignee>();
  for (const staff of members) {
    if (!staff.code) continue;
    seen.set(staff.userId ?? staff.code, staff);
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const mockGetStaffOptions = async (): Promise<TaskAssignee[]> => {
  await mockDelay();
  const members: TaskAssignee[] = [];
  for (const task of getMockTasksStore()) {
    members.push(...task.staff);
  }
  return collectUniqueStaff([...MOCK_ASSIGNABLE_STAFF, ...members]);
};

export const mockGetProjectStaffOptions = async (projectName: string): Promise<TaskAssignee[]> => {
  void projectName;
  return mockGetStaffOptions();
};

const generateTaskCode = (pmCode: string, projectName: string): string => {
  const seq = String(getMockTasksStore().length + 1).padStart(2, '0');
  const slug =
    projectName
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 12)
      .toUpperCase() || 'PROJECT';
  return `${pmCode}.${seq} - ${slug}`;
};

export const mockCreateMyTask = async (
  payload: CreateMyTaskRequest,
  creatorUserId?: string,
  creatorUserName?: string,
): Promise<MyTask> => {
  await mockDelay();

  if (!creatorUserId || !creatorUserName) {
    throw new Error('You must be logged in to create a task');
  }

  const role = creatorUserId ? deriveDevRoleFromUserId(creatorUserId) : undefined;
  if (role && !roleHasDefaultPermission(role, 'CREATE_TASK')) {
    throw new Error('Only a Project Manager or Admin can create tasks');
  }

  if (payload.assignDirection === 'project_staff' && payload.staff.length !== 1) {
    throw new Error('Select an assignable staff member');
  }
  if (payload.staff.some((member) => !isStaffAssignable(member.availability))) {
    throw new Error('Cannot assign a task to an on-leave staff member');
  }

  const now = new Date().toISOString();
  const level = computeTaskLevel(
    payload.designThinking,
    payload.technical,
    payload.contentProcessing,
  );
  const newTask = enrichMockTaskWithProjectContext({
    id: `task-${Date.now()}`,
    taskCategory: payload.taskCategory,
    taskCode: generateTaskCode(payload.projectManager.code, payload.projectName),
    projectName: payload.projectName,
    projectManager: payload.projectManager,
    taskName: payload.taskName,
    level,
    quantity: payload.quantity,
    date: normalizeTaskDateStart(payload.date),
    deadline: normalizeTaskDateEnd(payload.date),
    creativeDeadline: payload.creativeDeadline,
    description: payload.description,
    department: payload.department,
    staff: payload.staff,
    designThinking: payload.designThinking,
    technical: payload.technical,
    contentProcessing: payload.contentProcessing,
    additionalFactors: payload.additionalFactors,
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: payload.staffConfirmation,
    staffNote: payload.staffNote,
    urgency: payload.urgency,
    workflowKind: payload.workflowKind,
    assignDirection: payload.assignDirection,
    assignedAt: payload.staff.length > 0 && !isCreativeHandoffPayload(payload) ? now : undefined,
    pipelineStage: resolveCreatePipelineStage(payload),
    briefOwner: resolveCreateBriefOwner(payload),
    createdById: creatorUserId,
    updatedAt: now,
  });

  setMockTasksStore([newTask, ...getMockTasksStore()]);
  return newTask;
};

const canEditTask = (task: MyTask, editorUserId?: string): boolean => {
  if (!editorUserId) return false;
  if (canViewAllTasks(editorUserId)) return true;
  const assigneeIds = task.staff.map((member) => member.userId).filter(Boolean);
  if (assigneeIds.length === 0) return true;
  return assigneeIds.includes(editorUserId);
};

const resolveEditorRole = (editorUserId?: string): Role | undefined =>
  editorUserId ? deriveDevRoleFromUserId(editorUserId) : undefined;

const assertCanChangeCancelledStatus = (
  current: MyTask,
  nextConfirmation: MyTask['staffConfirmation'],
  editorUserId?: string,
): void => {
  const role = resolveEditorRole(editorUserId);
  if (
    nextConfirmation === 'cancelled' &&
    current.staffConfirmation !== 'cancelled' &&
    role === ROLES.EMPLOYEE
  ) {
    throw new Error('Employees cannot cancel tasks');
  }
  if (current.staffConfirmation !== 'cancelled') return;
  if (nextConfirmation === 'cancelled') return;
  if (role === ROLES.ADMIN) return;
  throw new Error('Only an admin can change status of a cancelled task');
};

export const mockUpdateMyTask = async (
  id: string,
  payload: UpdateMyTaskRequest,
  editorUserId?: string,
): Promise<MyTask> => {
  await mockDelay();

  const tasks = getMockTasksStore();
  const index = tasks.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const current = tasks[index];
  if (!canEditTask(current, editorUserId)) {
    throw new Error('You do not have permission to edit this task');
  }
  assertCanChangeCancelledStatus(current, payload.staffConfirmation, editorUserId);

  if (current.pipelineStage === 'awaiting_ch' && current.briefOwner === 'pm') {
    if (
      payload.description !== current.description ||
      payload.designThinking !== current.designThinking ||
      payload.technical !== current.technical ||
      payload.contentProcessing !== current.contentProcessing
    ) {
      throw new Error('Brief từ PM đã khóa — Creative Head chỉ assign cho CM');
    }
  }
  if (current.pipelineStage === 'awaiting_cm' || current.pipelineStage === 'assigned_staff') {
    if (
      payload.designThinking !== current.designThinking ||
      payload.technical !== current.technical ||
      payload.contentProcessing !== current.contentProcessing
    ) {
      throw new Error('Task Level đã được CH phân loại — Creative Manager không được đổi');
    }
  }

  const level = computeTaskLevel(
    payload.designThinking,
    payload.technical,
    payload.contentProcessing,
  );

  const updated: MyTask = {
    ...current,
    taskName: payload.taskName,
    quantity: payload.quantity,
    date: normalizeTaskDateStart(payload.date),
    deadline: normalizeTaskDateEnd(payload.date),
    creativeDeadline: payload.creativeDeadline ?? current.creativeDeadline,
    description: payload.description,
    designThinking: payload.designThinking,
    technical: payload.technical,
    contentProcessing: payload.contentProcessing,
    additionalFactors: payload.additionalFactors,
    level,
    staff: payload.staff,
    staffConfirmation: payload.staffConfirmation,
    staffNote: payload.staffNote,
    urgency:
      payload.staffConfirmation === 'finished' || payload.staffConfirmation === 'cancelled'
        ? 'gray'
        : payload.urgency,
    updatedAt: new Date().toISOString(),
  };

  const next = [...tasks];
  next[index] = updated;
  setMockTasksStore(next);
  if (shouldPromoteProjectFromConfirmation(updated.staffConfirmation)) {
    promoteMockProjectInProgressIfNeeded(updated.projectName);
  }
  return enrichMockTaskWithProjectContext(updated);
};

export const mockUpdateHeadMyTask = async (
  id: string,
  payload: UpdateHeadMyTaskRequest,
  editorUserId?: string,
): Promise<MyTask> => {
  await mockDelay();

  const tasks = getMockTasksStore();
  const index = tasks.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const current = tasks[index];
  if (!canEditTask(current, editorUserId)) {
    throw new Error('You do not have permission to edit this task');
  }

  const projectLevel = computeProjectLevel(
    payload.projectVolume,
    payload.projectNature,
    payload.projectTime,
  );

  const updated: MyTask = {
    ...current,
    projectStartDate: payload.projectStartDate,
    projectEndDate: payload.projectEndDate,
    projectBrief: payload.projectBrief,
    projectVolume: payload.projectVolume,
    projectNature: payload.projectNature,
    projectTime: payload.projectTime,
    projectLevel,
    additionalFactors: payload.additionalFactors,
    pmEvaluation: payload.pmEvaluation,
    pmNote: payload.pmNote,
    projectStatus: payload.projectStatus,
    projectFinishedDate:
      payload.projectStatus === 'finish'
        ? (payload.projectFinishedDate ?? current.projectFinishedDate ?? new Date().toISOString())
        : undefined,
    urgency: payload.urgency,
    updatedAt: new Date().toISOString(),
  };

  const next = [...tasks];
  next[index] = updated;
  setMockTasksStore(next);
  return enrichMockTaskWithProjectContext(updated);
};

export const mockAssignMyTask = async (
  id: string,
  payload: AssignMyTaskRequest,
  editorUserId?: string,
): Promise<MyTask> => {
  await mockDelay();

  if (!canAssignTask(editorUserId)) {
    throw new Error('You do not have permission to assign this task');
  }

  const tasks = getMockTasksStore();
  const index = tasks.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const updated: MyTask = {
    ...tasks[index],
    staff: payload.staff,
    staffNote: payload.staffNote,
    staffConfirmation: 'not_updated',
    updatedAt: new Date().toISOString(),
  };

  const next = [...tasks];
  next[index] = updated;
  setMockTasksStore(next);
  return updated;
};

export const mockUpdateMyTaskStatus = async (
  id: string,
  payload: UpdateMyTaskStatusRequest,
  editorUserId?: string,
): Promise<MyTask> => {
  await mockDelay();

  const tasks = getMockTasksStore();
  const index = tasks.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const current = tasks[index];
  if (!canEditTask(current, editorUserId)) {
    throw new Error('You do not have permission to update this task status');
  }
  assertCanChangeCancelledStatus(current, payload.staffConfirmation, editorUserId);

  if (
    payload.staffConfirmation === 'decline' &&
    current.staffConfirmation !== 'decline' &&
    current.staffConfirmation !== 'not_updated' &&
    current.taskKind !== 'revision' &&
    typeof current.department === 'string' &&
    (current.department === 'creative' || current.department.startsWith('creative_'))
  ) {
    throw new Error('Chỉ từ chối task Creative khi trạng thái còn Chưa cập nhật');
  }

  let updated: MyTask = {
    ...current,
    staffConfirmation: payload.staffConfirmation,
    staffNote: payload.staffNote,
    urgency:
      payload.staffConfirmation === 'finished' || payload.staffConfirmation === 'cancelled'
        ? ('gray' as const)
        : current.urgency,
    updatedAt: new Date().toISOString(),
  };

  if (payload.staffConfirmation === 'decline' && current.staffConfirmation !== 'decline') {
    updated = applyCreativeDeclineRollback(updated);
  }

  const next = [...tasks];
  next[index] = updated;
  setMockTasksStore(next);
  if (shouldPromoteProjectFromConfirmation(updated.staffConfirmation)) {
    promoteMockProjectInProgressIfNeeded(updated.projectName);
  }
  return updated;
};

export const mockUpdateMyTaskPmEvaluation = async (
  id: string,
  payload: UpdateMyTaskPmEvaluationRequest,
  editorUserId?: string,
): Promise<MyTask> => {
  await mockDelay();

  if (!canUpdatePmEvaluation(editorUserId)) {
    throw new Error('You do not have permission to evaluate this task');
  }

  const tasks = getMockTasksStore();
  const index = tasks.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const role = editorUserId ? deriveDevRoleFromUserId(editorUserId) : undefined;
  if (role && !canEvaluateTaskLayer(role, tasks[index])) {
    throw new Error('Bạn không được đánh giá task ở tầng này');
  }

  const updated: MyTask = {
    ...tasks[index],
    completionPercent: payload.completionPercent,
    pmEvaluation: payload.pmEvaluation,
    pmNote: payload.pmNote,
    updatedAt: new Date().toISOString(),
  };

  const next = [...tasks];
  next[index] = updated;
  setMockTasksStore(next);
  return updated;
};

export const mockAssignCreativeHead = async (
  id: string,
  payload: AssignCreativeHeadRequest,
  editorUserId?: string,
): Promise<MyTask> => {
  await mockDelay();

  const role = resolveEditorRole(editorUserId);
  if (!canProcessChQueue(role)) {
    throw new Error('Chỉ Creative Head mới assign task cho Creative Manager');
  }

  const tasks = getMockTasksStore();
  const index = tasks.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const current = tasks[index];
  if (!isAwaitingCh(current)) {
    throw new Error('Task này đã được Creative Head khác xử lý');
  }

  const cm = filterCreativeManagers(MOCK_ASSIGNABLE_STAFF).find(
    (member) => (member.userId ?? member.code) === payload.cmUserId,
  );
  if (!cm) {
    throw new Error('Chọn Creative Manager hợp lệ');
  }
  if (!isStaffAssignable(cm.availability)) {
    throw new Error('Không thể giao cho CM đang nghỉ phép');
  }

  let description = current.description;
  let designThinking = current.designThinking;
  let technical = current.technical;
  let contentProcessing = current.contentProcessing;
  let urgency = current.urgency;

  if (needsChBrief(current)) {
    const brief = payload.description?.trim() ?? '';
    if (!brief) {
      throw new Error('Creative Head cần fill brief trước khi assign CM');
    }
    if (
      payload.designThinking == null ||
      payload.technical == null ||
      payload.contentProcessing == null
    ) {
      throw new Error('Phân loại đủ 3 tiêu chí độ khó');
    }
    description = brief;
    designThinking = payload.designThinking;
    technical = payload.technical;
    contentProcessing = payload.contentProcessing;
    if (payload.urgency != null) {
      urgency = payload.urgency;
    }
  }

  const updated: MyTask = {
    ...current,
    description,
    designThinking,
    technical,
    contentProcessing,
    level: computeTaskLevel(designThinking, technical, contentProcessing),
    staff: [cm],
    creativeManager: { code: cm.code, name: cm.name, userId: cm.userId },
    pipelineStage: 'awaiting_cm',
    cmNote: payload.cmNote ?? '',
    staffConfirmation: 'not_updated',
    urgency,
    creativeDeadline:
      payload.creativeDeadline ?? current.creativeDeadline ?? current.deadline ?? current.date,
    updatedAt: new Date().toISOString(),
  };

  const next = [...tasks];
  next[index] = updated;
  setMockTasksStore(next);
  return enrichMockTaskWithProjectContext(updated);
};

export const mockAssignCreativeManager = async (
  id: string,
  payload: AssignCreativeManagerRequest,
  editorUserId?: string,
): Promise<MyTask> => {
  await mockDelay();

  const role = resolveEditorRole(editorUserId);
  if (!canProcessCmQueue(role)) {
    throw new Error('Chỉ Creative Manager mới giao task cho Staff');
  }

  const tasks = getMockTasksStore();
  const index = tasks.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const current = tasks[index];
  if (current.pipelineStage !== 'awaiting_cm') {
    throw new Error('Task này không còn chờ Creative Manager xử lý');
  }
  if (role === ROLES.CREATIVE_MANAGER && editorUserId) {
    const assignedToEditor =
      current.staff.some((member) => member.userId === editorUserId) ||
      current.creativeManager?.userId === editorUserId;
    if (!assignedToEditor) {
      throw new Error('Task này được giao cho Creative Manager khác');
    }
  }

  const staffPool = filterCreativeAssignableExecutors(
    [...MOCK_ASSIGNABLE_STAFF, ...tasks.flatMap((task) => task.staff)],
    role,
    editorUserId,
  );
  const now = new Date().toISOString();

  if (payload.mode === 'whole') {
    const staff = resolveStaffFromUserId(payload.staffUserId, staffPool);
    const assignee = staff[0];
    if (!assignee) {
      throw new Error('Chọn Staff nhận task');
    }
    if (!isStaffAssignable(assignee.availability)) {
      throw new Error('Không thể giao cho nhân viên đang nghỉ phép');
    }
    if (payload.quantity == null || payload.quantity <= 0) {
      throw new Error('CM nhập số lượng trước khi giao');
    }

    const updated: MyTask = {
      ...current,
      staff,
      quantity: payload.quantity,
      pipelineStage: 'assigned_staff',
      assignedAt: now,
      staffConfirmation: 'not_updated',
      staffNote: payload.staffNote ?? current.staffNote,
      creativeDeadline:
        payload.creativeDeadline || current.creativeDeadline || current.deadline || current.date,
      updatedAt: now,
    };
    const next = [...tasks];
    next[index] = updated;
    setMockTasksStore(next);
    return enrichMockTaskWithProjectContext(updated);
  }

  const subtasks = payload.subtasks ?? [];
  if (subtasks.length < 2) {
    throw new Error('Chia nhỏ cần ít nhất 2 task');
  }
  for (const subtask of subtasks) {
    if (!subtask.description?.trim()) {
      throw new Error('Mỗi task nhỏ cần brief');
    }
  }

  const children: MyTask[] = subtasks.map((subtask, offset) => {
    const staff = resolveStaffFromUserId(subtask.staffUserId, staffPool);
    const assignee = staff[0];
    if (!assignee) {
      throw new Error('Mỗi task nhỏ cần một Staff hợp lệ');
    }
    if (!isStaffAssignable(assignee.availability)) {
      throw new Error('Không thể giao cho nhân viên đang nghỉ phép');
    }

    return enrichMockTaskWithProjectContext({
      ...current,
      id: `task-${Date.now()}-${offset}`,
      taskCode: `${current.taskCode}-S${offset + 1}`,
      taskName: subtask.name.trim(),
      description: subtask.description?.trim() ?? current.description,
      quantity: subtask.quantity,
      staff,
      parentTaskId: current.id,
      taskKind: 'split',
      pipelineStage: 'assigned_staff',
      assignedAt: now,
      staffConfirmation: 'not_updated',
      staffNote: payload.staffNote ?? '',
      creativeDeadline:
        subtask.creativeDeadline || current.creativeDeadline || current.deadline || current.date,
      urgency: current.urgency,
      updatedAt: now,
    });
  });

  // Parent stays CM-owned for queue access; staff list mirrors unique child assignees for UI.
  const uniqueChildStaff: TaskAssignee[] = [];
  const seenStaff = new Set<string>();
  for (const child of children) {
    for (const member of child.staff) {
      const key = member.userId ?? member.code;
      if (!key || seenStaff.has(key)) continue;
      seenStaff.add(key);
      uniqueChildStaff.push(member);
    }
  }

  const parent: MyTask = {
    ...current,
    quantity: children.reduce((sum, child) => sum + child.quantity, 0),
    pipelineStage: 'split',
    staff: uniqueChildStaff,
    assignedAt: undefined,
    updatedAt: now,
  };

  const next = [...tasks];
  next[index] = parent;
  setMockTasksStore([...children, ...next]);
  return enrichMockTaskWithProjectContext(parent);
};

export const mockUpdateCreativePipeline = async (
  id: string,
  payload: UpdateCreativePipelineRequest,
  editorUserId?: string,
  editorRole?: Role,
): Promise<MyTask> => {
  await mockDelay();
  const tasks = getMockTasksStore();
  const index = tasks.findIndex((entry) => entry.id === id);
  if (index < 0) throw new Error('Task not found');
  const current = tasks[index];

  if (!canEditCreativePipelineTask(current, editorRole, editorUserId)) {
    throw new Error('Bạn không có quyền sửa task này');
  }

  const wantsLevel =
    payload.designThinking != null ||
    payload.technical != null ||
    payload.contentProcessing != null;
  if (wantsLevel) {
    if (!canChangeCreativeLevelRole(editorRole)) {
      throw new Error('Creative Manager không được đổi Level');
    }
    if (isCreativeLevelLockedByStaffConfirm(current)) {
      throw new Error('Task này staff đã confirm rồi nên không đổi level được');
    }
    if (
      payload.designThinking == null ||
      payload.technical == null ||
      payload.contentProcessing == null
    ) {
      throw new Error('Cần đủ 3 tiêu chí để đổi Level');
    }
  }

  let staff = current.staff;
  let staffConfirmation = current.staffConfirmation;
  let assignedAt = current.assignedAt;
  let creativeManager = current.creativeManager;

  if (payload.cmUserId) {
    if (!canReassignCreativeManager(current, editorRole)) {
      throw new Error('Chỉ đổi CM khi task đang chờ Creative Manager (CH/Admin)');
    }
    if (payload.staffUserId) {
      throw new Error('Không đổi CM và Staff trong cùng một lần lưu');
    }
    const nextCm = filterCreativeManagers(MOCK_ASSIGNABLE_STAFF).find(
      (member) => member.userId === payload.cmUserId,
    );
    if (!nextCm) throw new Error('Creative Manager not found');
    staff = [nextCm];
    creativeManager = { code: nextCm.code, name: nextCm.name, userId: nextCm.userId };
  } else if (payload.staffUserId) {
    if (!canReassignCreativeStaff(current, editorRole)) {
      throw new Error('Chỉ đổi Staff khi task đã giao Staff');
    }
    const nextStaff = filterCreativeStaff(MOCK_ASSIGNABLE_STAFF).find(
      (member) => member.userId === payload.staffUserId,
    );
    if (!nextStaff) throw new Error('Staff user not found');
    staff = [nextStaff];
    staffConfirmation = 'not_updated';
    assignedAt = new Date().toISOString();
  }

  const designThinking = wantsLevel ? payload.designThinking! : current.designThinking;
  const technical = wantsLevel ? payload.technical! : current.technical;
  const contentProcessing = wantsLevel ? payload.contentProcessing! : current.contentProcessing;

  const wantsPMSchedule = payload.deadline !== undefined || payload.urgency !== undefined;
  if (wantsPMSchedule && !canEditCreativeScheduleMeta(editorRole)) {
    throw new Error('Chỉ Admin / PM được sửa deadline PM và urgency');
  }
  const wantsCreativeDeadline = payload.creativeDeadline !== undefined;
  if (wantsCreativeDeadline && !canEditCreativeDeadline(editorRole)) {
    throw new Error('Không có quyền sửa creative deadline');
  }

  const stage = resolveEffectivePipelineStage(current);
  const isSplitChild = isSplitChildTask(current);

  if (payload.quantity != null && stage === 'split') {
    throw new Error('SL tổng của task chia nhỏ đã khoá — chỉnh từng task nhỏ cho khớp tổng');
  }
  if (payload.quantity != null && isSplitChild) {
    throw new Error('Đổi SL task nhỏ qua childQuantities (đủ các phần, tổng khớp SL gốc)');
  }
  if (payload.staffUserId && isSplitChild && current.staffConfirmation === 'confirmed') {
    throw new Error('Task nhỏ đã confirm — không đổi Staff / SL');
  }

  if (payload.childQuantities?.length) {
    const parentId = stage === 'split' ? current.id : isSplitChild ? current.parentTaskId! : null;
    if (!parentId) {
      throw new Error('childQuantities chỉ dùng cho task chia nhỏ');
    }
    const parent = stage === 'split' ? current : tasks.find((entry) => entry.id === parentId);
    if (!parent) {
      throw new Error('Không tìm thấy task gốc');
    }
    const siblings = tasks.filter(
      (entry) => entry.parentTaskId === parentId && entry.taskKind !== 'revision',
    );
    const nextQty = new Map(siblings.map((child) => [child.id, child.quantity]));
    for (const row of payload.childQuantities) {
      if (!nextQty.has(row.id)) {
        throw new Error('childQuantities chứa task nhỏ không thuộc task này');
      }
      const sibling = siblings.find((child) => child.id === row.id)!;
      if (row.quantity <= 0) {
        throw new Error('Số lượng task nhỏ phải lớn hơn 0');
      }
      const qtyUnchanged = Math.abs(row.quantity - sibling.quantity) <= 1e-6;
      if (
        !qtyUnchanged &&
        (sibling.staffConfirmation === 'confirmed' ||
          sibling.staffConfirmation === 'finished' ||
          sibling.staffConfirmation === 'cancelled')
      ) {
        throw new Error('Không đổi SL task nhỏ đã confirm / finish / huỷ');
      }
      nextQty.set(row.id, row.quantity);
    }
    const sum = [...nextQty.values()].reduce((total, qty) => total + qty, 0);
    if (Math.abs(sum - parent.quantity) > 1e-6) {
      throw new Error(`Tổng SL các phần (${sum}) phải bằng SL tổng (${parent.quantity})`);
    }
    const next = [...tasks];
    for (const [id, quantity] of nextQty) {
      const idx = next.findIndex((entry) => entry.id === id);
      if (idx < 0) continue;
      if (next[idx].quantity === quantity) continue;
      next[idx] = {
        ...next[idx],
        quantity,
        updatedAt: new Date().toISOString(),
      };
    }
    setMockTasksStore(next);
  }

  const storeAfterQty = getMockTasksStore();
  const indexAfterQty = storeAfterQty.findIndex((entry) => entry.id === id);
  const currentAfterQty = indexAfterQty >= 0 ? storeAfterQty[indexAfterQty] : current;

  // Mirror BE normalizeTaskDates: PM deadline change also moves calendar TaskDate.
  const nextDeadline =
    payload.deadline === undefined || payload.deadline === null || payload.deadline === ''
      ? undefined
      : payload.deadline;
  const nextDate = nextDeadline ? normalizeTaskDateStart(nextDeadline) : currentAfterQty.date;

  const updated: MyTask = {
    ...currentAfterQty,
    description: payload.description ?? currentAfterQty.description,
    additionalFactors: payload.additionalFactors ?? currentAfterQty.additionalFactors,
    quantity: payload.quantity ?? currentAfterQty.quantity,
    date: nextDate,
    deadline: nextDeadline ?? currentAfterQty.deadline,
    creativeDeadline:
      payload.creativeDeadline === undefined
        ? currentAfterQty.creativeDeadline
        : payload.creativeDeadline || null,
    urgency:
      payload.urgency != null
        ? normalizeTaskUrgencySetting(payload.urgency)
        : currentAfterQty.urgency,
    staffNote: payload.staffNote ?? currentAfterQty.staffNote,
    designThinking,
    technical,
    contentProcessing,
    level: wantsLevel
      ? computeTaskLevel(designThinking, technical, contentProcessing)
      : currentAfterQty.level,
    staff,
    creativeManager,
    staffConfirmation,
    assignedAt,
    pipelineStage:
      resolveEffectivePipelineStage(currentAfterQty) === 'assigned_staff' || payload.staffUserId
        ? 'assigned_staff'
        : currentAfterQty.pipelineStage,
    updatedAt: new Date().toISOString(),
  };

  const nextRows = [...storeAfterQty];
  nextRows[indexAfterQty >= 0 ? indexAfterQty : index] = updated;
  setMockTasksStore(nextRows);
  return enrichMockTaskWithProjectContext(updated);
};

export const mockDeleteMyTask = async (id: string, userId?: string): Promise<void> => {
  await mockDelay();

  if (!userId) {
    throw new Error('You must be logged in to delete a task');
  }

  const tasks = getMockTasksStore();
  if (!tasks.some((entry) => entry.id === id)) {
    throw new Error('Task not found');
  }

  setMockTasksStore(tasks.filter((entry) => entry.id !== id));
};
