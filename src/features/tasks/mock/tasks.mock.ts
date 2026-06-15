import { PERMISSIONS, ROLES, type Role } from '@/config/permissions';
import type {
  AssignMyTaskRequest,
  CreateMyTaskRequest,
  MyTask,
  MyTaskListFilters,
  MyTaskListResponse,
  TaskAssignee,
  UpdateHeadMyTaskRequest,
  UpdateMyTaskRequest,
  UpdateMyTaskPmEvaluationRequest,
  UpdateMyTaskStatusRequest,
  TaskHistoryListResponse,
} from '../schemas/task.schema';
import { UNASSIGNED_STAFF_LABEL } from '../constants';
import { buildFallbackTaskHistory } from '../utils/taskDetail';
import { normalizeTaskDateStart } from '../utils/taskDates';
import { computeTaskLevel } from '../utils/taskLevel';
import { enrichMockTaskWithProjectContext } from './mockTaskProjectEnrichment';
import { computeProjectLevel } from '@/features/projects/utils/projectLevel';
import {
  getMockTasksStore,
  MOCK_ASSIGNABLE_STAFF,
  MOCK_PROJECT_MANAGERS,
  setMockTasksStore,
} from './tasks.data';
import { mockDelay } from '@/shared/mock/mockDelay';

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

const filterTasks = (
  filters: MyTaskListFilters,
  assigneeUserId?: string,
  viewerRole?: Role,
): MyTaskListResponse['items'] => {
  const search = filters.search?.trim().toLowerCase();
  const viewAllTasks = canViewAllTasks(assigneeUserId, viewerRole);

  return getMockTasksStore().filter((task) => {
    if (assigneeUserId && !viewAllTasks) {
      const assigneeIds = task.staff.map((member) => member.userId).filter(Boolean);
      if (assigneeIds.length > 0 && !assigneeIds.includes(assigneeUserId)) {
        return false;
      }
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
  const items = filterTasks(filters, assigneeUserId, viewerRole).map(
    enrichMockTaskWithProjectContext,
  );
  return { items, total: items.length };
};

const canViewTask = (task: MyTask, viewerUserId?: string, viewerRole?: Role): boolean => {
  if (!viewerUserId) return false;
  if (canViewAllTasks(viewerUserId, viewerRole)) return true;
  const assigneeIds = task.staff.map((member) => member.userId).filter(Boolean);
  if (assigneeIds.length === 0) return true;
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
  return enrichMockTaskWithProjectContext(task);
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

export const mockGetMyTaskProjectOptions = async (
  assigneeUserId?: string,
  taskCategory?: MyTask['taskCategory'],
  viewerRole?: Role,
): Promise<string[]> => {
  await mockDelay();
  const projects = new Set(
    filterTasks({ taskCategory }, assigneeUserId, viewerRole).map((task) => task.projectName),
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

  for (const task of filterTasks({ taskCategory }, assigneeUserId, viewerRole)) {
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

export const mockGetMyTaskPmOptions = async (): Promise<{ code: string; name: string }[]> => {
  await mockDelay();
  const seen = new Map<string, string>();
  for (const pm of MOCK_PROJECT_MANAGERS) {
    seen.set(pm.code, pm.name);
  }
  for (const task of getMockTasksStore()) {
    seen.set(task.projectManager.code, task.projectManager.name);
  }
  return [...seen.entries()]
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
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

  const now = new Date().toISOString();
  const newTask: MyTask = {
    id: `task-${Date.now()}`,
    taskCategory: payload.taskCategory,
    taskCode: generateTaskCode(payload.projectManager.code, payload.projectName),
    projectName: payload.projectName,
    projectManager: payload.projectManager,
    taskName: payload.taskName,
    level: payload.level,
    quantity: payload.quantity,
    date: normalizeTaskDateStart(payload.date),
    description: payload.description,
    staff: payload.staff,
    designThinking: payload.designThinking,
    technical: payload.technical,
    contentProcessing: payload.contentProcessing,
    additionalFactors: payload.additionalFactors,
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: payload.staffConfirmation,
    staffNote: payload.staffNote,
    updatedAt: now,
  };

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
    description: payload.description,
    designThinking: payload.designThinking,
    technical: payload.technical,
    contentProcessing: payload.contentProcessing,
    additionalFactors: payload.additionalFactors,
    level,
    staff: payload.staff,
    staffConfirmation: payload.staffConfirmation,
    staffNote: payload.staffNote,
    updatedAt: new Date().toISOString(),
  };

  const next = [...tasks];
  next[index] = updated;
  setMockTasksStore(next);
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

  const updated: MyTask = {
    ...current,
    staffConfirmation: payload.staffConfirmation,
    staffNote: payload.staffNote,
    updatedAt: new Date().toISOString(),
  };

  const next = [...tasks];
  next[index] = updated;
  setMockTasksStore(next);
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
