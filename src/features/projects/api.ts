/**
 * Projects API client.
 * Backend contract: docs/PROJECTS_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import api from '@/shared/api/base.api';
import { rethrowApiError } from '@/shared/api/apiError';
import { env } from '@/config/env';
import {
  mockArchiveProject,
  mockCreateProject,
  mockGetProjectById,
  mockDeleteProject,
  mockGetProjectHeadNameOptions,
  mockGetProjectHeadOptions,
  mockGetProjectList,
  mockGetProjectPmOptions,
  mockUnarchiveProject,
  mockUpdateProject,
} from './mock/projects.mock';
import {
  CreateProjectRequestSchema,
  ProjectListFiltersSchema,
  ProjectListDerivedSchema,
  ProjectListRecordResponseSchema,
  ProjectListResponseSchema,
  ProjectRecordSchema,
  ProjectSchema,
  UpdateProjectRequestSchema,
  type CreateProjectRequest,
  type PersonWithCode,
  type Project,
  type ProjectListFilters,
  type ProjectListResponse,
  type UpdateProjectRequest,
} from './schemas/project.schema';
import { withProjectListDefaults } from './utils/projectDefaults';

const parseProjectListResponse = (data: unknown): ProjectListResponse => {
  const parsed = ProjectListRecordResponseSchema.parse(data);
  return {
    items: parsed.items.map(withProjectListDefaults),
    total: parsed.total,
  };
};

const parseProjectResponse = (data: unknown): Project =>
  withProjectListDefaults(ProjectRecordSchema.merge(ProjectListDerivedSchema).parse(data));

export const projectApi = {
  getList: async (filters: ProjectListFilters): Promise<ProjectListResponse> => {
    const params = ProjectListFiltersSchema.parse(filters);

    if (env.useProjectsMock) {
      return ProjectListResponseSchema.parse(await mockGetProjectList(params));
    }

    const response = await api.get('/projects', { params });
    return parseProjectListResponse(response.data);
  },

  getById: async (id: string): Promise<Project> => {
    if (env.useProjectsMock) {
      return ProjectSchema.parse(await mockGetProjectById(id));
    }

    const response = await api.get(`/projects/${id}`);
    return parseProjectResponse(response.data);
  },

  getPmOptions: async (): Promise<PersonWithCode[]> => {
    if (env.useProjectsMock) {
      return mockGetProjectPmOptions();
    }

    const response = await api.get('/projects/pm-options');
    return response.data as PersonWithCode[];
  },

  getHeadNameOptions: async (): Promise<string[]> => {
    if (env.useProjectsMock) {
      return mockGetProjectHeadNameOptions();
    }

    const response = await api.get('/projects/head-name-options');
    return response.data as string[];
  },

  getHeadOptions: async (): Promise<PersonWithCode[]> => {
    if (env.useProjectsMock) {
      return mockGetProjectHeadOptions();
    }

    const response = await api.get('/projects/head-options');
    return response.data as PersonWithCode[];
  },

  create: async (payload: CreateProjectRequest): Promise<Project> => {
    const data = CreateProjectRequestSchema.parse(payload);

    if (env.useProjectsMock) {
      return ProjectSchema.parse(await mockCreateProject(data));
    }

    try {
      const response = await api.post('/projects', data);
      return parseProjectResponse(response.data);
    } catch (error) {
      return rethrowApiError(error, 'Failed to create project');
    }
  },

  update: async (id: string, payload: UpdateProjectRequest): Promise<Project> => {
    const data = UpdateProjectRequestSchema.parse(payload);

    if (env.useProjectsMock) {
      return ProjectSchema.parse(await mockUpdateProject(id, data));
    }

    try {
      const response = await api.patch(`/projects/${id}`, data);
      return parseProjectResponse(response.data);
    } catch (error) {
      return rethrowApiError(error, 'Failed to update project');
    }
  },

  delete: async (id: string, userId?: string): Promise<void> => {
    if (env.useProjectsMock) {
      return mockDeleteProject(id, userId);
    }

    await api.delete(`/projects/${id}`);
  },

  archive: async (id: string): Promise<Project> => {
    if (env.useProjectsMock) {
      return ProjectSchema.parse(await mockArchiveProject(id));
    }

    const response = await api.post(`/projects/${id}/archive`);
    return parseProjectResponse(response.data);
  },

  unarchive: async (id: string): Promise<Project> => {
    if (env.useProjectsMock) {
      return ProjectSchema.parse(await mockUnarchiveProject(id));
    }

    const response = await api.post(`/projects/${id}/unarchive`);
    return parseProjectResponse(response.data);
  },
};
