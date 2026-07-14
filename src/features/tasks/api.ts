/**
 * My Tasks API client.
 * Backend contract: docs/MY_TASKS_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';
import type { Role } from '@/config/permissions';
import { env } from '@/config/env';
import {
  mockAssignMyTask,
  mockCreateMyTask,
  mockDeleteMyTask,
  mockGetAllTaskProjectOptions,
  mockGetMyTaskById,
  mockGetMyTaskHistory,
  mockGetMyTaskList,
  mockGetMyTaskPmOptions,
  mockGetMyTaskProjectOptions,
  mockGetMyTaskStaffNameOptions,
  mockGetProjectStaffOptions,
  mockGetStaffOptions,
  mockUpdateMyTask,
  mockUpdateHeadMyTask,
  mockUpdateMyTaskPmEvaluation,
  mockUpdateMyTaskStatus,
} from './mock/tasks.mock';
import {
  AssignMyTaskRequestSchema,
  CreateMyTaskRequestSchema,
  MyTaskListFiltersSchema,
  MyTaskListResponseSchema,
  MyTaskSchema,
  TaskHistoryListResponseSchema,
  UpdateMyTaskPmEvaluationRequestSchema,
  UpdateMyTaskRequestSchema,
  UpdateHeadMyTaskRequestSchema,
  UpdateMyTaskStatusRequestSchema,
  type AssignMyTaskRequest,
  type CreateMyTaskRequest,
  type MyTask,
  type TaskAssignee,
  type TaskPerson,
  type MyTaskListFilters,
  type MyTaskListResponse,
  type TaskHistoryListResponse,
  type UpdateMyTaskPmEvaluationRequest,
  type UpdateMyTaskRequest,
  type UpdateHeadMyTaskRequest,
  type UpdateMyTaskStatusRequest,
} from './schemas/task.schema';

/** `assignee` = projects from user's tasks (filters). `all` = broader list (create form). */
export type MyTaskProjectOptionsScope = 'assignee' | 'all';

export interface MyTaskProjectOptionsParams {
  assigneeUserId?: string;
  taskCategory?: MyTask['taskCategory'];
  scope?: MyTaskProjectOptionsScope;
  viewerRole?: Role;
}

export const myTaskApi = {
  getList: async (
    filters: MyTaskListFilters,
    assigneeUserId?: string,
    viewerRole?: Role,
  ): Promise<MyTaskListResponse> => {
    const params = MyTaskListFiltersSchema.parse(filters);

    if (env.useTasksMock) {
      return MyTaskListResponseSchema.parse(
        await mockGetMyTaskList(params, assigneeUserId, viewerRole),
      );
    }

    const response = await api.get('/tasks/my', { params }).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to load tasks'));
    });
    return MyTaskListResponseSchema.parse(response.data);
  },

  getById: async (id: string, viewerUserId?: string): Promise<MyTask> => {
    if (env.useTasksMock) {
      return MyTaskSchema.parse(await mockGetMyTaskById(id, viewerUserId));
    }

    const response = await api.get(`/tasks/my/${id}`);
    return MyTaskSchema.parse(response.data);
  },

  getHistory: async (id: string): Promise<TaskHistoryListResponse> => {
    if (env.useTasksMock) {
      return TaskHistoryListResponseSchema.parse(await mockGetMyTaskHistory(id));
    }

    const response = await api.get(`/tasks/my/${id}/history`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to load task history'));
    });
    return TaskHistoryListResponseSchema.parse(response.data);
  },

  getProjectOptions: async ({
    assigneeUserId,
    taskCategory,
    scope = 'assignee',
    viewerRole,
  }: MyTaskProjectOptionsParams = {}): Promise<string[]> => {
    if (env.useTasksMock) {
      if (scope === 'all') {
        return mockGetAllTaskProjectOptions(taskCategory);
      }
      return mockGetMyTaskProjectOptions(assigneeUserId, taskCategory, viewerRole);
    }

    const response = await api
      .get('/tasks/my/project-options', {
        params: { taskCategory, scope },
      })
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Failed to load project options'));
      });
    return response.data as string[];
  },

  getStaffNameOptions: async (
    assigneeUserId?: string,
    taskCategory?: MyTask['taskCategory'],
    viewerRole?: Role,
  ): Promise<string[]> => {
    if (env.useTasksMock) {
      return mockGetMyTaskStaffNameOptions(assigneeUserId, taskCategory, viewerRole);
    }

    const response = await api
      .get('/tasks/my/staff-name-options', {
        params: { taskCategory },
      })
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Failed to load staff options'));
      });
    return response.data as string[];
  },

  delete: async (id: string, userId?: string): Promise<void> => {
    if (env.useTasksMock) {
      return mockDeleteMyTask(id, userId);
    }

    await api.delete(`/tasks/my/${id}`);
  },

  update: async (
    id: string,
    payload: UpdateMyTaskRequest,
    editorUserId?: string,
  ): Promise<MyTask> => {
    const data = UpdateMyTaskRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return MyTaskSchema.parse(await mockUpdateMyTask(id, data, editorUserId));
    }

    const response = await api.patch(`/tasks/my/${id}`, data);
    return MyTaskSchema.parse(response.data);
  },

  updateHeadContext: async (
    id: string,
    payload: UpdateHeadMyTaskRequest,
    editorUserId?: string,
  ): Promise<MyTask> => {
    const data = UpdateHeadMyTaskRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return MyTaskSchema.parse(await mockUpdateHeadMyTask(id, data, editorUserId));
    }

    const response = await api.patch(`/tasks/my/${id}/head-context`, data);
    return MyTaskSchema.parse(response.data);
  },

  updateStatus: async (
    id: string,
    payload: UpdateMyTaskStatusRequest,
    editorUserId?: string,
  ): Promise<MyTask> => {
    const data = UpdateMyTaskStatusRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return MyTaskSchema.parse(await mockUpdateMyTaskStatus(id, data, editorUserId));
    }

    const response = await api.patch(`/tasks/my/${id}/status`, data);
    return MyTaskSchema.parse(response.data);
  },

  updatePmEvaluation: async (
    id: string,
    payload: UpdateMyTaskPmEvaluationRequest,
    editorUserId?: string,
  ): Promise<MyTask> => {
    const data = UpdateMyTaskPmEvaluationRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return MyTaskSchema.parse(await mockUpdateMyTaskPmEvaluation(id, data, editorUserId));
    }

    const response = await api.patch(`/tasks/my/${id}/pm-evaluation`, data);
    return MyTaskSchema.parse(response.data);
  },

  assign: async (
    id: string,
    payload: AssignMyTaskRequest,
    editorUserId?: string,
  ): Promise<MyTask> => {
    const data = AssignMyTaskRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return MyTaskSchema.parse(await mockAssignMyTask(id, data, editorUserId));
    }

    const response = await api.patch(`/tasks/my/${id}/assign`, data);
    return MyTaskSchema.parse(response.data);
  },

  remind: async (id: string): Promise<{ notifiedCount: number }> => {
    if (env.useTasksMock) {
      return { notifiedCount: 1 };
    }

    try {
      const response = await api.post(`/tasks/my/${id}/remind`);
      const data = response.data as { notifiedCount?: number };
      return { notifiedCount: data.notifiedCount ?? 0 };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to send reminder'));
    }
  },

  create: async (
    payload: CreateMyTaskRequest,
    creatorUserId?: string,
    creatorUserName?: string,
  ): Promise<MyTask> => {
    const data = CreateMyTaskRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return MyTaskSchema.parse(await mockCreateMyTask(data, creatorUserId, creatorUserName));
    }

    const response = await api.post('/tasks/my', data);
    return MyTaskSchema.parse(response.data);
  },

  getPmOptions: async (): Promise<TaskPerson[]> => {
    if (env.useTasksMock) {
      return mockGetMyTaskPmOptions();
    }

    const response = await api.get('/tasks/my/pm-options');
    return response.data as TaskPerson[];
  },

  getStaffOptions: async (): Promise<TaskAssignee[]> => {
    if (env.useTasksMock) {
      return mockGetStaffOptions();
    }

    const response = await api.get('/tasks/my/staff-options');
    return response.data as TaskAssignee[];
  },

  getProjectStaffOptions: async (projectName: string): Promise<TaskAssignee[]> => {
    if (env.useTasksMock) {
      return mockGetProjectStaffOptions(projectName);
    }

    const response = await api.get('/tasks/my/project-staff-options', {
      params: { projectName },
    });
    return response.data as TaskAssignee[];
  },
};
