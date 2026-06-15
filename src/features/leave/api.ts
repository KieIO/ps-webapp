/**
 * Leave management API — see docs/LEAVE_BACKEND_TODO.md (backend).
 * TODO(leave-cron): MarkEndedLeaves job — same doc § "Scheduled job: mark ended leaves".
 */
import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';
import axios from 'axios';
import {
  CreateLeaveRequestSchema,
  LeavePreviewResponseSchema,
  LeaveRecordSchema,
  PendingReactivationSchema,
  type CreateLeaveRequest,
  type LeavePreviewResponse,
  type LeaveRecord,
  type PendingReactivation,
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

  getActive: async (userId: string): Promise<LeaveRecord | null> => {
    try {
      const response = await api.get(`/users/${userId}/leave/active`);
      return LeaveRecordSchema.parse(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(getApiErrorMessage(error, 'Failed to load active leave'));
    }
  },

  listPendingReactivations: async (): Promise<PendingReactivation[]> => {
    const response = await api.get('/leave/pending-reactivations').catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to load pending reactivations'));
    });
    return z.array(PendingReactivationSchema).parse(response.data);
  },

  reactivate: async (userId: string) => {
    const response = await api.post(`/users/${userId}/reactivate`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to reactivate user'));
    });
    return response.data;
  },

  cancel: async (userId: string) => {
    const response = await api.post(`/users/${userId}/leave/cancel`).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to cancel leave'));
    });
    return response.data;
  },
};
