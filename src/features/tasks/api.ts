/**
 * My Tasks API client.
 * Backend contract: docs/MY_TASKS_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';
import type { Role } from '@/config/permissions';
import { env } from '@/config/env';
import {
  AssignCreativeHeadRequestSchema,
  AssignCreativeManagerRequestSchema,
  AssignMyTaskRequestSchema,
  CreateMyTaskRequestSchema,
  CreateQualityReviewRequestSchema,
  MyTaskListFiltersSchema,
  MyTaskListResponseSchema,
  MyTaskSchema,
  QualityReviewListResponseSchema,
  QualityReviewSchema,
  TaskHistoryListResponseSchema,
  UpdateCreativePipelineRequestSchema,
  UpdateHeadMyTaskRequestSchema,
  UpdateMyTaskPmEvaluationRequestSchema,
  UpdateMyTaskRequestSchema,
  UpdateMyTaskStatusRequestSchema,
  type AssignCreativeHeadRequest,
  type AssignCreativeManagerRequest,
  type AssignMyTaskRequest,
  type CreateMyTaskRequest,
  type CreateQualityReviewRequest,
  type MyTask,
  type MyTaskListFilters,
  type MyTaskListResponse,
  type QualityReview,
  type QualityReviewListResponse,
  type TaskAssignee,
  type TaskHistoryListResponse,
  type TaskPerson,
  type UpdateCreativePipelineRequest,
  type UpdateHeadMyTaskRequest,
  type UpdateMyTaskPmEvaluationRequest,
  type UpdateMyTaskRequest,
  type UpdateMyTaskStatusRequest,
} from './schemas/task.schema';
import {
  mockAssignCreativeHead,
  mockAssignCreativeManager,
  mockAssignMyTask,
  mockCreateMyTask,
  mockCreateQualityReview,
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
  mockListQualityReviews,
  mockUpdateCreativePipeline,
  mockUpdateHeadMyTask,
  mockUpdateMyTask,
  mockUpdateMyTaskPmEvaluation,
  mockUpdateMyTaskStatus,
} from './mock/tasks.mock';

const parseMyTaskResponse = (data: unknown): MyTask => {
  const parsed = MyTaskSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Server returned an unexpected task payload. Refresh and try again.');
  }
  return parsed.data;
};

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
    const params = { ...MyTaskListFiltersSchema.parse(filters) };
    delete params.otOnly;

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

  listQualityReviews: async (id: string): Promise<QualityReviewListResponse> => {
    if (env.useTasksMock) {
      return QualityReviewListResponseSchema.parse(await mockListQualityReviews(id));
    }

    const response = await api.get(`/tasks/my/${id}/quality-reviews`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to load revision history'));
    });
    return QualityReviewListResponseSchema.parse(response.data);
  },

  createQualityReview: async (
    id: string,
    payload: CreateQualityReviewRequest,
    editorUserId?: string,
    editorUserName?: string,
  ): Promise<QualityReview> => {
    const data = CreateQualityReviewRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return QualityReviewSchema.parse(
        await mockCreateQualityReview(id, data, editorUserId, editorUserName),
      );
    }

    const response = await api
      .post(`/tasks/my/${id}/quality-reviews`, data)
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Failed to save revision'));
      });
    return QualityReviewSchema.parse(response.data);
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

  assignCreativeHead: async (
    id: string,
    payload: AssignCreativeHeadRequest,
    editorUserId?: string,
  ): Promise<MyTask> => {
    const data = AssignCreativeHeadRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return MyTaskSchema.parse(await mockAssignCreativeHead(id, data, editorUserId));
    }

    const response = await api.patch(`/tasks/my/${id}/assign-cm`, data).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không thể assign Creative Manager'));
    });
    return parseMyTaskResponse(response.data);
  },

  assignCreativeManager: async (
    id: string,
    payload: AssignCreativeManagerRequest,
    editorUserId?: string,
  ): Promise<MyTask> => {
    const data = AssignCreativeManagerRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return MyTaskSchema.parse(await mockAssignCreativeManager(id, data, editorUserId));
    }

    const response = await api
      .patch(`/tasks/my/${id}/assign-staff`, data)
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Không thể giao task cho Staff'));
      });
    return parseMyTaskResponse(response.data);
  },

  updateCreativePipeline: async (
    id: string,
    payload: UpdateCreativePipelineRequest,
    editorUserId?: string,
    editorRole?: Role,
  ): Promise<MyTask> => {
    const data = UpdateCreativePipelineRequestSchema.parse(payload);

    if (env.useTasksMock) {
      return MyTaskSchema.parse(
        await mockUpdateCreativePipeline(id, data, editorUserId, editorRole),
      );
    }

    const response = await api
      .patch(`/tasks/my/${id}/creative-edit`, data)
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Không thể cập nhật task Creative'));
      });
    return parseMyTaskResponse(response.data);
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

    const response = await api.post('/tasks/my', data).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không thể tạo task'));
    });
    return parseMyTaskResponse(response.data);
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
