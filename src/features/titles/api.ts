/**
 * Backend contract: docs/TITLES_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import api from '@/shared/api/base.api';
import { env } from '@/config/env';
import {
  mockCreateJobGroup,
  mockCreateJobLevel,
  mockCreateJobTitle,
  mockDeleteJobGroup,
  mockGetJobGroupList,
  mockGetJobLevelList,
  mockGetJobTitleList,
  mockUpdateJobTitleCapacity,
} from './mock/titles.mock';
import {
  CreateJobGroupRequestSchema,
  CreateJobLevelRequestSchema,
  CreateJobTitleRequestSchema,
  JobGroupListResponseSchema,
  JobGroupSchema,
  JobLevelListResponseSchema,
  JobLevelSchema,
  JobTitleListFiltersSchema,
  JobTitleListItemSchema,
  JobTitleListResponseSchema,
  UpdateJobTitleCapacityRequestSchema,
  type CreateJobGroupRequest,
  type CreateJobLevelRequest,
  type CreateJobTitleRequest,
  type JobGroupListResponse,
  type JobLevelListResponse,
  type JobTitleListFilters,
  type JobTitleListItem,
  type JobTitleListResponse,
  type UpdateJobTitleCapacityRequest,
} from './schemas/title.schema';

export const titleApi = {
  getJobLevels: async (): Promise<JobLevelListResponse> => {
    if (env.useTitlesMock) {
      return JobLevelListResponseSchema.parse(await mockGetJobLevelList());
    }

    const response = await api.get('/job-levels');
    return JobLevelListResponseSchema.parse(response.data);
  },

  getJobGroups: async (): Promise<JobGroupListResponse> => {
    if (env.useTitlesMock) {
      return JobGroupListResponseSchema.parse(await mockGetJobGroupList());
    }

    const response = await api.get('/job-groups');
    return JobGroupListResponseSchema.parse(response.data);
  },

  getJobTitles: async (filters: JobTitleListFilters): Promise<JobTitleListResponse> => {
    const params = JobTitleListFiltersSchema.parse(filters);

    if (env.useTitlesMock) {
      return JobTitleListResponseSchema.parse(await mockGetJobTitleList(params));
    }

    const response = await api.get('/job-titles', { params });
    return JobTitleListResponseSchema.parse(response.data);
  },

  createJobLevel: async (payload: CreateJobLevelRequest) => {
    const data = CreateJobLevelRequestSchema.parse(payload);

    if (env.useTitlesMock) {
      return JobLevelSchema.parse(await mockCreateJobLevel(data));
    }

    const response = await api.post('/job-levels', data);
    return JobLevelSchema.parse(response.data);
  },

  createJobGroup: async (payload: CreateJobGroupRequest) => {
    const data = CreateJobGroupRequestSchema.parse(payload);

    if (env.useTitlesMock) {
      return JobGroupSchema.parse(await mockCreateJobGroup(data));
    }

    const response = await api.post('/job-groups', data);
    return JobGroupSchema.parse(response.data);
  },

  deleteJobGroup: async (id: string): Promise<void> => {
    if (env.useTitlesMock) {
      await mockDeleteJobGroup(id);
      return;
    }

    await api.delete(`/job-groups/${id}`);
  },

  createJobTitle: async (payload: CreateJobTitleRequest): Promise<JobTitleListItem> => {
    const data = CreateJobTitleRequestSchema.parse(payload);

    if (env.useTitlesMock) {
      return JobTitleListItemSchema.parse(await mockCreateJobTitle(data));
    }

    const response = await api.post('/job-titles', data);
    return JobTitleListItemSchema.parse(response.data);
  },

  updateJobTitleCapacity: async (
    id: string,
    payload: UpdateJobTitleCapacityRequest,
  ): Promise<JobTitleListItem> => {
    const data = UpdateJobTitleCapacityRequestSchema.parse(payload);

    if (env.useTitlesMock) {
      return JobTitleListItemSchema.parse(await mockUpdateJobTitleCapacity(id, data));
    }

    const response = await api.patch(`/job-titles/${id}/capacity`, data);
    return JobTitleListItemSchema.parse(response.data);
  },
};
