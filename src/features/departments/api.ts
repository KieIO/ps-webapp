import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';
import {
  CreateDepartmentRequestSchema,
  DepartmentListResponseSchema,
  DepartmentSchema,
  UpdateDepartmentRequestSchema,
  type CreateDepartmentRequest,
  type Department,
  type DepartmentListResponse,
  type UpdateDepartmentRequest,
} from './schemas/department.schema';

export const departmentApi = {
  getList: async (): Promise<DepartmentListResponse> => {
    try {
      const response = await api.get('/departments');
      return DepartmentListResponseSchema.parse(response.data);
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Failed to load departments'));
    }
  },

  create: async (payload: CreateDepartmentRequest): Promise<Department> => {
    const data = CreateDepartmentRequestSchema.parse(payload);
    try {
      const response = await api.post('/departments', data);
      return DepartmentSchema.parse(response.data);
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Failed to create department'));
    }
  },

  update: async (id: string, payload: UpdateDepartmentRequest): Promise<Department> => {
    const data = UpdateDepartmentRequestSchema.parse(payload);
    try {
      const response = await api.patch(`/departments/${id}`, data);
      return DepartmentSchema.parse(response.data);
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Failed to update department'));
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/departments/${id}`);
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete department'));
    }
  },
};
