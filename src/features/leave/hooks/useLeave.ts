import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaveApi } from '../api';
import type { CreateLeaveRequest } from '../schemas/leave.schema';

export const useLeavePreview = (userId: string | null, startDate: string | null, endDate: string | null) =>
  useQuery({
    queryKey: ['leave', 'preview', userId, startDate, endDate],
    queryFn: () => leaveApi.preview(userId!, startDate!, endDate!),
    enabled: Boolean(userId && startDate && endDate),
  });

export const useCreateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: CreateLeaveRequest }) =>
      leaveApi.create(userId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      message.success('Leave scheduled successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to schedule leave');
    },
  });
};

export const useUserLeaveHistory = (userId: string) =>
  useQuery({
    queryKey: ['leave', 'history', userId],
    queryFn: () => leaveApi.listByUser(userId),
  });

export const useActiveLeave = (userId: string) =>
  useQuery({
    queryKey: ['leave', 'active', userId],
    queryFn: () => leaveApi.getActive(userId),
  });

export const usePendingReactivations = (enabled = true) =>
  useQuery({
    queryKey: ['leave', 'pending-reactivations'],
    queryFn: () => leaveApi.listPendingReactivations(),
    enabled,
  });

export const useReactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => leaveApi.reactivate(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      message.success('User reactivated successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to reactivate user');
    },
  });
};

export const useCancelLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => leaveApi.cancel(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      message.success('Leave cancelled — employee is active again');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to cancel leave');
    },
  });
};
