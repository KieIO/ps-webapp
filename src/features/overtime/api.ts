import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { z } from 'zod';
import {
  AssignableOtTaskSchema,
  AssignOtTaskRequestSchema,
  CreateOvertimeRequestSchema,
  OvertimeDashboardSchema,
  OvertimeListFiltersSchema,
  OvertimeRecordSchema,
  OvertimeSettingsSchema,
  RejectOvertimeRequestSchema,
  ReviewOtResultRequestSchema,
  type AssignableOtTask,
  type AssignOtTaskRequest,
  type CreateOvertimeRequest,
  type OvertimeDashboard,
  type OvertimeListFilters,
  type OvertimeRecord,
  type OvertimeSettings,
  type RejectOvertimeRequest,
  type ReviewOtResultRequest,
} from './schemas/overtime.schema';

export const overtimeApi = {
  getList: async (filters: OvertimeListFilters = {}): Promise<OvertimeRecord[]> => {
    const params = OvertimeListFiltersSchema.parse(filters);
    const response = await api.get('/overtime', { params }).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không tải được danh sách OT'));
    });
    return z.array(OvertimeRecordSchema).parse(response.data);
  },

  getPending: async (): Promise<OvertimeRecord[]> => {
    const response = await api.get('/overtime/pending').catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không tải được OT chờ duyệt'));
    });
    return z.array(OvertimeRecordSchema).parse(response.data);
  },

  getById: async (id: string): Promise<OvertimeRecord> => {
    const response = await api.get(`/overtime/${id}`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không tải được chi tiết OT'));
    });
    return OvertimeRecordSchema.parse(response.data);
  },

  create: async (payload: CreateOvertimeRequest): Promise<OvertimeRecord> => {
    const data = CreateOvertimeRequestSchema.parse(payload);
    const response = await api.post('/overtime', data).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không tạo được OT request'));
    });
    return OvertimeRecordSchema.parse(response.data);
  },

  approve: async (id: string): Promise<OvertimeRecord> => {
    const response = await api.post(`/overtime/${id}/approve`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không duyệt được OT'));
    });
    return OvertimeRecordSchema.parse(response.data);
  },

  reject: async (id: string, payload: RejectOvertimeRequest): Promise<OvertimeRecord> => {
    const data = RejectOvertimeRequestSchema.parse(payload);
    const response = await api.post(`/overtime/${id}/reject`, data).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không từ chối được OT'));
    });
    return OvertimeRecordSchema.parse(response.data);
  },

  assignTask: async (id: string, payload: AssignOtTaskRequest): Promise<OvertimeRecord> => {
    const data = AssignOtTaskRequestSchema.parse(payload);
    const response = await api.post(`/overtime/${id}/assign-task`, data).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không gán được task OT'));
    });
    return OvertimeRecordSchema.parse(response.data);
  },

  getAssignableTasks: async (id: string): Promise<AssignableOtTask[]> => {
    const response = await api.get(`/overtime/${id}/assignable-tasks`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không tải được danh sách task có thể gán'));
    });
    return z.array(AssignableOtTaskSchema).parse(response.data);
  },

  reviewResult: async (id: string, payload: ReviewOtResultRequest): Promise<OvertimeRecord> => {
    const data = ReviewOtResultRequestSchema.parse(payload);
    const response = await api
      .post(`/overtime/${id}/review-result`, data)
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Không review được kết quả OT'));
      });
    return OvertimeRecordSchema.parse(response.data);
  },

  getDashboard: async (year: number, month: number): Promise<OvertimeDashboard> => {
    const response = await api
      .get('/overtime/dashboard', { params: { year, month } })
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Không tải được dashboard OT'));
      });
    return OvertimeDashboardSchema.parse(response.data);
  },

  getSettings: async (): Promise<OvertimeSettings> => {
    const response = await api.get('/settings/ot').catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không tải được cài đặt OT'));
    });
    return OvertimeSettingsSchema.parse(response.data);
  },

  updateSettings: async (payload: OvertimeSettings): Promise<OvertimeSettings> => {
    const data = OvertimeSettingsSchema.parse(payload);
    const response = await api.put('/settings/ot', data).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Không lưu được cài đặt OT'));
    });
    return OvertimeSettingsSchema.parse(response.data);
  },
};
