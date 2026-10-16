/**
 * Leave management API — see backend docs/LEAVE_BACKEND_TODO.md.
 */
import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';
import {
  CreateLeaveRequestSchema,
  LeavePreviewResponseSchema,
  LeaveRecordSchema,
  type CreateLeaveRequest,
  type LeavePreviewResponse,
  type LeaveRecord,
} from './schemas/leave.schema';
import { z } from 'zod';

export const leaveApi = {
  preview: async (
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<LeavePreviewResponse> => {
    const response = await api
      .get(`/users/${userId}/leave/preview`, { params: { startDate, endDate } })
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Failed to preview leave'));
      });
    return LeavePreviewResponseSchema.parse(response.data);
  },

  create: async (userId: string, payload: CreateLeaveRequest): Promise<LeaveRecord> => {
    const data = CreateLeaveRequestSchema.parse(payload);
    const response = await api.post(`/users/${userId}/leave`, data).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to schedule leave'));
    });
    return LeaveRecordSchema.parse(response.data);
  },

  listByUser: async (userId: string): Promise<LeaveRecord[]> => {
    const response = await api.get(`/users/${userId}/leave`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to load leave history'));
    });
    return z.array(LeaveRecordSchema).parse(response.data);
  },

  listOpen: async (userId: string): Promise<LeaveRecord[]> => {
    const response = await api.get(`/users/${userId}/leave/open`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to load open leave periods'));
    });
    return z.array(LeaveRecordSchema).parse(response.data);
  },

  cancel: async (userId: string) => {
    const response = await api.post(`/users/${userId}/leave/cancel`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to cancel leave'));
    });
    return response.data;
  },

  cancelByLeaveId: async (userId: string, leaveId: string) => {
    const response = await api
      .post(`/users/${userId}/leave/${leaveId}/cancel`)
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Failed to cancel leave'));
      });
    return response.data;
  },
};
