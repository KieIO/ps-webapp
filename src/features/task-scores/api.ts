/**
 * Backend contract: docs/TASK_SCORES_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { env } from '@/config/env';
import {
  mockCreateTaskScoreGroup,
  mockDeleteTaskScoreGroup,
  mockGetTaskScoreGroupList,
} from './mock/taskScoreGroups.mock';
import {
  mockCreateTaskScore,
  mockGetTaskScoreList,
  mockUpdateTaskScore,
} from './mock/taskScores.mock';
import {
  CreateTaskScoreRequestSchema,
  TaskScoreListFiltersSchema,
  TaskScoreListResponseSchema,
  TaskScoreSchema,
  UpdateTaskScoreRequestSchema,
  type CreateTaskScoreRequest,
  type TaskScore,
  type TaskScoreListFilters,
  type TaskScoreListResponse,
  type UpdateTaskScoreRequest,
} from './schemas/taskScore.schema';
import {
  CreateTaskScoreGroupRequestSchema,
  TaskScoreGroupListResponseSchema,
  TaskScoreGroupRecordSchema,
  type CreateTaskScoreGroupRequest,
  type TaskScoreGroupListResponse,
  type TaskScoreGroupRecord,
} from './schemas/taskScoreGroup.schema';

export const taskScoreApi = {
  getGroups: async (): Promise<TaskScoreGroupListResponse> => {
    if (env.useTaskScoresMock) {
      return TaskScoreGroupListResponseSchema.parse(await mockGetTaskScoreGroupList());
    }

    const response = await api.get('/task-score-groups');
    return TaskScoreGroupListResponseSchema.parse(response.data);
  },

  createGroup: async (payload: CreateTaskScoreGroupRequest): Promise<TaskScoreGroupRecord> => {
    const data = CreateTaskScoreGroupRequestSchema.parse(payload);

    if (env.useTaskScoresMock) {
      return TaskScoreGroupRecordSchema.parse(await mockCreateTaskScoreGroup(data));
    }

    try {
      const response = await api.post('/task-score-groups', data);
      return TaskScoreGroupRecordSchema.parse(response.data);
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Failed to create group'));
    }
  },

  deleteGroup: async (id: string): Promise<void> => {
    if (env.useTaskScoresMock) {
      await mockDeleteTaskScoreGroup(id);
      return;
    }

    try {
      await api.delete(`/task-score-groups/${id}`);
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete group'));
    }
  },

  getList: async (filters: TaskScoreListFilters): Promise<TaskScoreListResponse> => {
    const params = TaskScoreListFiltersSchema.parse(filters);

    if (env.useTaskScoresMock) {
      return TaskScoreListResponseSchema.parse(await mockGetTaskScoreList(params));
    }

    const response = await api.get('/task-scores', { params });
    return TaskScoreListResponseSchema.parse(response.data);
  },

  create: async (payload: CreateTaskScoreRequest): Promise<TaskScore> => {
    const data = CreateTaskScoreRequestSchema.parse(payload);

    if (env.useTaskScoresMock) {
      return TaskScoreSchema.parse(await mockCreateTaskScore(data));
    }

    try {
      const response = await api.post('/task-scores', data);
      return TaskScoreSchema.parse(response.data);
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Failed to create task'));
    }
  },

  update: async (id: string, payload: UpdateTaskScoreRequest): Promise<TaskScore> => {
    const data = UpdateTaskScoreRequestSchema.parse(payload);

    if (env.useTaskScoresMock) {
      return TaskScoreSchema.parse(await mockUpdateTaskScore(id, data));
    }

    try {
      const response = await api.patch(`/task-scores/${id}`, data);
      return TaskScoreSchema.parse(response.data);
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Failed to update task'));
    }
  },
};
