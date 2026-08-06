import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { overtimeApi } from '../api';
import { OT_QUERY_KEYS } from '../constants';
import type {
  AssignOtTaskRequest,
  CreateOvertimeRequest,
  OvertimeListFilters,
  OvertimeSettings,
  RejectOvertimeRequest,
  ReviewOtResultRequest,
} from '../schemas/overtime.schema';

const invalidateOvertime = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: OT_QUERY_KEYS.all });
  void queryClient.invalidateQueries({ queryKey: ['home'] });
  void queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
};

export const useOvertimeList = (filters: OvertimeListFilters = {}, enabled = true) =>
  useQuery({
    queryKey: OT_QUERY_KEYS.list(filters),
    queryFn: () => overtimeApi.getList(filters),
    enabled,
  });

export const usePendingOvertime = (enabled = true) =>
  useQuery({
    queryKey: OT_QUERY_KEYS.pending,
    queryFn: () => overtimeApi.getPending(),
    enabled,
  });

export const useOvertimeDetail = (id: string | null, enabled = true) =>
  useQuery({
    queryKey: OT_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => overtimeApi.getById(id!),
    enabled: Boolean(id) && enabled,
  });

export const useOvertimeDashboard = (year: number, month: number, enabled = true) =>
  useQuery({
    queryKey: OT_QUERY_KEYS.dashboard(year, month),
    queryFn: () => overtimeApi.getDashboard(year, month),
    enabled,
  });

export const useOvertimeSettings = (enabled = true) =>
  useQuery({
    queryKey: OT_QUERY_KEYS.settings,
    queryFn: () => overtimeApi.getSettings(),
    enabled,
  });

export const useCreateOvertime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOvertimeRequest) => overtimeApi.create(payload),
    onSuccess: () => {
      invalidateOvertime(queryClient);
      message.success('Đã tạo OT request');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không tạo được OT request');
    },
  });
};

export const useApproveOvertime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => overtimeApi.approve(id),
    onSuccess: () => {
      invalidateOvertime(queryClient);
      message.success('Đã duyệt OT');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không duyệt được OT');
    },
  });
};

export const useRejectOvertime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectOvertimeRequest }) =>
      overtimeApi.reject(id, payload),
    onSuccess: () => {
      invalidateOvertime(queryClient);
      message.success('Đã từ chối OT');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không từ chối được OT');
    },
  });
};

export const useAssignableOtTasks = (overtimeId: string | null, enabled = true) =>
  useQuery({
    queryKey: OT_QUERY_KEYS.assignableTasks(overtimeId ?? ''),
    queryFn: () => overtimeApi.getAssignableTasks(overtimeId!),
    enabled: Boolean(overtimeId) && enabled,
  });

export const useAssignOtTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignOtTaskRequest }) =>
      overtimeApi.assignTask(id, payload),
    onSuccess: (_data, variables) => {
      invalidateOvertime(queryClient);
      void queryClient.invalidateQueries({
        queryKey: OT_QUERY_KEYS.assignableTasks(variables.id),
      });
      message.success('Đã gán task OT');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không gán được task OT');
    },
  });
};

export const useReviewOtResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewOtResultRequest }) =>
      overtimeApi.reviewResult(id, payload),
    onSuccess: () => {
      invalidateOvertime(queryClient);
      message.success('Đã review kết quả OT');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không review được kết quả OT');
    },
  });
};

export const useUpdateOvertimeSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OvertimeSettings) => overtimeApi.updateSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: OT_QUERY_KEYS.settings });
      void queryClient.invalidateQueries({ queryKey: OT_QUERY_KEYS.all });
      message.success('Đã lưu cài đặt OT');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không lưu được cài đặt OT');
    },
  });
};
